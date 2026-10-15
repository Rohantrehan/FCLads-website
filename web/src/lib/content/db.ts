import "server-only";

import type { ContentData } from "@/lib/content/content";
import { toGuideBlocks } from "@/lib/content/guideBlocks";
import {
  isLive,
  type CollectionRow,
  type CreatorRow,
  type FeedPostRow,
  type GuideRow,
  type SiteSettingsRow,
  type TradingPostRow,
} from "@/lib/content/rows";
import { contentDb } from "@/lib/supabase/secret";
import type { Creator, FeedPost, GuideContent } from "@/types";

// Reads the site's content from Supabase (written on the posting board) and turns rows into the
// site's types. Only published posts whose date has come are returned.

function db() {
  if (!contentDb) throw new Error("Content database isn't configured: set SUPABASE_SECRET_KEY.");
  return contentDb;
}

/** Throws on a Supabase error so a broken read never shows as "no content". */
function rows<T>({ data, error }: { data: T[] | null; error: { message: string } | null }, table: string): T[] {
  if (error) throw new Error(`Couldn't read ${table}: ${error.message}`);
  return data ?? [];
}

const orUndefined = <T,>(value: T | null | undefined) => value ?? undefined;

function toCreator(row: CreatorRow): Creator {
  return {
    slug: row.slug,
    hidden: row.hidden,
    name: row.name,
    initials: row.initials,
    role: row.role,
    tagline: row.tagline,
    country: row.country,
    countryCode: row.country_code,
    ovr: row.ovr,
    cardPosition: row.card_position,
    ratings: row.ratings,
    badge: orUndefined(row.badge),
    rankLabel: orUndefined(row.rank_label),
    highlight: orUndefined(row.highlight),
    bio: orUndefined(row.bio),
    socials: row.socials ?? {},
    audience: row.audience,
    reviewSpecialty: orUndefined(row.review_specialty),
    since: orUndefined(row.since),
    image: orUndefined(row.image),
  };
}

/** Turns a feed post row into the site's shape for its type. Posts missing their main field are skipped. */
export function toFeedPost(row: FeedPostRow): FeedPost | undefined {
  const base = {
    id: row.id,
    topic: row.topic,
    authorSlug: row.author_slug,
    postedAt: row.posted_at,
    // Only trading targets can be locked; every other post type is free.
    access: row.post_type === "trading" && row.access === "plus" ? "plus" : "free",
  } as Pick<FeedPost, "id" | "topic" | "authorSlug" | "postedAt" | "access">;
  const fields = row.fields ?? {};
  const text = (key: string) => (typeof fields[key] === "string" && fields[key] ? (fields[key] as string) : undefined);
  const number = (key: string) => (typeof fields[key] === "number" ? (fields[key] as number) : undefined);
  const list = <T,>(key: string) => (Array.isArray(fields[key]) ? (fields[key] as T[]) : []);

  switch (row.post_type) {
    case "video": {
      const title = text("title");
      if (!title) return undefined;
      return {
        ...base,
        type: "video",
        title,
        excerpt: text("excerpt") ?? "",
        minutes: number("minutes") ?? 0,
        views: number("views"),
        approval: number("approval"),
        youtubeId: text("youtubeId"),
        guideSlug: text("guideSlug"),
      };
    }
    case "update": {
      const title = text("title");
      return title ? { ...base, type: "update", title, points: list<string>("points") } : undefined;
    }
    case "trading": {
      const title = text("title");
      if (!title) return undefined;
      const targets = list<{ card: string; buyBelow: number }>("targets");
      return { ...base, type: "trading", title, targets, freeTargets: number("freeTargets") ?? targets.length };
    }
    case "tip": {
      const body = text("text");
      return body ? { ...base, type: "tip", text: body, label: text("label") ?? "Quick tip" } : undefined;
    }
    case "poll": {
      const question = text("question");
      const options = list<{ label: string; votes?: number }>("options").map((option) => ({
        label: option.label,
        votes: option.votes ?? 0,
      }));
      return question ? { ...base, type: "poll", question, options } : undefined;
    }
    default:
      return undefined;
  }
}

