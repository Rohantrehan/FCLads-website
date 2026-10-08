import "server-only";

import { feedPosts } from "@/data/feed";
import type { Viewer } from "@/lib/viewer";
import type { FeedPost, FeedTopic } from "@/types";

/** A post as this viewer gets it. `lockedCount` = trading targets held back for members. */
export type FeedItem = FeedPost & { lockedCount?: number };

/**
 * Feed posts for this viewer, newest first. For FC Lads+ trading posts, non-members only get the
 * first `freeTargets` targets plus a count of the rest, so locked prices never reach their browser.
 */
export function queryFeed({ topic, limit }: { topic?: FeedTopic; limit: number }, viewer: Viewer) {
  const matching = feedPosts.filter((post) => !topic || post.topic === topic);
  const items: FeedItem[] = matching.slice(0, limit).map((post) => {
    if (post.type !== "trading" || post.access !== "plus" || viewer.isMember) return post;
    return {
      ...post,
      targets: post.targets.slice(0, post.freeTargets),
      lockedCount: Math.max(post.targets.length - post.freeTargets, 0),
    };
  });
  return { items, total: matching.length };
}
