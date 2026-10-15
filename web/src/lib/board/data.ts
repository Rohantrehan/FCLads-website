import "server-only";

import { notFound } from "next/navigation";
import type {
  CollectionRow,
  CreatorRow,
  FeedPostRow,
  GuideRow,
  SiteSettingsRow,
  TradingPostRow,
} from "@/lib/content/rows";
import { createClient } from "@/lib/supabase/server";

// Reads for the posting board, as the signed-in user: row-level security only returns what they may
// edit (creators: their own posts; admins: everything), drafts and scheduled posts included.

function check<T>({ data, error }: { data: T | null; error: { message: string } | null }, what: string): T {
  if (error) throw new Error(`Couldn't load ${what}: ${error.message}`);
  return data as T;
}

export async function listTradingPosts() {
  const supabase = await createClient();
  return check<TradingPostRow[]>(
    await supabase.from("trading_posts").select("*").order("posted_at", { ascending: false }).limit(200),
    "trading posts",
  );
}

export async function listFeedPosts() {
  const supabase = await createClient();
  return check<FeedPostRow[]>(
    await supabase.from("feed_posts").select("*").order("posted_at", { ascending: false }).limit(200),
    "feed posts",
  );
}

export async function listGuides() {
  const supabase = await createClient();
  return check<Omit<GuideRow, "intro" | "body">[]>(
    await supabase
      .from("guides")
      .select("id, slug, status, title, excerpt, category, format, minutes, access, author_slug, published_at, is_new, is_featured, video, image, highlight, patch, preset_code, updated_at")
      .order("published_at", { ascending: false })
      .limit(500),
    "guides",
  );
}

export async function listCollections() {
  const supabase = await createClient();
  return check<CollectionRow[]>(await supabase.from("collections").select("*").order("sort_order").order("title"), "collections");
}

export async function listCreators() {
  const supabase = await createClient();
  return check<CreatorRow[]>(await supabase.from("creators").select("*").order("sort_order").order("name"), "creators");
}

/** One row by id (or slug), or the 404 page when it doesn't exist or isn't theirs. */
async function getOne<T>(table: string, value: string, key = "id") {
  if (key === "id" && !/^[0-9a-f-]{36}$/i.test(value)) notFound();
  const supabase = await createClient();
  const row = check<T | null>(await supabase.from(table).select("*").eq(key, value).maybeSingle(), table);
  if (!row) notFound();
  return row;
}

export const getTradingPost = (id: string) => getOne<TradingPostRow>("trading_posts", id);
export const getFeedPost = (id: string) => getOne<FeedPostRow>("feed_posts", id);
export const getGuide = (id: string) => getOne<GuideRow>("guides", id);
export const getCollection = (id: string) => getOne<CollectionRow>("collections", id);
export const getCreatorRow = (slug: string) => getOne<CreatorRow>("creators", slug, "slug");

export async function getSettings() {
  const supabase = await createClient();
  return check<SiteSettingsRow | null>(await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(), "settings");
}

export interface TeamMember {
  id: string;
  email: string;
  display_name: string | null;
  role: "creator" | "admin";
  creator_slug: string | null;
}

export async function listTeam() {
  const supabase = await createClient();
  return check<TeamMember[]>(await supabase.rpc("list_team"), "the team");
}

/** Creator names for "Posted by" pickers and lists. */
export async function creatorChoices() {
  const creators = await listCreators();
  // Hidden creators last, so a new post doesn't default to someone who isn't shown on the site.
  return [...creators]
    .sort((a, b) => Number(a.hidden) - Number(b.hidden))
    .map((creator) => ({ slug: creator.slug, name: creator.hidden ? `${creator.name} (hidden)` : creator.name }));
}

/** slug → name, for list lines. */
export const nameLookup = (creators: { slug: string; name: string }[]) => (slug: string) =>
  creators.find((creator) => creator.slug === slug)?.name ?? slug;
