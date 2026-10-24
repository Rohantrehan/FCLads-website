import { NextResponse, type NextRequest } from "next/server";
import { DISCORD_STATE_COOKIE, discordAccountFromCode, isDiscordConfigured, joinServer, saveDiscordLink } from "@/lib/discord";
import { siteUrlFrom } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

// Discord sends people back here after its sign-in page with ?code=…&state=…. The state must match the
// cookie set by /discord/connect. The member is added to the server (or, if already in it, given the
// role) straight away. Connecting again repairs a missing role, e.g. after leaving and rejoining.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const viewer = await getViewer();
  const back = viewer.isMember ? "/dashboard/discord" : "/account/membership";
  const go = (result: string) => {
    const response = NextResponse.redirect(new URL(`${back}?discord=${result}`, request.url), 303);
    response.cookies.delete({ name: DISCORD_STATE_COOKIE, path: "/discord" });
    return response;
  };

  if (!viewer.isSignedIn || !viewer.id) return NextResponse.redirect(new URL("/login?next=/discord/connect", request.url), 303);
  if (!isDiscordConfigured) return go("unavailable");
  if (!viewer.isMember) return go("members-only");
  const state = request.cookies.get(DISCORD_STATE_COOKIE)?.value;
  if (!state || params.get("state") !== state) return go("error");
  // They pressed Cancel on Discord's page.
  const code = params.get("code");
  if (!code) return go("cancelled");

  try {
    const account = await discordAccountFromCode(code, `${siteUrlFrom(request)}/discord/callback`);
    // Save first, so a Discord account that belongs to someone else is refused before it joins.
    await saveDiscordLink(viewer.id, account.id, account.username, false);
    const hasRole = await joinServer(account.id, account.accessToken, true);
    await saveDiscordLink(viewer.id, account.id, account.username, hasRole);
    return go("linked");
  } catch (error) {
    if (error instanceof Error && error.message === "in_use") return go("in-use");
    console.error("[discord] linking failed", error);
    return go("error");
  }
}
