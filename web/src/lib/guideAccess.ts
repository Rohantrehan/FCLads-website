import "server-only";

import type { Viewer } from "@/lib/viewer";
import type { Guide, GuideBlock, GuideContent } from "@/types";

export interface TocEntry {
  id: string;
  title: string;
  number: number;
  locked: boolean;
}

export interface GuideView {
  /** Blocks this viewer may read. Locked blocks are never included. */
  blocks: GuideBlock[];
  /** Every section title (locked ones too) for the "In this guide" list. */
  toc: TocEntry[];
  /** Short faded preview shown behind the paywall. */
  teaser?: string;
  isLocked: boolean;
}

const TEASER_LENGTH = 180;

/**
 * Decides what part of a guide the viewer gets. Runs on the server only (`server-only` import),
 * so premium blocks never reach a non-member's browser.
 * Lads+ guides are fully locked even if their content has no `lockedFrom`.
 */
export function getGuideView(guide: Guide, content: GuideContent | undefined, viewer: Viewer): GuideView {
  const blocks = content?.blocks ?? [];
  const lockedFrom = guide.access === "plus" ? 0 : content?.lockedFrom;
  const isLocked = !viewer.isMember && lockedFrom !== undefined;
  const cut = isLocked ? lockedFrom : blocks.length;

  let number = 0;
  const toc: TocEntry[] = [];
  blocks.forEach((block, index) => {
    if (block.type === "section") {
      number += 1;
      toc.push({ id: block.id, title: block.title, number, locked: index >= cut });
    }
  });

  let teaser: string | undefined;
  if (isLocked) {
    const next = blocks.slice(cut).find((block) => block.type === "p");
    if (next?.type === "p") {
      teaser = next.text.length > TEASER_LENGTH ? `${next.text.slice(0, TEASER_LENGTH).trimEnd()}…` : next.text;
    }
  }

  return { blocks: blocks.slice(0, cut), toc, teaser, isLocked };
}
