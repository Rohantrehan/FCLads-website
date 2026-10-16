import "server-only";

import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, type Email } from "@/lib/email/send";
import {
  reviewForCreatorEmail,
  reviewLinkFixedEmail,
  reviewNewLinkEmail,
  reviewReadyEmail,
  reviewReceivedEmail,
  welcomeEmail,
} from "@/lib/email/templates";
import { supabaseUrl } from "@/lib/supabase/server";
import { DEFAULT_THEME_COLOR } from "@/lib/theme";

// Who gets which email. Runs after the response has gone (after()), so a slow or failed email never
// holds up or undoes the action. Looks people's addresses up with the secret key (email addresses
// aren't readable through row-level security); nothing here writes to the database.

const secretKey = process.env.SUPABASE_SECRET_KEY;
const db = supabaseUrl && secretKey ? createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

/** Sends the emails once the response is finished. */
function later(build: () => Promise<Email[]>) {
  after(async () => {
    if (!db) {
      console.info("[email] not sent: SUPABASE_SECRET_KEY not set, so addresses can't be looked up");
      return;
    }
    try {
      for (const email of await build()) await sendEmail(email);
    } catch (error) {
      console.error("[email] couldn't prepare emails", error);
    }
  });
}

async function emailOf(userId: string) {
  const { data } = await db!.auth.admin.getUserById(userId);
  return data.user?.email ?? undefined;
}

async function siteColor() {
  const { data } = await db!.from("site_settings").select("theme_color").eq("id", 1).maybeSingle();
  return (data?.theme_color as string | undefined) ?? DEFAULT_THEME_COLOR;
}

async function creatorName(slug: string | null) {
  if (!slug) return undefined;
  const { data } = await db!.from("creators").select("name").eq("slug", slug).maybeSingle();
  return (data?.name as string | undefined) ?? undefined;
}

/** The accounts that post as `slug`, or every creator account when `slug` is null (any Lad). */
async function creatorAccounts(slug: string | null) {
  let query = db!.from("profiles").select("id, creator_slug, display_name").in("role", ["creator", "admin"]).not("creator_slug", "is", null);
  if (slug) query = query.eq("creator_slug", slug);
  const { data } = await query;
  const accounts = await Promise.all(
    (data ?? []).map(async (row) => ({ email: await emailOf(row.id as string), name: (await creatorName(row.creator_slug as string)) ?? (row.display_name as string) })),
  );
  return accounts.filter((account): account is { email: string; name: string } => Boolean(account.email));
}

interface RequestRow {
  member_id: string;
  member_name: string;
  requested_slug: string | null;
  creator_slug: string | null;
  focus: string;
  creator_note: string | null;
  title: string | null;
  plan: string[] | null;
}

async function request(id: string) {
  const { data } = await db!
    .from("review_requests")
    .select("member_id, member_name, requested_slug, creator_slug, focus, creator_note, title, plan")
    .eq("id", id)
    .maybeSingle();
  return (data as RequestRow | null) ?? undefined;
}

// ---- Account

/** After someone confirms their email for the first time. */
export function notifyWelcome(userId: string) {
  later(async () => {
    const { data } = await db!.auth.admin.getUserById(userId);
    const user = data.user;
    if (!user?.email) return [];
    const { data: profile } = await db!.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    const name = (profile?.display_name as string | undefined) ?? (user.user_metadata?.display_name as string | undefined) ?? "Lad";
    return [welcomeEmail(user.email, name, await siteColor())];
  });
}

// ---- Gameplay reviews

/** A member sent a match: a receipt for them, and a heads-up for the Lad they asked for (or all Lads). */
export function notifyReviewSent(requestId: string) {
  later(async () => {
    const row = await request(requestId);
    if (!row) return [];
    const [color, memberEmail, lad, creators] = await Promise.all([
      siteColor(),
      emailOf(row.member_id),
      creatorName(row.requested_slug),
      creatorAccounts(row.requested_slug),
    ]);
    return [
      ...(memberEmail ? [reviewReceivedEmail(memberEmail, row.member_name, lad, color)] : []),
      ...creators.map((creator) => reviewForCreatorEmail(creator.email, creator.name, row.member_name, row.focus, !row.requested_slug, color)),
    ];
  });
}

/** A member fixed their link after a Lad asked: tell that Lad it's back. */
export function notifyLinkFixed(requestId: string, creatorSlug: string) {
  later(async () => {
    const row = await request(requestId);
    if (!row) return [];
    const [color, creators] = await Promise.all([siteColor(), creatorAccounts(creatorSlug)]);
    return creators.map((creator) => reviewLinkFixedEmail(creator.email, creator.name, row.member_name, color));
  });
}

/** A Lad couldn't watch the match: ask the member for a new link. */
export function notifyNewLinkNeeded(requestId: string) {
  later(async () => {
    const row = await request(requestId);
    if (!row) return [];
    const [color, memberEmail, lad] = await Promise.all([siteColor(), emailOf(row.member_id), creatorName(row.creator_slug)]);
    return memberEmail ? [reviewNewLinkEmail(memberEmail, row.member_name, lad ?? "Your Lad", row.creator_note ?? "", color)] : [];
  });
}

/** The review is done: send the member their plan. */
export function notifyReviewReady(requestId: string) {
  later(async () => {
    const row = await request(requestId);
    if (!row) return [];
    const [color, memberEmail, lad] = await Promise.all([siteColor(), emailOf(row.member_id), creatorName(row.creator_slug)]);
    return memberEmail ? [reviewReadyEmail(memberEmail, row.member_name, lad ?? "Your Lad", row.title ?? "", row.plan ?? [], color)] : [];
  });
}
