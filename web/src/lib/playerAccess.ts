import "server-only";

import { players } from "@/data/players";
import { playerReviews } from "@/data/playerReviews";
import { groupOf, type PositionGroup, positionGroups } from "@/lib/positions";
import type { Viewer } from "@/lib/viewer";
import type { Player, PlayerReview } from "@/types";

/** Ranks anyone can see on /players. The rest of the ranking is FC Lads+. */
export const FREE_RANKS = 10;

export type BudgetKey = "under-50k" | "50k-150k" | "150k-500k" | "500k-plus";

export const budgets: Record<BudgetKey, { label: string; min: number; max: number }> = {
  "under-50k": { label: "< 50K", min: 0, max: 50_000 },
  "50k-150k": { label: "50K–150K", min: 50_000, max: 150_000 },
  "150k-500k": { label: "150K–500K", min: 150_000, max: 500_000 },
  "500k-plus": { label: "500K+", min: 500_000, max: Infinity },
};

export const sorts = {
  meta: "Most broken (meta score)",
  rising: "Rising price",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

export type SortKey = keyof typeof sorts;

export interface PlayerQuery {
  group?: PositionGroup;
  budget?: BudgetKey;
  q?: string;
  sort: SortKey;
}

const inBudget = (player: Player, budget?: BudgetKey) =>
  !budget || ((player.price ?? 0) >= budgets[budget].min && (player.price ?? 0) < budgets[budget].max);

const matchesSearch = (player: Player, q?: string) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [
    player.name,
    player.club,
    player.league,
    player.nation,
    player.country,
    ...(player.playstyles ?? []),
    ...(player.playstylesPlus ?? []),
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(needle));
};

const sorters: Record<SortKey, (a: Player, b: Player) => number> = {
  meta: (a, b) => (b.metaScore ?? 0) - (a.metaScore ?? 0),
  rising: (a, b) => (b.trend ?? 0) - (a.trend ?? 0),
  "price-asc": (a, b) => (a.price ?? 0) - (b.price ?? 0),
  "price-desc": (a, b) => (b.price ?? 0) - (a.price ?? 0),
};

export interface PlayerList {
  /** Rows this viewer may see. */
  visible: Player[];
  /** How many more rows exist behind the paywall (never their data). */
  lockedCount: number;
  total: number;
}

/**
 * The /players ranking for this viewer. Non-members get the first FREE_RANKS rows; for the rest
 * only the count is returned, so locked players never reach their browser.
 */
export function queryPlayers(query: PlayerQuery, viewer: Viewer): PlayerList {
  const all = players
    .filter((player) => !query.group || groupOf(player.position) === query.group)
    .filter((player) => inBudget(player, query.budget))
    .filter((player) => matchesSearch(player, query.q))
    .sort(sorters[query.sort]);
  const limit = viewer.isMember ? all.length : FREE_RANKS;
  return {
    visible: all.slice(0, limit),
    lockedCount: Math.max(all.length - limit, 0),
    total: all.length,
  };
}

export function countByGroup() {
  const counts = Object.fromEntries(Object.keys(positionGroups).map((key) => [key, 0])) as Record<
    PositionGroup,
    number
  >;
  for (const player of players) counts[groupOf(player.position)] += 1;
  return counts;
}

export function countByBudget(group?: PositionGroup) {
  const pool = players.filter((player) => !group || groupOf(player.position) === group);
  return Object.fromEntries(
    (Object.keys(budgets) as BudgetKey[]).map((key) => [key, pool.filter((player) => inBudget(player, key)).length]),
  ) as Record<BudgetKey, number>;
}

/** The in-depth review, for members only. */
export function getPlayerReview(slug: string, viewer: Viewer): { review?: PlayerReview; hasReview: boolean } {
  const review = playerReviews[slug];
  return { review: viewer.isMember ? review : undefined, hasReview: !!review };
}
