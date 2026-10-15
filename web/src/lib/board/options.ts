import { categoryLabels } from "@/lib/format";
import type { CollectionBadge, FeedPost, FeedTopic, GuideCategory, SocialPlatform } from "@/types";

// Fixed choices on the posting board. Keep in sync with web/src/types/index.ts and the checks in
// web/supabase/migrations/20261015000000_content.sql.

export const guideCategories = Object.entries(categoryLabels).map(([value, label]) => ({
  value: value as GuideCategory,
  label,
}));

export const feedTopicOptions: { value: FeedTopic; label: string }[] = [
  { value: "gameplay", label: "Gameplay" },
  { value: "trading", label: "Trading" },
  { value: "updates", label: "Updates" },
  { value: "fut-champs", label: "FUT Champs" },
];

export const feedPostTypes: { value: FeedPost["type"]; label: string; hint: string }[] = [
  { value: "tip", label: "Quick tip", hint: "One short tip with a label" },
  { value: "update", label: "Update", hint: "A title and bullet points" },
  { value: "video", label: "Video clip", hint: "A clip with a short description" },
  { value: "trading", label: "Trading targets", hint: "Cards with a buy-below price" },
  { value: "poll", label: "Poll", hint: "A question with answers" },
];

export const collectionBadges: { value: CollectionBadge; label: string }[] = [
  { value: "start", label: "Start here" },
  { value: "in-order", label: "Watch in order" },
  { value: "meta", label: "Meta" },
  { value: "archive", label: "Archive" },
];

export const socialPlatforms: { value: SocialPlatform; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitch", label: "Twitch" },
];

/** "Free" / "FC Lads+" labels for a post's access. */
export const accessLabels = { free: "Free (everyone)", plus: "FC Lads+ (members only)" } as const;
