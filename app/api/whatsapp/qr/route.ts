import { startWhatsApp } from "@/lib/whatsapp/client";

export async function GET() {
  await startWhatsApp();

  const globalAny = globalThis as any;

  return Response.json({
    qr: globalAny.whatsapp.qr,
    status: globalAny.whatsapp.status,
  });
}
