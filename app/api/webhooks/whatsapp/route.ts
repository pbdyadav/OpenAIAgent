import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppMessage, downloadWhatsAppMedia, sendWhatsAppDocument } from "@/lib/whatsapp/cloud-client";
import { generateAIResponse } from "@/lib/ai/generate-response";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    // Verify the token exists in any of the company configs
    const { data: config, error } = await supabase
      .from("whatsapp_config")
      .select("company_id")
      .eq("webhook_verify_token", token)
      .maybeSingle();

    if (config && !error) {
      console.log("✅ WEBHOOK VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error("❌ WEBHOOK VERIFY FAILED: Invalid token");
      return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
    }
  }

  return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 404 });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages" && change.value.messages) {
          const phoneNumberId = change.value.metadata.phone_number_id;
          const message = change.value.messages[0];
          const contact = change.value.contacts?.[0];
          const visitorId = contact?.wa_id || message.from;

          if (message.type !== "text" && message.type !== "audio") {
            continue; // We only handle text and audio messages
          }

          let userMessage = "";
          let audioMediaId = null;

          if (message.type === "text") {
            userMessage = message.text.body;
            console.log(`🔥 CLOUD API MESSAGE RECEIVED [${phoneNumberId}]:`, userMessage);
          } else if (message.type === "audio") {
            audioMediaId = message.audio.id;
            userMessage = "[Audio Message Received]";
            console.log(`🎙️ CLOUD API AUDIO RECEIVED [${phoneNumberId}]: Media ID ${audioMediaId}`);
          }

          // 1. Lookup company based on phone_number_id
          const { data: config, error: configError } = await supabase
            .from("whatsapp_config")
            .select("company_id, access_token")
            .eq("phone_number_id", phoneNumberId)
            .maybeSingle();

          if (!config || configError) {
            console.error("❌ No config found for phone_number_id:", phoneNumberId);
            continue;
          }

          // 2. Lookup company details
          const { data: company } = await supabase
            .from("companies")
            .select("id, name")
            .eq("id", config.company_id)
            .maybeSingle();

          if (!company) continue;

          // 3. Create or get conversation
          let conversationId: string | null = null;
          const { data: conversation, error: conversationError } = await supabase
            .from("conversations")
            .insert({
              company_id: company.id,
              channel: "whatsapp",
              visitor_id: visitorId,
            })
            .select("id")
            .maybeSingle();
            
          if (conversationError) {
            console.error("❌ Conversation create error:", conversationError);
          } else if (conversation?.id) {
            conversationId = conversation.id;
          }

          let audioData = null;
          if (audioMediaId) {
            audioData = await downloadWhatsAppMedia(audioMediaId, config.access_token);
          }

          if (conversationId) {
             const payload = {
               conversation_id: conversationId,
               role: "user",
               content: userMessage,
               type: message.type,
             };
             console.log("INSERT USER MESSAGE", payload);
             const { data, error: userMsgErr } = await supabase.from("messages").insert(payload).select();
             console.log("MESSAGE INSERT DATA", data);
             if (userMsgErr) {
               console.error("MESSAGE INSERT ERROR", userMsgErr);
             }
          }

          // 4. Fetch knowledge and catalog
          const { data: knowledgeDocs } = await supabase
            .from("knowledge_documents")
            .select("content")
            .eq("company_id", company.id)
            .eq("processed", true);

          const companyKnowledge = knowledgeDocs && knowledgeDocs.length > 0
            ? knowledgeDocs.map((doc) => doc.content).join("\n\n---\n\n").slice(0, 10000)
            : "";

          const { data: catalogItems } = await supabase
            .from("catalog_items")
            .select("name, type, price, description, catalog_categories(name)")
            .eq("company_id", company.id);

          const catalogData = catalogItems && catalogItems.length > 0
            ? JSON.stringify(catalogItems, null, 2).slice(0, 5000)
            : "";

          // 5. Generate AI Response or Send PDF
          let aiReply = "Thanks for your message. Our team will get back to you shortly.";
          let transcript = null;
          let skipAI = false;

          const lowerMsg = userMessage.toLowerCase();
          const needsPdf = lowerMsg.includes("catalog") || lowerMsg.includes("brochure") || lowerMsg.includes("portfolio") || lowerMsg.includes("pdf") || lowerMsg.includes("company profile");

          if (needsPdf) {
            const { data: pdfItems } = await supabase
              .from("catalog_items")
              .select("name, pdf_url")
              .eq("company_id", company.id)
              .not("pdf_url", "is", null)
              .limit(1);

            if (pdfItems && pdfItems.length > 0) {
              const item = pdfItems[0];
              console.log("CATALOG MATCH FOUND");
              console.log("PDF URL:", item.pdf_url);
              console.log("FILE NAME:", item.name);

              try {
                await sendWhatsAppDocument(
                  phoneNumberId,
                  config.access_token,
                  visitorId,
                  item.pdf_url,
                  `${item.name}.pdf`
                );
                
                aiReply = "Here is our latest Digital IMALAG Portfolio & SaaS Catalog.";
                skipAI = true;
              } catch (docErr) {
                console.error("WhatsApp document send failed:", docErr);
              }
            } else {
              console.log("PDF retrieval failed: no catalog record or file_url null");
            }
          }

          if (!skipAI) {
            try {
              const rawReply = await generateAIResponse(
                userMessage,
                company.name || "the company",
                companyKnowledge,
                catalogData,
                audioData
              );

              if (audioMediaId && rawReply.includes("TRANSCRIPT:") && rawReply.includes("REPLY:")) {
                const parts = rawReply.split("REPLY:");
                transcript = parts[0].replace("TRANSCRIPT:", "").trim();
                aiReply = parts[1].trim();

                // Update the user message we just inserted with the transcript
                if (conversationId) {
                  await supabase
                    .from("messages")
                    .update({ transcript, content: transcript })
                    .eq("conversation_id", conversationId)
                    .eq("role", "user")
                    .order("created_at", { ascending: false })
                    .limit(1);
                }
              } else {
                aiReply = rawReply;
              }
            } catch (fallbackAiErr) {
              console.error("❌ Fallback AI failed:", fallbackAiErr);
            }
          }

          // 6. Save AI Response
          if (conversationId) {
             const payload = {
               conversation_id: conversationId,
               role: "assistant",
               content: aiReply,
             };
             console.log("INSERT AI MESSAGE", payload);
             const { data, error: aiMsgErr } = await supabase.from("messages").insert(payload).select();
             console.log("MESSAGE INSERT DATA", data);
             if (aiMsgErr) {
               console.error("MESSAGE INSERT ERROR", aiMsgErr);
             }
          }

          // 7. Update chat count
          try {
            await supabase.rpc("increment_chat_count", {
              company_id: company.id,
            });
          } catch (rpcErr) {
            console.error("❌ Failed to increment chat count:", rpcErr);
          }

          console.log("🤖 Reply:", aiReply);

          // 8. Send WhatsApp Message
          try {
            await sendWhatsAppMessage(
              phoneNumberId,
              config.access_token,
              visitorId,
              aiReply
            );
          } catch (sendErr) {
            console.error("❌ Send WhatsApp Message Error:", sendErr);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
