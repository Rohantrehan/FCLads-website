import type { EditorBlock } from "@/lib/content/guideBlocks";
import type {
  AccessTier,
  CollectionBadge,
  CollectionEpisode,
  CreatorSocials,
  FeedPost,
  DiscordSettings,
  FeedTopic,
  GuideCategory,
  GuideFormat,
  HardTruthItem,
  PlusSettings,
  SocialLinks,
  SocialPlatform,
  TrendingItem,
  VideoSource,
} from "@/types";

// Rows of the content tables (web/supabase/migrations/20261015000000_content.sql), as Supabase returns them.

export type PostStatus = "draft" | "published";

export interface CreatorRow {
  slug: string;
  hidden: boolean;
  sort_order: number;
  name: string;
  initials: string;
  role: string;
  tagline: string;
  country: string;
  country_code: string;
  ovr: number;
  card_position: string;
  ratings: { gam: number; tac: number; trd: number; meta: number };
  badge: string | null;
  rank_label: string | null;
  highlight: { label: string; value: string } | null;
  bio: string | null;
  socials: CreatorSocials;
  audience: { platform: SocialPlatform; count: string }[];
  review_specialty: string | null;
  since: number | null;
  image: string | null;
  card_image: string | null;
  updated_at: string;
}

export interface GuideRow {
  id: string;
  slug: string;
  status: PostStatus;
  title: string;
  excerpt: string;
  category: GuideCategory;
  format: GuideFormat;
  minutes: number;
  access: AccessTier;
  author_slug: string;
  published_at: string;
  is_new: boolean;
  is_featured: boolean;
  video: VideoSource | null;
  image: string | null;
  highlight: string | null;
  patch: string | null;
  preset_code: string | null;
  intro: string[];
  body: EditorBlock[];
  updated_at: string;
}

export interface CollectionRow {
  id: string;
  slug: string;
  status: PostStatus;
  sort_order: number;
  title: string;
  description: string;
  season: string | null;
  video_count: number | null;
  badge: CollectionBadge | null;
  path_step: number | null;
  category: GuideCategory | null;
  episodes: CollectionEpisode[];
  updated_at: string;
}

export type FeedPostType = FeedPost["type"];

export interface FeedPostRow {
  id: string;
  status: PostStatus;
  post_type: FeedPostType;
  topic: FeedTopic;
  access: AccessTier;
  author_slug: string;
  posted_at: string;
  /** The fields for the post type, e.g. { title, points } for an update. */
  fields: Record<string, unknown>;
  updated_at: string;
}

export interface TradingPostRow {
  id: string;
  status: PostStatus;
  access: AccessTier;
  author_slug: string;
  posted_at: string;
  title: string;
  text: string;
  image: { src: string; alt: string } | null;
  updated_at: string;
}

export interface SiteSettingsRow {
  current_patch: string;
  current_season: string;
  theme_color: string;
  trending: TrendingItem[];
  plus: PlusSettings;
  socials: Partial<SocialLinks>;
  hard_truth: HardTruthItem[];
  discord: DiscordSettings;
  updated_at: string;
}

/** Live on the site: published, and its date has come (a future date means scheduled). */
export const isLive = (status: PostStatus, date: string, now = Date.now()) =>
  status === "published" && new Date(date).getTime() <= now;
