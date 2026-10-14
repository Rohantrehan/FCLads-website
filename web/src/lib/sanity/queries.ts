import "server-only";

import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import type { ContentData } from "@/lib/content/content";
import { sanityFetch, sanityProject } from "@/lib/sanity/client";
import type { Collection, Creator, FeedPost, Guide, GuideBlock, GuideContent, TradingPost } from "@/types";

// GROQ queries for the Studio's document types (studio/schemaTypes) and the mapping from Sanity
// documents to the site's types. Only published documents are read.

const images = createImageUrlBuilder(sanityProject);

/** Image URL from Sanity's image CDN, resized and in a modern format. */
const imageUrl = (source: SanityImageSource | null | undefined, width: number) =>
  source ? images.image(source).width(width).fit("max").auto("format").url() : undefined;

/** GROQ returns null for empty fields; the site's types use undefined. */
function dropNulls<T>(value: T): T {
  if (Array.isArray(value)) return value.map(dropNulls) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== null).map(([key, item]) => [key, dropNulls(item)]),
    ) as T;
  }
  return value;
}

const authored = "defined(author->slug.current)";

const CATALOG_QUERY = /* groq */ `{
  "creators": *[_type == "creator" && defined(slug.current)] | order(order asc, name asc) {
    "slug": slug.current, hidden, name, initials, role, tagline, country, countryCode, ovr, cardPosition,
    ratings { gam, tac, trd, meta }, badge, rankLabel, highlight { label, value }, bio, socials,
    audience[] { platform, count }, since, image
  },
  "guides": *[_type == "guide" && defined(slug.current) && ${authored}] | order(publishedAt desc) {
    "slug": slug.current, title, excerpt, category, format, minutes, access, "authorSlug": author->slug.current,
    publishedAt, isNew, isFeatured, "video": select(defined(video.provider) && defined(video.id) => video { provider, id }), image
  },
  "collections": *[_type == "collection" && defined(slug.current)] | order(order asc, title asc) {
    "slug": slug.current, title, description, season, videoCount, badge, pathStep, category,
    episodes[] { title, minutes, "guideSlug": guide->slug.current, "video": select(defined(video.provider) && defined(video.id) => video { provider, id }) }
  },
  "feedPosts": *[_type == "feedPost" && ${authored}] | order(postedAt desc) {
    "id": _id, "type": postType, topic, "authorSlug": author->slug.current, postedAt, access,
    title, excerpt, minutes, views, approval, youtubeId, "guideSlug": guide->slug.current,
    points, targets[] { card, buyBelow }, freeTargets, text, label, question, options[] { label, votes }
  },
  "tradingPosts": *[_type == "tradingPost" && ${authored}] | order(postedAt desc) {
    "id": _id, "authorSlug": author->slug.current, postedAt, access, title, text, image { asset, crop, hotspot, alt }
  },
  "settings": *[_id == "siteSettings"][0] {
    currentPatch, currentSeason, trending[] { title, href, "authorSlug": author->slug.current, views }
  }
}`;

type Raw<T, Image = SanityImageSource> = Omit<T, "image"> & { image?: Image };

interface CatalogResult {
  creators: Raw<Creator>[];
  guides: Raw<Guide>[];
  collections: (Omit<Collection, "season" | "videoCount"> & { season?: string; videoCount?: number })[];
  feedPosts: (Record<string, unknown> & { type: FeedPost["type"] })[];
  tradingPosts: Raw<TradingPost, SanityImageSource & { alt?: string }>[];
  settings?: Partial<ContentData["settings"]>;
}

