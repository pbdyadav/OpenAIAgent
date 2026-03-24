import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {

    // destroy client
    if ((globalThis as any).client) {
      await (globalThis as any).client.destroy();
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

    (globalThis as any).whatsappStatus = "disconnected";
    (globalThis as any).latestQR = null;
    (globalThis as any).client = null;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" });
  }
}
