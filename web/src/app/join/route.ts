import { NextResponse, type NextRequest } from "next/server";
import { getPlus } from "@/lib/content";
import { createCheckout, isPaymentsConfigured, siteUrlFrom } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

// Every "Start free trial" button lands here. Visitors sign up first (and come back here after), members
// go to their plan, everyone else is sent to Dodo's checkout.
export async function GET(request: NextRequest) {
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  // Link prefetches and in-app navigations (they carry the RSC header) must never create a checkout. An
  // empty answer makes the router load /join as a normal page instead, which lands back here.
  if (request.headers.has("rsc") || request.headers.get("purpose") === "prefetch") {
    return new NextResponse(null, { status: 204 });
  }

  const viewer = await getViewer();
  if (!viewer.isSignedIn) return go("/signup?plan=plus");
  if (viewer.isMember) return go("/account/membership");
  if (!isPaymentsConfigured) return go("/account/membership?checkout=unavailable");

  try {
    const plus = await getPlus();
    return NextResponse.redirect(await createCheckout(viewer, siteUrlFrom(request), plus.trialDays), 303);
  } catch (error) {
    console.error("[payments] checkout failed", error);
    return go("/account/membership?checkout=error");
  }
}
