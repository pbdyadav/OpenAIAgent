export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
) {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("❌ WhatsApp Cloud API Error:", JSON.stringify(errorData, null, 2));
    throw new Error(`Failed to send WhatsApp message: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function sendWhatsAppDocument(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  link: string,
  filename: string
) {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "document",
    document: {
      link: link,
      filename: filename
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("❌ WhatsApp Cloud API Error (Document):", JSON.stringify(errorData, null, 2));
    throw new Error(`Failed to send WhatsApp document: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
export async function downloadWhatsAppMedia(mediaId: string, accessToken: string): Promise<{ buffer: Buffer, mimeType: string } | null> {
  try {
    // 1. Get media URL
    const urlRes = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });
    const urlData = await urlRes.json();
    if (!urlData.url) {
      console.error("❌ Failed to get media URL:", urlData);
      return null;
    }

    // 2. Download media
    const mediaRes = await fetch(urlData.url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (!mediaRes.ok) {
      console.error("❌ Failed to download media:", mediaRes.status);
      return null;
    }

    const mimeType = mediaRes.headers.get("content-type") || "audio/ogg";
    const arrayBuffer = await mediaRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { buffer, mimeType };
  } catch (error) {
    console.error("❌ Error downloading WhatsApp media:", error);
    return null;
  }
}
