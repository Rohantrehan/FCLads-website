import { NextResponse } from "next/server";
import { dodo, syncSubscriptionById } from "@/lib/payments";

// Dodo Payments webhook (set in the Dodo dashboard to https://fclads.com/payments). The signature is
// checked with DODO_PAYMENTS_WEBHOOK_SECRET; then the subscription is fetched fresh from Dodo, so events
// arriving late or twice can't leave the membership wrong. Anything but a 2xx makes Dodo retry.
export async function POST(request: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!dodo || !secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const body = await request.text();
  let event;
  try {
    event = dodo.webhooks.unwrap(body, { headers: Object.fromEntries(request.headers), key: secret });
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  const data = event.data as { payload_type?: string; subscription_id?: string | null };
  const subscriptionId = data.payload_type === "Subscription" || data.payload_type === "Payment" ? data.subscription_id : null;
  if (!subscriptionId) return NextResponse.json({ ok: true, ignored: event.type });

  try {
    await syncSubscriptionById(subscriptionId);
  } catch (error) {
    console.error("[payments] webhook sync failed", event.type, error);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
