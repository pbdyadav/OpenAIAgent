import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("Mode:", mode);
  console.log("Token received:", token);
  console.log("Challenge:", challenge);

  if (mode === "subscribe" && token && challenge) {
    // Find the company with this verify token
    const supabase = await createClient();
    const { data: config, error } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("verify_token", token);

    console.log("DB Result:", config);
    console.log("DB Error:", error);

    if (config && config.length > 0) {
      return new NextResponse(challenge, { status: 200 });
    }
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming messages (POST request from Meta)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract the message data from WhatsApp webhook payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "ok" });
    }

    const phoneNumberId = value.metadata?.phone_number_id;
    const messages = value.messages;

    if (!phoneNumberId || !messages || messages.length === 0) {
      return NextResponse.json({ status: "ok" });
    }

    const supabase = await createClient();

    // Find the company associated with this phone number
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*, companies(*)")
      .eq("phone_number_id", phoneNumberId)
      .eq("is_active", true)
      .single();

    if (!config) {
      console.log("[v0] No active WhatsApp config found for phone:", phoneNumberId);
      return NextResponse.json({ status: "ok" });
    }

    const companyId = config.company_id;

    // Process each message
    for (const message of messages) {
      const senderId = message.from;
      const messageText = message.text?.body || "";
      const messageId = message.id;

      // Find or create conversation
      let { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", companyId)
        .eq("visitor_id", senderId)
        .eq("channel", "whatsapp")
        .eq("status", "active")
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            company_id: companyId,
            visitor_id: senderId,
            channel: "whatsapp",
            status: "active",
          })
          .select()
          .single();
        conversation = newConv;
      }

      if (!conversation) {
        console.log("[v0] Failed to create conversation");
        continue;
      }

      // Save the incoming message
      await supabase.from("messages").insert({
        company_id: companyId,
        conversation_id: conversation.id,
        role: "user",
        content: messageText,
        metadata: { whatsapp_message_id: messageId },
      });

      // TODO: Generate AI response using the knowledge base
      // For now, we'll send a placeholder response
      const aiResponse = "Thank you for your message. This is an automated response. Our AI agent will be fully operational soon.";

      // Save AI response
      await supabase.from("messages").insert({
        company_id: companyId,
        conversation_id: conversation.id,
        role: "assistant",
        content: aiResponse,
      });

      // Send response via WhatsApp API
      await sendWhatsAppMessage(
        config.phone_number_id,
        config.access_token,
        senderId,
        aiResponse
      );

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[v0] WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[v0] WhatsApp send error:", error);
    }
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp message:", error);
  }
}
