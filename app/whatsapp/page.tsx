"use client";

import { useEffect, useState } from "react";

export default function WhatsAppQR() {

  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {

    async function loadQR() {

      const res = await fetch("/api/whatsapp/qr");

      const data = await res.json();

      setQr(data.qr);

    }

    loadQR();

  }, []);

  return (
    <div style={{padding:40}}>

      <h1>Scan WhatsApp QR</h1>

      {qr ? (
        <img src={qr} width={300} />
      ) : (
        <p>Generating QR...</p>
      )}

    </div>
  );
}
