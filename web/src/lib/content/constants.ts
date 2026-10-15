import { categoryLabels } from "@/lib/format";
import type { FeedTopic, GuideCategory } from "@/types";

// Fixed lists and page sizes. The posting board offers the same choices (lib/board/options.ts).

export const GUIDE_PAGE_SIZE = 9;
export const FEED_PAGE_SIZE = 8;

export const feedTopics: Record<FeedTopic, string> = {
  gameplay: "Gameplay",
  trading: "Trading",
  updates: "Updates",
  "fut-champs": "FUT Champs",
};

export function isFeedTopic(value: unknown): value is FeedTopic {
  return typeof value === "string" && value in feedTopics;
}

export function isGuideCategory(value: unknown): value is GuideCategory {
  return typeof value === "string" && value in categoryLabels;
}
