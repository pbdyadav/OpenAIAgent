"use client";

import { useEffect, useState } from "react";

export default function WhatsAppQR() {

    const [qr, setQr] = useState<string | null>(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {

        const interval = setInterval(async () => {

            const res = await fetch("/api/whatsapp/qr");
            const data = await res.json();

            setStatus(data.status);

            if (data.status === "connected") {
                setQr(null);
                clearInterval(interval);
                return;
            }

            if (data.qr) {
                setQr(data.qr);
            }


        }, 2000);

        return () => clearInterval(interval);

    }, []);

    if (status === "connected") {
        return <p>✅ WhatsApp Connected Successfully</p>;
    }

    if (!qr) {
        return <p>Generating QR...</p>;
    }

    return <img src={qr} width={280} />;


    // 🟢 CONNECTED
    if (status === "connected") {
        return (
            <div className="flex flex-col items-center gap-4">

                <div className="p-4 bg-green-100 rounded-xl text-center">
                    <p className="text-green-700 font-medium">
                        ✅ WhatsApp Connected Successfully
                    </p>
                    <p className="text-sm mt-1">
                        Your WhatsApp is now working as AI for your company.
                    </p>
                </div>

                <button
                    onClick={async () => {
                        await fetch("/api/whatsapp/disconnect", {
                            method: "POST",
                        });
                        window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Disconnect WhatsApp
                </button>

            </div>
        );
    }

    // 🔴 DISCONNECTED
    if (status === "disconnected") {
        return (
            <div className="text-center">
                <p className="text-red-500">WhatsApp disconnected</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Refresh page to reconnect
                </p>
            </div>
        );
    }

    return null;
}
