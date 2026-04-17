import { NextResponse } from "next/server";
import { startWhatsApp } from "@/lib/whatsapp/client";

export async function GET() {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL;

  if (serviceUrl) {
    try {
      const qrUrl = new URL("/qr", serviceUrl).toString();
      const res = await fetch(qrUrl, { cache: "no-store" });
      const data = await res.json();

      return NextResponse.json({
        qr: data.qr ?? null,
        status: data.status ?? "idle",
      });
    } catch (error) {
      console.error("WhatsApp QR proxy error:", error);
      return NextResponse.json(
        {
          qr: null,
          status: "error",
          error: "Failed to reach WhatsApp service",
        },
        { status: 502 }
      );
    }
  }

  if (process.env.VERCEL) {
    return NextResponse.json({
      qr: null,
      status: "disabled",
    });
  }

  await startWhatsApp();

  const globalAny = globalThis as any;

  return NextResponse.json({
    qr: globalAny.whatsapp?.qr ?? null,
    status: globalAny.whatsapp?.status ?? "idle",
  });
}
