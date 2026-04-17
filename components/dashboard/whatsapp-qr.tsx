"use client";

import { useEffect, useState } from "react";

export default function WhatsAppQR() {
    const [qr, setQr] = useState<string | null>(null);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadQR = async () => {
            try {
                const res = await fetch("/api/whatsapp/qr", {
                    cache: "no-store",
                });
                const data = await res.json();

                if (!active) return;

                const nextStatus = data.status || "idle";
                setStatus(nextStatus);

                if (nextStatus === "connected") {
                    setError(null);
                    setQr(null);
                    return;
                }

                if (nextStatus === "error") {
                    setQr(null);
                    setError(data.error || "WhatsApp QR service unavailable");
                    return;
                }

                setError(null);
                setQr(data.qr || null);
            } catch (err) {
                if (!active) return;
                console.error("QR fetch error:", err);
                setError("Unable to load WhatsApp QR. Check service URL and ngrok tunnel.");
                setStatus("error");
            }
        };

        loadQR();
        const interval = setInterval(loadQR, 2500);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    // =========================
    // 🟡 DISABLED (VERCEL)
    // =========================
    if (status === "disabled") {
        return (
            <p className="text-yellow-500 text-center">
                WhatsApp service is disabled on cloud. Running on private server.
            </p>
        );
    }

    // =========================
    // 🟢 CONNECTED
    // =========================
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

    // =========================
    // 🔴 DISCONNECTED
    // =========================
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

    if (status === "error") {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
                <p className="text-sm font-medium text-destructive">
                    {error || "WhatsApp QR service unavailable"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Make sure the WhatsApp service is running and the ngrok URL is set in the main app env.
                </p>
            </div>
        );
    }

    // =========================
    // ⏳ LOADING / QR
    // =========================
    if (!qr) {
        return (
            <p className="text-muted-foreground text-center">
                Generating QR...
            </p>
        );
    }

    return <img src={qr} width={280} />;
}
