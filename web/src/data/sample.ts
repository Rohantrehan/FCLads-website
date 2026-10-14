import "server-only";

import { collections } from "@/data/collections";
import { creators } from "@/data/creators";
import { feedPosts, trending } from "@/data/feed";
import { guides } from "@/data/guides";
import { tradingPosts } from "@/data/tradingPosts";
import type { ContentData } from "@/lib/content/content";

// The sample content, shown while Sanity isn't set up (no SANITY_* keys) and imported into Sanity
// as its first content by studio/scripts/seed.mjs.

/** "Now" for the sample content, so "2h ago" labels and date filters stay readable. */
export const SAMPLE_NOW = "2026-10-12T12:00:00Z";

export const sampleContent: ContentData = {
  creators,
  guides,
  collections,
  feedPosts,
  tradingPosts,
  settings: { currentPatch: "1.08", currentSeason: "FC 27", trending },
};
