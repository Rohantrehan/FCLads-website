import { NextResponse, type NextRequest } from "next/server";
import { dodo, syncSubscription } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

// Dodo sends people back here after checkout with ?subscription_id=…&status=…. The subscription is
// fetched from Dodo (the query string is never trusted) and saved straight away, so access starts
// without waiting for the webhook.
export async function GET(request: NextRequest) {
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);
  const subscriptionId = request.nextUrl.searchParams.get("subscription_id");
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return go("/login?next=/account/membership");
  if (!subscriptionId || !dodo) return go("/lads-plus");

  try {
    const subscription = await dodo.subscriptions.retrieve(subscriptionId);
    if (subscription.metadata?.user_id !== viewer.id) return go("/account/membership");
    await syncSubscription(subscription);
    return go(subscription.status === "active" ? "/account/membership?welcome=1" : "/account/membership?checkout=failed");
  } catch (error) {
    console.error("[payments] checkout return failed", error);
    // The webhook still brings the membership in a moment later.
    return go("/account/membership?welcome=1");
  }
}
