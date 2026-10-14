import { categoryLabels } from "@/lib/format";
import { GUIDE_PAGE_SIZE, feedTopics } from "@/lib/content/constants";
import type {
  Collection,
  Creator,
  FeedPost,
  FeedTopic,
  Guide,
  GuideCategory,
  SiteSettings,
  TradingPost,
} from "@/types";

/** Everything the content source returns, before hidden creators are removed. Lists are newest / first first. */
export interface ContentData {
  creators: Creator[];
  guides: Guide[];
  collections: Collection[];
  feedPosts: FeedPost[];
  tradingPosts: TradingPost[];
  settings: SiteSettings;
}

export interface GuideQuery {
  category?: GuideCategory;
  /** Free-text search over title, excerpt, category and author. */
  q?: string;
  limit?: number;
}

/**
 * The site's content with lookups. Hidden creators are removed here, together with everything
 * they posted, so every page leaves them out the same way.
 * `now` (ISO date-time) is the moment "2h ago" and "today" are worked out from.
 */
export function createContent(data: ContentData, now: string) {
  const creators = data.creators.filter((creator) => !creator.hidden);
  const visible = new Set(creators.map((creator) => creator.slug));
  const byVisible = <T extends { authorSlug: string }>(items: T[]) => items.filter((item) => visible.has(item.authorSlug));

  const guides = byVisible(data.guides);
  const feedPosts = byVisible(data.feedPosts);
  const tradingPosts = byVisible(data.tradingPosts);
  const settings = { ...data.settings, trending: byVisible(data.settings.trending) };
  const collections = data.collections;

  const getCreator = (slug: string) => creators.find((creator) => creator.slug === slug);
  const getGuide = (slug: string) => guides.find((guide) => guide.slug === slug);

  return {
    now,
    /** Today's date (UTC), e.g. "2026-10-12". */
    today: now.slice(0, 10),
    settings,
    creators,
    guides,
    collections,
    feedPosts,
    tradingPosts,

    getCreator,
    getGuide,

    /** Filter, search, then paginate the guides. */
    queryGuides({ category, q, limit = GUIDE_PAGE_SIZE }: GuideQuery) {
      const needle = q?.trim().toLowerCase();
      const matches = guides.filter((guide) => {
        if (category && guide.category !== category) return false;
        if (!needle) return true;
        const author = getCreator(guide.authorSlug)?.name ?? "";
        return [guide.title, guide.excerpt, categoryLabels[guide.category], author]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });
      return { items: matches.slice(0, limit), total: matches.length };
    },

    /** The featured guide, or the newest guide if none is featured. */
    featuredGuide(): Guide | undefined {
      return guides.find((guide) => guide.isFeatured) ?? guides[0];
    },

    /** Number of guides per category, for the sidebar. */
    countByCategory() {
      const counts = {} as Partial<Record<GuideCategory, number>>;
      for (const guide of guides) counts[guide.category] = (counts[guide.category] ?? 0) + 1;
      return counts;
    },

    /** All guides by one creator, newest first. */
    guidesByAuthor(slug: string) {
      return guides.filter((guide) => guide.authorSlug === slug);
    },

    getCollection(slug: string) {
      return collections.find((collection) => collection.slug === slug);
    },

    /** The numbered "Start here" path, in step order. */
    learningPath() {
      return collections
        .filter((collection) => collection.pathStep !== undefined)
        .sort((a, b) => (a.pathStep ?? 0) - (b.pathStep ?? 0));
    },

    countByTopic() {
      const counts = Object.fromEntries(Object.keys(feedTopics).map((key) => [key, 0])) as Record<FeedTopic, number>;
      for (const post of feedPosts) counts[post.topic] += 1;
      return counts;
    },

    /** Feed posts from the last 24 hours. */
    postsToday() {
      const at = new Date(now).getTime();
      return feedPosts.filter((post) => at - new Date(post.postedAt).getTime() < 24 * 3_600_000).length;
    },
  };
}

export type Content = ReturnType<typeof createContent>;
