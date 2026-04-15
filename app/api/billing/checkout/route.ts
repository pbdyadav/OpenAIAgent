import { NextResponse } from "next/server";

const planKeyMap: Record<string, string> = {
  free: "FREE",
  pro: "PRO",
  pro_plus: "PRO_PLUS",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "pro";
  const envKey = `NEXT_PUBLIC_PAYMENT_URL_${planKeyMap[plan] || "PRO"}`;
  const paymentUrl =
    process.env[envKey as keyof NodeJS.ProcessEnv] ||
    process.env.NEXT_PUBLIC_PAYMENT_URL ||
    "";

  if (paymentUrl) {
    return NextResponse.redirect(paymentUrl);
  }

  return NextResponse.json(
    {
      error:
        "Payment link is not configured yet. Set NEXT_PUBLIC_PAYMENT_URL or a plan-specific payment URL.",
    },
    { status: 501 },
  );
}
