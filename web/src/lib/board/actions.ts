"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import { NotAllowedError, requireStaff, type Staff } from "@/lib/board/access";
import {
  collectionInput,
  creatorInput,
  feedFields,
  feedPostInput,
  firstIssue,
  guideInput,
  renameInput,
  settingsInput,
  teamInput,
  tradingPostInput,
} from "@/lib/board/schemas";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TAG } from "@/lib/supabase/secret";

// Saves from the posting board. Every action checks the role on the server first (Server Actions can be
// called directly), then writes as the signed-in user, so row-level security checks again.

export interface SaveResult {
  ok?: boolean;
  /** Id (or slug, for creators) of the saved row. */
  id?: string;
  error?: string;
}

interface DbError {
  code?: string;
  message: string;
}

function dbMessage(error: DbError) {
  if (error.code === "23505") return "That web address is already used. Pick another one.";
  if (error.code === "23503") return "That's still used somewhere else (posts, guides or a profile). Move or delete those first.";
  if (error.code === "42501") return "You can't change this.";
  console.error("Posting board save failed", error);
  return "Couldn't save. Try again in a moment.";
}

/** Runs a save: role check, form check, write, then refresh the site. */
async function save<S extends z.ZodType>(
  schema: S,
  payload: unknown,
  options: { adminOnly?: boolean },
  write: (input: z.output<S>, staff: Staff) => Promise<{ id?: string; error?: DbError | null; missing?: boolean }>,
): Promise<SaveResult> {
  let staff: Staff;
  try {
    staff = await requireStaff(options);
  } catch (error) {
    if (error instanceof NotAllowedError) return { error: "You don't have access to this." };
    throw error;
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const result = await write(parsed.data, staff);
  if (result.error) return { error: dbMessage(result.error) };
  if (result.missing) return { error: "This post doesn't exist any more, or it isn't yours." };
  updateTag(CONTENT_TAG);
  return { ok: true, id: result.id };
}

/** Creators always post as themselves; admins pick the creator. */
const authorFor = (staff: Staff, requested: string) => (staff.isAdmin ? requested : (staff.creatorSlug ?? ""));

/** Insert, or update the row with `id`. Returns the id, or `missing` if nothing matched (not found or not allowed). */
async function upsert(table: string, row: Record<string, unknown>, id?: string, key = "id") {
  const supabase = await createClient();
  const query = id
    ? supabase.from(table).update(row).eq(key, id).select(key).maybeSingle()
    : supabase.from(table).insert(row).select(key).single();
  const { data, error } = await query;
  if (error) return { error };
  if (!data) return { missing: true };
  return { id: String((data as unknown as Record<string, unknown>)[key]) };
}

export async function saveTradingPost(payload: unknown) {
  return save(tradingPostInput, payload, {}, (input, staff) =>
    upsert(
      "trading_posts",
      {
        status: input.status,
        access: input.access,
        author_slug: authorFor(staff, input.authorSlug),
        posted_at: input.postedAt,
        title: input.title,
        text: input.text,
        image: input.image,
      },
      input.id,
    ),
  );
}

export async function saveFeedPost(payload: unknown): Promise<SaveResult> {
  const base = feedPostInput.safeParse(payload);
  if (!base.success) return { error: firstIssue(base.error) };
  // The fields depend on the post type.
  const fields = feedFields[base.data.postType].safeParse(base.data.fields);
  if (!fields.success) return { error: firstIssue(fields.error) };

  return save(feedPostInput, payload, {}, (input, staff) =>
    upsert(
      "feed_posts",
      {
        status: input.status,
        post_type: input.postType,
        topic: input.topic,
        // Only trading targets can be locked.
        access: input.postType === "trading" ? input.access : "free",
        author_slug: authorFor(staff, input.authorSlug),
        posted_at: input.postedAt,
        fields: fields.data,
      },
      input.id,
    ),
  );
}

export async function saveGuide(payload: unknown) {
  return save(guideInput, payload, {}, (input, staff) =>
    upsert(
      "guides",
      {
        status: input.status,
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        category: input.category,
        format: input.format,
        minutes: input.minutes,
        access: input.access,
        author_slug: authorFor(staff, input.authorSlug),
        published_at: input.publishedAt,
        is_new: input.isNew,
        // Only admins pick the featured guide (it's the big one on /learn).
        ...(staff.isAdmin ? { is_featured: input.isFeatured } : {}),
        video: input.videoLink,
        image: input.image,
        highlight: input.highlight ?? null,
        patch: input.patch ?? null,
        preset_code: input.presetCode ?? null,
        intro: input.intro,
        body: input.body,
      },
      input.id,
    ),
  );
}

export async function saveCollection(payload: unknown) {
  return save(collectionInput, payload, { adminOnly: true }, (input) =>
    upsert(
      "collections",
      {
        status: input.status,
        slug: input.slug,
        sort_order: input.sortOrder,
        title: input.title,
        description: input.description,
        season: input.season ?? null,
        video_count: input.videoCount,
        badge: input.badge,
        path_step: input.pathStep,
        category: input.category,
        episodes: input.episodes.map(({ videoLink, guideSlug, ...episode }) => ({
          ...episode,
          ...(guideSlug ? { guideSlug } : {}),
          ...(videoLink ? { video: videoLink } : {}),
        })),
      },
      input.id,
    ),
  );
}

export async function saveCreator(payload: unknown) {
  return save(creatorInput, payload, { adminOnly: true }, (input) =>
    upsert(
      "creators",
      {
        ...(input.isNew ? { slug: input.slug } : {}),
        hidden: input.hidden,
        sort_order: input.sortOrder,
        name: input.name,
        initials: input.initials.toUpperCase(),
        role: input.role,
        tagline: input.tagline,
        country: input.country,
        country_code: input.countryCode.toUpperCase(),
        ovr: input.ovr,
        card_position: input.cardPosition,
        ratings: input.ratings,
        badge: input.badge ?? null,
        rank_label: input.rankLabel ?? null,
        highlight: input.highlight,
        bio: input.bio ?? null,
        socials: Object.fromEntries(Object.entries(input.socials).filter(([, url]) => url)),
        audience: input.audience,
        review_specialty: input.reviewSpecialty ?? null,
        since: input.since,
        image: input.image,
      },
      input.isNew ? undefined : input.slug,
      "slug",
    ),
  );
}

export async function saveSettings(payload: unknown) {
  return save(settingsInput, payload, { adminOnly: true }, async (input) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .update({
        current_patch: input.currentPatch,
        current_season: input.currentSeason,
        theme_color: input.themeColor,
        trending: input.trending,
        plus: input.plus,
        socials: input.socials,
        hard_truth: input.hardTruth,
        discord: input.discord,
      })
      .eq("id", 1)
      .select("id")
      .maybeSingle();
    return error ? { error } : { missing: !data, id: "1" };
  });
}

