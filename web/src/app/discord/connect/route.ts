import { NextResponse, type NextRequest } from "next/server";
import { DISCORD_STATE_COOKIE, discordAuthorizeUrl, isDiscordConfigured } from "@/lib/discord";
import { siteUrlFrom } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

// "Connect Discord" buttons land here: a signed-in FC Lads+ member is sent to Discord's sign-in page, with a
// one-time state in a cookie so the callback knows the answer belongs to this browser.
export async function GET(request: NextRequest) {
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  // Link prefetches must never start a sign-in (same as /join).
  if (request.headers.has("rsc") || request.headers.get("purpose") === "prefetch") {
    return new NextResponse(null, { status: 204 });
  }

  const viewer = await getViewer();
  if (!viewer.isSignedIn) return go("/login?next=/discord/connect");
  if (!viewer.isMember) return go("/lads-plus");
  if (!isDiscordConfigured) return go("/dashboard/discord?discord=unavailable");

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(discordAuthorizeUrl(state, `${siteUrlFrom(request)}/discord/callback`), 303);
  response.cookies.set(DISCORD_STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/discord",
    maxAge: 600,
  });
  return response;
}
