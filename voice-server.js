require('dotenv').config({ path: '.env.local' });
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Please set it in the .env.local file.');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We need a helper to figure out company from the 'To' number.
// Since it's MVP, we'll try to find any company that has this number in settings, or just default to the first company.
async function getCompanyDetails(toNumber) {
    // Attempt to find company by whatsapp_number or contact_number
    // For MVP, if not matched, just get the first company.
    const { data: companies, error } = await supabase.from('companies').select('*').limit(1);
    return companies && companies.length > 0 ? companies[0] : null;
}

async function getKnowledgeBase(companyId) {
    const { data: docs } = await supabase.from('knowledge_documents').select('content').eq('company_id', companyId).eq('processed', true);
    return docs ? docs.map(d => d.content).join('\n\n') : '';
}

wss.on('connection', function connection(ws, req) {
    console.log('Client connected to the media stream.');

    let openAiWs = null;
    let streamSid = null;
    let company = null;
    let fromNumber = null;
    let toNumber = null;
    let callSessionId = null;

    let transcriptLines = [];

    // Buffer to hold audio before OpenAI connects
    let audioBuffer = [];

    const initializeOpenAI = async () => {
        openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "realtime=v1"
            }
        });

        openAiWs.on('open', async () => {
            console.log('Connected to OpenAI Realtime API');
            
            company = await getCompanyDetails(toNumber);
            const knowledge = company ? await getKnowledgeBase(company.id) : '';
            
            // Create a call session in DB
            if (company) {
                const { data } = await supabase.from('call_sessions').insert({
                    company_id: company.id,
                    phone_number: fromNumber || 'Unknown',
                }).select().single();
                
                if (data) callSessionId = data.id;
            }

            const systemPrompt = `You are a professional AI Voice Receptionist for ${company ? company.name : 'our company'}.
You can speak and understand both English and Hindi.
Use the following Knowledge Base to answer user questions:
${knowledge}

If you do not know the answer, politely state that someone from the team will get back to them. Keep your answers conversational and concise for a phone call.
At the end of the conversation, try to extract their name, and what they are looking for (requirement).`;

            const sessionUpdate = {
                type: 'session.update',
                session: {
                    turn_detection: { type: 'server_vad' },
                    input_audio_format: 'g711_ulaw',
                    output_audio_format: 'g711_ulaw',
                    voice: 'alloy',
                    instructions: systemPrompt,
                    modalities: ["text", "audio"],
                    temperature: 0.8,
                }
            };

            openAiWs.send(JSON.stringify(sessionUpdate));

            // Flush buffered audio
            for (const payload of audioBuffer) {
                openAiWs.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: payload
                }));
            }
            audioBuffer = [];
        });

        openAiWs.on('message', async (data) => {
            try {
                const response = JSON.parse(data);

                if (response.type === 'response.audio.delta' && response.delta) {
                    const audioDelta = {
                        event: 'media',
                        streamSid: streamSid,
                        media: { payload: response.delta }
                    };
                    ws.send(JSON.stringify(audioDelta));
                }

                if (response.type === 'response.audio_transcript.done') {
                    console.log('AI:', response.transcript);
                    transcriptLines.push(`AI: ${response.transcript}`);
                    if (callSessionId) {
                        await supabase.from('call_messages').insert({
                            session_id: callSessionId,
                            role: 'assistant',
                            content: response.transcript
                        });
                    }
                }

                if (response.type === 'conversation.item.input_audio_transcription.completed') {
                    console.log('User:', response.transcript);
                    transcriptLines.push(`User: ${response.transcript}`);
                    if (callSessionId) {
                        await supabase.from('call_messages').insert({
                            session_id: callSessionId,
                            role: 'user',
                            content: response.transcript
                        });
                    }
                }

            } catch (error) {
                console.error('Error processing OpenAI message:', error);
            }
        });

        openAiWs.on('close', () => {
            console.log('OpenAI connection closed.');
        });
        
        openAiWs.on('error', (err) => {
            console.error('OpenAI WebSocket Error:', err);
        });
    };

    ws.on('message', function incoming(message) {
        const msg = JSON.parse(message);
        
        if (msg.event === 'start') {
            streamSid = msg.start.streamSid;
            // The custom parameters from TwiML <Stream> are inside msg.start.customParameters
            if (msg.start.customParameters) {
                fromNumber = msg.start.customParameters.From;
                toNumber = msg.start.customParameters.To;
            }
            console.log(`Stream started: ${streamSid}, From: ${fromNumber}, To: ${toNumber}`);
            initializeOpenAI();
        } else if (msg.event === 'media') {
            if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
                const audioAppend = {
                    type: 'input_audio_buffer.append',
                    audio: msg.media.payload
                };
                openAiWs.send(JSON.stringify(audioAppend));
            } else {
                audioBuffer.push(msg.media.payload);
            }
        } else if (msg.event === 'stop') {
            console.log('Stream stopped by Twilio.');
            if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
                openAiWs.close();
            }
            
            // Generate summary and extract leads here (MVP approach: simple save)
            if (callSessionId) {
                const fullTranscript = transcriptLines.join('\n');
                supabase.from('call_sessions').update({
                    call_summary: fullTranscript.length > 0 ? 'Call completed with transcript.' : 'No interaction.',
                }).eq('id', callSessionId).then(() => console.log('Session updated.'));
                // Note: Real lead extraction could call another LLM here with the transcript.
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.close();
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Voice WebSocket Server is listening on port ${PORT}`);
});