const deletable = {
  trading: { table: "trading_posts", key: "id", adminOnly: false },
  feed: { table: "feed_posts", key: "id", adminOnly: false },
  guides: { table: "guides", key: "id", adminOnly: false },
  collections: { table: "collections", key: "id", adminOnly: true },
  creators: { table: "creators", key: "slug", adminOnly: true },
} as const;

export type DeletableKind = keyof typeof deletable;

export async function deleteItem(kind: DeletableKind, id: string): Promise<SaveResult> {
  const target = deletable[kind];
  if (!target || typeof id !== "string" || !id) return { error: "Nothing to delete." };
  try {
    await requireStaff({ adminOnly: target.adminOnly });
  } catch (error) {
    if (error instanceof NotAllowedError) return { error: "You don't have access to this." };
    throw error;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from(target.table).delete().eq(target.key, id).select(target.key);
  if (error) return { error: dbMessage(error) };
  if (!data?.length) return { error: "This doesn't exist any more, or it isn't yours." };
  updateTag(CONTENT_TAG);
  return { ok: true };
}

const teamErrors: Record<string, string> = {
  no_account: "No account with that email. Ask them to sign up on the site first.",
  own_role: "You can't change your own role.",
  no_creator: "That creator profile doesn't exist.",
  creator_needed: "Pick the creator profile they post as.",
};

export async function setTeamRole(payload: unknown): Promise<SaveResult> {
  try {
    await requireStaff({ adminOnly: true });
  } catch (error) {
    if (error instanceof NotAllowedError) return { error: "You don't have access to this." };
    throw error;
  }
  const parsed = teamInput.safeParse(payload);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_team_role", {
    p_email: parsed.data.email,
    p_role: parsed.data.role,
    p_creator_slug: parsed.data.role === "member" ? null : (parsed.data.creatorSlug ?? null),
  });
  if (error) return { error: teamErrors[error.message] ?? dbMessage(error) };
  return { ok: true };
}

const renameErrors: Record<string, string> = {
  bad_name: "Use 2–20 letters, numbers or spaces, and make the new name different from the old one.",
};

/** Swaps one game name for another (e.g. "FC 27" → "FC 28") in all content, and makes it the current season. */
export async function renameGame(payload: unknown): Promise<SaveResult> {
  try {
    await requireStaff({ adminOnly: true });
  } catch (error) {
    if (error instanceof NotAllowedError) return { error: "You don't have access to this." };
    throw error;
  }
  const parsed = renameInput.safeParse(payload);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rename_game", { p_from: parsed.data.from, p_to: parsed.data.to });
  if (error) return { error: renameErrors[error.message] ?? dbMessage(error) };
  updateTag(CONTENT_TAG);
  return { ok: true, id: String(data ?? 0) };
}
