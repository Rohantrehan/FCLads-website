import "server-only";

import { getGuide } from "@/data/guides";
import type { Viewer } from "@/lib/viewer";
import type { Collection, VideoSource } from "@/types";

export interface EpisodeView {
  title: string;
  minutes: number;
  /** Guide page for this episode, if the guide is visible on the site. */
  guideHref?: string;
  /** Members only. Never set for non-members, so the Loom/YouTube links stay private. */
  video?: VideoSource;
}

export interface CollectionView {
  episodes: EpisodeView[];
  isLocked: boolean;
}

/**
 * Decides what a viewer gets from a collection. Every collection is FC Lads+, so non-members get
 * the episode titles (as a preview) but none of the video links. Server only (`server-only`).
 */
export function getCollectionView(collection: Collection, viewer: Viewer): CollectionView {
  const isLocked = !viewer.isMember;
  return {
    isLocked,
    episodes: collection.episodes.map((episode) => {
      const guide = episode.guideSlug ? getGuide(episode.guideSlug) : undefined;
      return {
        title: episode.title,
        minutes: episode.minutes,
        guideHref: guide ? `/guides/${guide.slug}` : undefined,
        video: isLocked ? undefined : episode.video,
      };
    }),
  };
}
