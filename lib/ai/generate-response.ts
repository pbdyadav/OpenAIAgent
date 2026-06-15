import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIResponse(
  message: string,
  companyName: string,
  knowledge: string,
  catalogData: string = "",
  audioData?: { buffer: Buffer; mimeType: string } | null
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "AI service is not configured.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are a professional AI assistant for ${companyName}.

PRIORITY INSTRUCTIONS:
1. First, check if the user is asking about your products, services, pricing, portfolio, or brochures. If so, answer using the 'Product & Service Catalog' JSON below.
2. Second, use the 'Company Knowledge' to answer generic questions.
3. If an item in the Catalog has a 'pdf_url', you MUST explicitly provide that URL in your reply as "Download Brochure: [URL]".
4. If the user sent an audio message, you MUST return your response strictly in the following format:
TRANSCRIPT: [Exact transcription of the user's voice message]
REPLY: [Your response to their question]
5. If no audio was sent, just return your normal reply.
6. If the answer is not found in either section, reply: "I don't have that information. Please contact the company directly."

Product & Service Catalog:
${catalogData || "No catalog items found."}

Company Knowledge:
${knowledge || "No knowledge documents provided."}

User Question:
${message}
`;

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ];

  let lastError = null;
  
  const contentParts: any[] = [{ text: prompt }];
  if (audioData) {
    contentParts.push({
      inlineData: {
        data: audioData.buffer.toString("base64"),
        mimeType: audioData.mimeType
      }
    });
  }

  for (const modelName of fallbackModels) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(contentParts);
        return result.response.text();
      } catch (error: any) {
        lastError = error;
        console.error(`AI Error [${modelName} - attempt ${attempt}]:`, error?.message || error);
        
        if (attempt < 3) {
          const backoff = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(`Waiting ${backoff}ms before retrying...`);
          await sleep(backoff);
        }
      }
    }
  }

  console.error("All AI retries and fallbacks failed. Last error:", lastError);
  return "Our AI assistant is temporarily unavailable. Please try again later.";
}
