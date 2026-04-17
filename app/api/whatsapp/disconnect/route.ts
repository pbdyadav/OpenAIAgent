import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL;

  if (serviceUrl) {
    try {
      const disconnectUrl = new URL("/disconnect", serviceUrl).toString();
      const res = await fetch(disconnectUrl, {
        method: "POST",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data.error || "Failed to disconnect WhatsApp service",
          },
          { status: res.status }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("WhatsApp disconnect proxy error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reach WhatsApp service",
        },
        { status: 502 }
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error: "WHATSAPP_SERVICE_URL is not set on this production deployment",
      },
      { status: 400 }
    );
  }

  try {
    const globalAny = globalThis as any;

    // destroy client
    if (globalAny.whatsapp?.client) {
      await globalAny.whatsapp.client.destroy();
    }

    // 🔥 delete session folders
    const authPath = path.join(process.cwd(), ".wwebjs_auth");
    const cachePath = path.join(process.cwd(), ".wwebjs_cache");

    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
    }

    if (fs.existsSync(cachePath)) {
      fs.rmSync(cachePath, { recursive: true, force: true });
    }

    if (globalAny.whatsapp) {
      globalAny.whatsapp.status = "disconnected";
      globalAny.whatsapp.qr = null;
      globalAny.whatsapp.started = false;
      globalAny.whatsapp.client = null;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" });
  }
}