const GUIDE_LIST_COLUMNS =
  "id, slug, status, title, excerpt, category, format, minutes, access, author_slug, published_at, is_new, is_featured, video, image";

type GuideListRow = Omit<GuideRow, "highlight" | "patch" | "preset_code" | "intro" | "body" | "updated_at">;

/** Everything except guide bodies. */
export async function fetchCatalog(): Promise<ContentData> {
  const client = db();
  const [creators, guides, collections, feedPosts, tradingPosts, settings] = await Promise.all([
    client.from("creators").select("*").order("sort_order").order("name"),
    client.from("guides").select(GUIDE_LIST_COLUMNS).eq("status", "published").order("published_at", { ascending: false }),
    client.from("collections").select("*").eq("status", "published").order("sort_order").order("title"),
    client.from("feed_posts").select("*").eq("status", "published").order("posted_at", { ascending: false }),
    client.from("trading_posts").select("*").eq("status", "published").order("posted_at", { ascending: false }),
    client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (settings.error) throw new Error(`Couldn't read site_settings: ${settings.error.message}`);

  const now = Date.now();
  const setting = settings.data as SiteSettingsRow | null;
  const currentSeason = setting?.current_season ?? "";

  return {
    creators: rows<CreatorRow>(creators, "creators").map(toCreator),
    guides: rows<GuideListRow>(guides, "guides")
      .filter((row) => isLive(row.status, row.published_at, now))
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        category: row.category,
        format: row.format,
        minutes: row.minutes,
        access: row.access,
        authorSlug: row.author_slug,
        publishedAt: row.published_at,
        isNew: row.is_new,
        isFeatured: row.is_featured,
        video: orUndefined(row.video),
        image: orUndefined(row.image),
      })),
    collections: rows<CollectionRow>(collections, "collections").map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      season: row.season || currentSeason,
      videoCount: row.video_count ?? row.episodes.length,
      badge: orUndefined(row.badge),
      pathStep: orUndefined(row.path_step),
      category: orUndefined(row.category),
      episodes: row.episodes,
    })),
    feedPosts: rows<FeedPostRow>(feedPosts, "feed_posts")
      .filter((row) => isLive(row.status, row.posted_at, now))
      .map(toFeedPost)
      .filter((post): post is FeedPost => post !== undefined),
    tradingPosts: rows<TradingPostRow>(tradingPosts, "trading_posts")
      .filter((row) => isLive(row.status, row.posted_at, now))
      .map((row) => ({
        id: row.id,
        authorSlug: row.author_slug,
        postedAt: row.posted_at,
        access: row.access,
        title: row.title,
        text: row.text,
        image: orUndefined(row.image),
      })),
    settings: {
      currentPatch: setting?.current_patch ?? "",
      currentSeason,
      trending: (setting?.trending ?? []).filter((item) => item.authorSlug),
    },
  };
}

/** A guide's article, or undefined when the guide isn't live or has no intro or body yet. */
export async function fetchGuideContent(slug: string): Promise<GuideContent | undefined> {
  const { data, error } = await db()
    .from("guides")
    .select("slug, status, published_at, highlight, patch, preset_code, intro, body")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Couldn't read the guide: ${error.message}`);
  const row = data as Pick<GuideRow, "slug" | "status" | "published_at" | "highlight" | "patch" | "preset_code" | "intro" | "body"> | null;
  if (!row || !isLive(row.status, row.published_at)) return undefined;

  const { blocks, lockedFrom } = toGuideBlocks(row.body ?? []);
  const intro = row.intro ?? [];
  if (!intro.length && !blocks.length) return undefined;
  return {
    slug: row.slug,
    highlight: orUndefined(row.highlight),
    patch: orUndefined(row.patch),
    presetCode: orUndefined(row.preset_code),
    intro,
    blocks,
    lockedFrom,
  };
}
