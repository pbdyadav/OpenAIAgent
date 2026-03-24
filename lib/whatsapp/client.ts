import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import { createClient } from "@supabase/supabase-js";

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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  globalAny.whatsapp.client = client;
  globalAny.whatsapp.started = true;

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

      const myNumber = client.info?.wid?.user?.toString();

      // ✅ FIND SESSION
      const { data: session, error: sessionErr } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("phone_number", myNumber)
        .single();

      if (sessionErr || !session) {
        console.error("❌ Session not found", sessionErr);
        return;
      }

      // ✅ GET COMPANY
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", session.company_id)
        .single();

      if (!company) {
        console.error("❌ Company not found");
        return;
      }

      // ✅ CREATE CONVERSATION
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          company_id: company.id,
          channel: "whatsapp",
          visitor_id: visitor,
          status: "active",
        })
        .select()
        .single();

      // SAVE USER MESSAGE
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content: userMessage,
      });

      // ✅ AI CALL
      const res = await fetch("https://openai.imalag.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companySlug: company.slug,
          message: userMessage,
          visitorId: visitor,
          conversationId: conversation.id,
        }),
      });

      const data = await res.json();

      const aiReply = data.response || "AI error";

      // SAVE AI MESSAGE
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: aiReply,
      });

      console.log("🤖 Reply:", aiReply);

      await message.reply(aiReply);

    } catch (err) {
      console.error("❌ MESSAGE ERROR:", err);
      await message.reply("AI unavailable");
    }
  });

  await client.initialize();

  return client;
}
