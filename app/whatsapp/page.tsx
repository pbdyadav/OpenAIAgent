"use client";

import { useEffect, useState } from "react";

export default function WhatsAppQR() {

  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    let active = true;

    async function loadQR() {
      try {
        const res = await fetch("/api/whatsapp/qr", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        const nextStatus = data.status || "idle";
        setStatus(nextStatus);

        if (nextStatus === "error") {
          setQr(null);
          setError(data.error || "Service error");
          return;
        }

        if (nextStatus === "connected") {
          setQr(null);
          setError(null);
          return;
        }

        setError(null);
        setQr(data.qr || null);
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setError("Unable to load QR");
      }
    }

    loadQR();
    const interval = setInterval(loadQR, 2500);

    return () => {
      active = false;
      clearInterval(interval);
    };

  }, []);

  return (
    <div style={{padding:40}}>

      <h1>Scan WhatsApp QR</h1>

      {status === "error" ? (
        <p>{error || "Service error"}</p>
      ) : qr ? (
        <img src={qr} width={300} />
      ) : (
        <p>Generating QR...</p>
      )}

    </div>
  );
}
