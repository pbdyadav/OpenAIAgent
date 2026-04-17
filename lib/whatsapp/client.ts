import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { generateAIResponse } from "@/lib/ai/generate-response";

const { Client, LocalAuth } = pkg;

const globalAny = globalThis as any;

// ✅ GLOBAL SINGLETON
if (!globalAny.whatsapp) {
  globalAny.whatsapp = {
    client: null,
    started: false,
    status: "idle",
    qr: null,
  };
}

// ✅ Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function startWhatsApp() {

  if (globalAny.whatsapp.started) {
    return globalAny.whatsapp.client;
  }

  console.log("🚀 Starting WhatsApp...");

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "default",
    }),
    puppeteer: {
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
}
  });

  globalAny.whatsapp.client = client;
  globalAny.whatsapp.started = true;

  async function insertMessageWithFallback(payload: Record<string, unknown>) {
    const primary = await supabase.from("messages").insert(payload);

    if (!primary.error) {
      return primary;
    }

    const errorText = `${primary.error.code || ""} ${primary.error.message || ""}`.toLowerCase();

    if (
      "company_id" in payload &&
      (errorText.includes("company_id") ||
        errorText.includes("column") ||
        errorText.includes("does not exist"))
    ) {
      const { company_id, ...fallbackPayload } = payload as any;
      return await supabase.from("messages").insert(fallbackPayload);
    }

    return primary;
  }

  // =====================
  // QR
  // =====================
  client.on("qr", async (qr: string) => {
    console.log("📲 QR GENERATED");

    const qrImage = await qrcode.toDataURL(qr);

    globalAny.whatsapp.qr = qrImage;
    globalAny.whatsapp.status = "connecting";
  });

  // =====================
  // READY (MOST IMPORTANT)
  // =====================
  client.on("ready", async () => {
    console.log("🔥 READY EVENT FIRED");

    try {
      const phoneNumber = client.info.wid.user.toString();

      console.log("✅ Connected:", phoneNumber);

      globalAny.whatsapp.qr = null;
      globalAny.whatsapp.status = "connected";

      // ✅ GET COMPANY (latest)
      const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !company) {
        console.error("❌ Company fetch error:", error);
        return;
      }

      // ✅ SAVE SESSION (CRITICAL)
      const { error: sessionError } = await supabase
        .from("whatsapp_sessions")
        .upsert(
          {
            company_id: company.id,
            phone_number: phoneNumber,
          },
          { onConflict: "phone_number" }
        );

      if (sessionError) {
        console.error("❌ Session save error:", sessionError);
      } else {
        console.log("✅ Session saved");
      }

    } catch (err) {
      console.error("❌ READY ERROR:", err);
    }
  });

  // =====================
  // DISCONNECT
  // =====================
  client.on("disconnected", () => {
    console.log("❌ Disconnected");

    globalAny.whatsapp.started = false;
    globalAny.whatsapp.status = "disconnected";
    globalAny.whatsapp.qr = null;
  });

  // =====================
  // MESSAGE (ONLY ONE LISTENER)
  // =====================
  client.on("message", async (message: any) => {

    if (message.from === "status@broadcast") return;
    if (message.from.includes("@g.us")) return;

    try {
      console.log("🔥 MESSAGE RECEIVED:", message.body);

      const userMessage = message.body;
      const visitor = message.from;
      const fallbackResponse =
        "Thanks for your message. Our team will get back to you shortly.";

      const myNumber = client.info?.wid?.user?.toString();

      let company: any = null;
      let conversationId: string | null = null;

      // ✅ FIND SESSION
      try {
        const { data: session, error: sessionErr } = await supabase
          .from("whatsapp_sessions")
          .select("*")
          .eq("phone_number", myNumber)
          .maybeSingle();

        if (sessionErr) {
          console.error("❌ Session lookup error:", sessionErr);
        }

        if (session?.company_id) {
          const { data: companyRow, error: companyErr } = await supabase
            .from("companies")
            .select("*")
            .eq("id", session.company_id)
            .maybeSingle();

          if (companyErr) {
            console.error("❌ Company lookup error:", companyErr);
          }

          company = companyRow;
        }
      } catch (lookupErr) {
        console.error("❌ Session/company lookup failed:", lookupErr);
      }

      // ✅ FALLBACK: latest company if session table is missing or empty
      if (!company) {
        const { data: latestCompany, error: latestCompanyError } = await supabase
          .from("companies")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestCompanyError) {
          console.error("❌ Latest company lookup error:", latestCompanyError);
        }

        company = latestCompany;
      }

      if (!company) {
        console.error("❌ No company found for WhatsApp message");
        await message.reply(fallbackResponse);
        return;
      }

      // ✅ FETCH KNOWLEDGE FOR BACKUP AI
      const { data: knowledgeDocs, error: knowledgeError } = await supabase
        .from("knowledge_documents")
        .select("content")
        .eq("company_id", company.id)
        .eq("processed", true);

      if (knowledgeError) {
        console.error("❌ Knowledge lookup error:", knowledgeError);
      }

      const companyKnowledge =
        knowledgeDocs && knowledgeDocs.length > 0
          ? knowledgeDocs.map((doc) => doc.content).join("\n\n---\n\n").slice(0, 15000)
          : "";

      // ✅ CREATE CONVERSATION, but do not fail the reply if DB insert fails
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          company_id: company.id,
          channel: "whatsapp",
          visitor_id: visitor,
          status: "active",
        })
        .select("id")
        .maybeSingle();

      if (conversationError) {
        console.error("❌ Conversation create error:", conversationError);
      } else if (conversation?.id) {
        conversationId = conversation.id;
      }

      if (conversationId) {
        const { error: userMessageError } = await insertMessageWithFallback({
          company_id: company.id,
          conversation_id: conversationId,
          role: "user",
          content: userMessage,
        });

        if (userMessageError) {
          console.error("❌ Save user message error:", userMessageError);
        }
      }

      // ✅ AI CALL
      let aiReply = fallbackResponse;

      const chatApiUrl =
        process.env.WHATSAPP_CHAT_API_URL ||
        process.env.CHAT_API_URL ||
        "http://localhost:3000/api/chat";

      try {
        const res = await fetch(chatApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companySlug: company.slug || company.name,
            message: userMessage,
            visitorId: visitor,
            conversationId,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("❌ Chat API non-OK:", res.status, data);
          aiReply = await generateAIResponse(
            userMessage,
            company.name || "the company",
            companyKnowledge
          );
        } else if (data.response) {
          aiReply = data.response;
        }
      } catch (chatErr) {
        console.error("❌ Chat API fetch failed:", chatErr);

        try {
          aiReply = await generateAIResponse(
            userMessage,
            company.name || "the company",
            companyKnowledge
          );
        } catch (fallbackAiErr) {
          console.error("❌ Fallback AI failed:", fallbackAiErr);
        }
      }

      if (conversationId) {
        const { error: aiMessageError } = await insertMessageWithFallback({
          company_id: company.id,
          conversation_id: conversationId,
          role: "assistant",
          content: aiReply,
        });

        if (aiMessageError) {
          console.error("❌ Save AI message error:", aiMessageError);
        }
      }

      await supabase.rpc("increment_chat_count", {
        company_id: company.id,
      });

      console.log("🤖 Reply:", aiReply);

      await message.reply(aiReply);

    } catch (err) {
      console.error("❌ MESSAGE ERROR:", err);
      try {
        await message.reply(
          "Thanks for your message. Our team will get back to you shortly."
        );
      } catch (replyErr) {
        console.error("❌ Final reply failed:", replyErr);
      }
    }
  });

  await client.initialize();

  return client;
}
