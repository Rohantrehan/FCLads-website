import "server-only";

import { adminDb } from "@/lib/supabase/admin";
import { isMemberStatus } from "@/lib/viewer";

// Discord linking for the FC Lads+ members role.
// A member connects their Discord account (OAuth: identify + guilds.join); the bot then adds them to the
// server with the members role. Whenever a membership changes (payment webhook, checkout return, cancel)
// syncDiscordRole puts the role on or takes it off, so access in Discord follows FC Lads+.
// The bot needs "Manage Roles" and "Create Invite", and its own role must sit above the members role.

const API = "https://discord.com/api/v10";

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const botToken = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const roleId = process.env.DISCORD_MEMBER_ROLE_ID;

/** One-time value that ties Discord's answer to the browser that asked (set by /discord/connect). */
export const DISCORD_STATE_COOKIE = "discord_state";

export const isDiscordConfigured = Boolean(clientId && clientSecret && botToken && guildId && roleId && adminDb);

/** Opens the server in Discord (app or browser) for someone who is already in it. */
export const discordServerUrl = guildId ? `https://discord.com/channels/${guildId}` : undefined;

export interface DiscordLink {
  discordUserId: string;
  username: string;
  roleGranted: boolean;
  linkedAt: string;
}

/** Discord's sign-in page. `state` is checked again in the callback. */
export function discordAuthorizeUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId ?? "",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds.join",
    state,
    prompt: "none",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

async function discord(path: string, init: RequestInit & { bot?: boolean; token?: string } = {}) {
  const { bot, token, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (bot) headers.set("Authorization", `Bot ${botToken}`);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (rest.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${API}${path}`, { ...rest, headers, cache: "no-store" });
}

/** Swaps the code from Discord's sign-in page for the person's Discord id, name and a short-lived token. */
export async function discordAccountFromCode(code: string, redirectUri: string) {
  const tokenResponse = await discord("/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  if (!tokenResponse.ok) throw new Error(`Discord token exchange failed (${tokenResponse.status})`);
  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token: string };

  const userResponse = await discord("/users/@me", { token: accessToken });
  if (!userResponse.ok) throw new Error(`Discord user lookup failed (${userResponse.status})`);
  const user = (await userResponse.json()) as { id: string; username: string; global_name?: string | null };
  return { accessToken, id: user.id, username: user.global_name || user.username };
}

/** Adds the person to the server (no-op if they're already in it), with the members role when given. */
export async function joinServer(discordUserId: string, accessToken: string, withRole: boolean) {
  const response = await discord(`/guilds/${guildId}/members/${discordUserId}`, {
    method: "PUT",
    bot: true,
    body: JSON.stringify({ access_token: accessToken, ...(withRole ? { roles: [roleId] } : {}) }),
  });
  if (!response.ok) throw new Error(`Discord join failed (${response.status})`);
  // 201: newly added (with the role). 204: already in the server, roles in the body are ignored.
  if (response.status === 204 && withRole) return setMemberRole(discordUserId, true);
  return withRole;
}

/**
 * Puts the members role on or takes it off. Returns whether they now have it. Someone who has left the
 * server (404) simply doesn't have it; joining again through the site gives it back.
 */
export async function setMemberRole(discordUserId: string, on: boolean) {
  const response = await discord(`/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
    method: on ? "PUT" : "DELETE",
    bot: true,
    headers: { "X-Audit-Log-Reason": on ? "FC Lads+ membership active" : "FC Lads+ membership ended" },
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Discord role change failed (${response.status})`);
  return on;
}

/** The viewer's linked Discord account, if any. */
export async function getDiscordLink(userId: string | undefined): Promise<DiscordLink | undefined> {
  if (!adminDb || !userId) return undefined;
  const { data } = await adminDb
    .from("discord_links")
    .select("discord_user_id, discord_username, role_granted, linked_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data
    ? { discordUserId: data.discord_user_id, username: data.discord_username, roleGranted: data.role_granted, linkedAt: data.linked_at }
    : undefined;
}

/** Saves the link and the role state. Fails with "in_use" if the Discord account belongs to someone else. */
export async function saveDiscordLink(userId: string, discordUserId: string, username: string, roleGranted: boolean) {
  if (!adminDb) throw new Error("Discord linking isn't configured.");
  const { data: other } = await adminDb.from("discord_links").select("user_id").eq("discord_user_id", discordUserId).maybeSingle();
  if (other && other.user_id !== userId) throw new Error("in_use");
  const { error } = await adminDb.from("discord_links").upsert({
    user_id: userId,
    discord_user_id: discordUserId,
    discord_username: username,
    role_granted: roleGranted,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Couldn't save the Discord link: ${error.message}`);
}

/** Takes the role off and forgets the Discord account. */
export async function removeDiscordLink(userId: string) {
  if (!adminDb) return;
  const link = await getDiscordLink(userId);
  if (!link) return;
  if (isDiscordConfigured) await setMemberRole(link.discordUserId, false);
  await adminDb.from("discord_links").delete().eq("user_id", userId);
}

/**
 * Makes the members role match the membership: on while FC Lads+ gives access, off otherwise. Called after
 * every membership change. Never throws: a Discord hiccup must not undo a payment update.
 */
export async function syncDiscordRole(userId: string) {
  if (!isDiscordConfigured || !adminDb) return;
  try {
    const link = await getDiscordLink(userId);
    if (!link) return;
    const { data: membership } = await adminDb.from("memberships").select("status").eq("user_id", userId).maybeSingle();
    const shouldHave = membership ? isMemberStatus(membership.status) : false;
    const has = await setMemberRole(link.discordUserId, shouldHave);
    if (has !== link.roleGranted) {
      await adminDb.from("discord_links").update({ role_granted: has, updated_at: new Date().toISOString() }).eq("user_id", userId);
    }
  } catch (error) {
    console.error("[discord] role sync failed", userId, error);
  }
}
