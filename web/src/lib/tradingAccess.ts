import "server-only";

import { TRADING_TODAY, tradingPosts, type TradingPost } from "@/data/tradingPosts";
import type { Viewer } from "@/lib/viewer";

export const tradingRanges = {
  today: "Today",
  yesterday: "Yesterday",
  "3d": "Last 3 days",
  "7d": "Last 7 days",
  custom: "Custom",
} as const;

export type TradingRange = keyof typeof tradingRanges;

export const DEFAULT_RANGE: TradingRange = "7d";

/** A post as this viewer gets it. FC Lads+ posts keep only the title for non-members. */
export type TradingItem = Omit<TradingPost, "text" | "image"> & {
  text?: string;
  image?: TradingPost["image"];
  locked: boolean;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO date `days` before (negative) or after `iso`. */
export function shiftDate(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const isDate = (value: unknown): value is string =>
  typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Turns the URL's `range`, `from` and `to` into an inclusive date window. Bad values fall back to defaults. */
export function resolveRange(params: { range?: unknown; from?: unknown; to?: unknown }) {
  const today = TRADING_TODAY;
  const range: TradingRange =
    typeof params.range === "string" && params.range in tradingRanges ? (params.range as TradingRange) : DEFAULT_RANGE;

  switch (range) {
    case "today":
      return { range, from: today, to: today };
    case "yesterday":
      return { range, from: shiftDate(today, -1), to: shiftDate(today, -1) };
    case "3d":
      return { range, from: shiftDate(today, -2), to: today };
    case "7d":
      return { range, from: shiftDate(today, -6), to: today };
    case "custom": {
      let from = isDate(params.from) ? params.from : shiftDate(today, -6);
      let to = isDate(params.to) ? params.to : today;
      if (from > to) [from, to] = [to, from];
      if (to > today) to = today;
      if (from > today) from = today;
      return { range, from, to };
    }
  }
}

/**
 * Trading posts in the date window, newest first. For FC Lads+ posts, non-members only get the
 * title: the text and screenshot never reach their browser.
 */
export function queryTradingPosts(params: { range?: unknown; from?: unknown; to?: unknown }, viewer: Viewer) {
  const window = resolveRange(params);
  const items: TradingItem[] = tradingPosts
    .filter((post) => {
      const day = post.postedAt.slice(0, 10);
      return day >= window.from && day <= window.to;
    })
    .map((post) => {
      if (post.access !== "plus" || viewer.isMember) return { ...post, locked: false };
      return {
        id: post.id,
        authorSlug: post.authorSlug,
        postedAt: post.postedAt,
        access: post.access,
        title: post.title,
        locked: true,
      };
    });
  return { ...window, today: TRADING_TODAY, items };
}

/** Newest post, for the dashboard. Only call for members. */
export function latestTradingPost() {
  return tradingPosts[0];
}
