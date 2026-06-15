import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const from = formData.get("From");
    const to = formData.get("To");

    const wsUrl = process.env.VOICE_WEBSOCKET_URL || "wss://your-ngrok-url.ngrok.app";
    
    // TwiML to connect the call to the Media Stream
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}/media">
      <Parameter name="From" value="${from}" />
      <Parameter name="To" value="${to}" />
    </Stream>
  </Connect>
  <Pause length="40" />
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