/** Turns a feed post document into the site's shape for its type. Posts missing their main field are skipped. */
function toFeedPost(raw: CatalogResult["feedPosts"][number]): FeedPost | undefined {
  const base = {
    id: String(raw.id),
    topic: raw.topic,
    authorSlug: raw.authorSlug,
    postedAt: raw.postedAt,
    access: raw.access === "plus" ? "plus" : "free",
  } as Pick<FeedPost, "id" | "topic" | "authorSlug" | "postedAt" | "access">;
  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : undefined);
  const list = <T,>(key: string) => (Array.isArray(raw[key]) ? (raw[key] as T[]) : []);

  switch (raw.type) {
    case "video": {
      const title = text("title");
      if (!title) return undefined;
      return {
        ...base,
        type: "video",
        title,
        excerpt: text("excerpt") ?? "",
        minutes: Number(raw.minutes ?? 0),
        views: raw.views as number | undefined,
        approval: raw.approval as number | undefined,
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
      return { ...base, type: "trading", title, targets, freeTargets: Number(raw.freeTargets ?? targets.length) };
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

/** Everything except guide bodies, in one request. */
export async function fetchCatalog(): Promise<ContentData> {
  const data = dropNulls(await sanityFetch<CatalogResult>(CATALOG_QUERY));
  const currentSeason = data.settings?.currentSeason ?? "";

  return {
    creators: data.creators.map((creator) => ({
      ...creator,
      socials: creator.socials ?? {},
      image: imageUrl(creator.image, 800),
    })),
    guides: data.guides.map((guide) => ({ ...guide, image: imageUrl(guide.image, 1200) })),
    collections: data.collections.map((collection) => ({
      ...collection,
      season: collection.season ?? currentSeason,
      episodes: collection.episodes ?? [],
      videoCount: collection.videoCount ?? collection.episodes?.length ?? 0,
    })),
    feedPosts: data.feedPosts.map(toFeedPost).filter((post): post is FeedPost => post !== undefined),
    tradingPosts: data.tradingPosts.map((post) => {
      const src = imageUrl(post.image, 1200);
      return { ...post, image: src ? { src, alt: post.image?.alt ?? "" } : undefined };
    }),
    settings: {
      currentPatch: data.settings?.currentPatch ?? "",
      currentSeason,
      trending: (data.settings?.trending ?? []).filter((item) => item.authorSlug),
    },
  };
}

const GUIDE_CONTENT_QUERY = /* groq */ `*[_type == "guide" && slug.current == $slug][0] {
  "slug": slug.current, highlight, patch, presetCode, intro, body
}`;

type RawBlock =
  | { _type: "guideParagraph"; text?: string }
  | { _type: "guideSection"; title?: string }
  | { _type: "guideSteps"; items?: { title: string; text: string }[] }
  | { _type: "guideTip"; label?: string; title?: string; text?: string }
  | { _type: "guideControls"; title?: string; inputs?: string[]; result?: string; note?: string; successRate?: string }
  | { _type: "membersOnlyBreak" };

interface GuideContentResult {
  slug: string;
  highlight?: string;
  patch?: string;
  presetCode?: string;
  intro?: string[];
  body?: RawBlock[];
}

/** "Beat the 71-depth press!" → "beat-the-71-depth-press" */
const anchor = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-") || "section";

/** Turns the Studio's guide body into blocks. A "Members-only from here" marker sets `lockedFrom`. */
export function toGuideBlocks(body: RawBlock[]) {
  const blocks: GuideBlock[] = [];
  const usedIds = new Set<string>();
  let lockedFrom: number | undefined;

  for (const block of body) {
    switch (block._type) {
      case "guideParagraph":
        if (block.text) blocks.push({ type: "p", text: block.text });
        break;
      case "guideSection": {
        if (!block.title) break;
        let id = anchor(block.title);
        for (let n = 2; usedIds.has(id); n += 1) id = `${anchor(block.title)}-${n}`;
        usedIds.add(id);
        blocks.push({ type: "section", id, title: block.title });
        break;
      }
      case "guideSteps":
        if (block.items?.length) blocks.push({ type: "steps", items: block.items });
        break;
      case "guideTip":
        if (block.title && block.text) blocks.push({ type: "tip", label: block.label, title: block.title, text: block.text });
        break;
      case "guideControls":
        if (block.inputs?.length && block.result) {
          blocks.push({
            type: "controls",
            title: block.title ?? "Controller inputs",
            inputs: block.inputs,
            result: block.result,
            note: block.note,
            successRate: block.successRate,
          });
        }
        break;
      case "membersOnlyBreak":
        lockedFrom ??= blocks.length;
        break;
    }
  }
  return { blocks, lockedFrom };
}

/** A guide's article, or undefined when the guide has no intro or body yet. */
export async function fetchGuideContent(slug: string): Promise<GuideContent | undefined> {
  const raw = await sanityFetch<GuideContentResult | null>(GUIDE_CONTENT_QUERY, { slug });
  if (!raw) return undefined;
  const data = dropNulls(raw);
  const { blocks, lockedFrom } = toGuideBlocks(data.body ?? []);
  const intro = data.intro ?? [];
  if (!intro.length && !blocks.length) return undefined;
  return {
    slug: data.slug,
    highlight: data.highlight,
    patch: data.patch,
    presetCode: data.presetCode,
    intro,
    blocks,
    lockedFrom,
  };
}
