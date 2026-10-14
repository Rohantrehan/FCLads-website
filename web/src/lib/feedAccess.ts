import "server-only";

import type { Content } from "@/lib/content";
import type { Viewer } from "@/lib/viewer";
import type { Creator, FeedPost, FeedTopic } from "@/types";

/**
 * A post as this viewer gets it, with its author. `lockedCount` = trading targets held back for members.
 * `guideHref` = the clip's full breakdown, when that guide is on the site.
 */
export type FeedItem = FeedPost & { author?: Creator; guideHref?: string; lockedCount?: number };

/**
 * Feed posts for this viewer, newest first. For FC Lads+ trading posts, non-members only get the
 * first `freeTargets` targets plus a count of the rest, so locked prices never reach their browser.
 */
export function queryFeed(
  content: Content,
  { topic, limit, author }: { topic?: FeedTopic; limit: number; author?: string },
  viewer: Viewer,
) {
  const matching = content.feedPosts.filter(
    (post) => (!topic || post.topic === topic) && (!author || post.authorSlug === author),
  );
  const items = matching.slice(0, limit).map((post): FeedItem => {
    const item: FeedItem = { ...post, author: content.getCreator(post.authorSlug) };
    if (post.type === "video" && post.guideSlug && content.getGuide(post.guideSlug)) {
      item.guideHref = `/guides/${post.guideSlug}`;
    }
    if (post.type !== "trading" || post.access !== "plus" || viewer.isMember) return item;
    return {
      ...item,
      targets: post.targets.slice(0, post.freeTargets),
      lockedCount: Math.max(post.targets.length - post.freeTargets, 0),
    } as FeedItem;
  });
  return { items, total: matching.length };
}
