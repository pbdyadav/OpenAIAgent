import { NextResponse } from "next/server";
import { startWhatsApp } from "@/lib/whatsapp/client";

export async function GET() {

  if (process.env.VERCEL) {
    return NextResponse.json({
      qr: null,
      status: "disabled",
    });
  }

  await startWhatsApp();

  const globalAny = globalThis as any;

  return NextResponse.json({
    qr: globalAny.whatsapp.qr,
    status: globalAny.whatsapp.status,
  });
}
