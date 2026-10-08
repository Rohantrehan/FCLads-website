import type { Player } from "@/types";

export interface PricePoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  price: number;
}

/** Small deterministic pseudo-random generator so the mock chart is the same on every render. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const char of seed) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Mock daily price history ending at `endDate`, shaped by the player's weekly trend.
 * Placeholder until real market data is connected (open question: game-data source).
 */
export function priceHistory(player: Player, endDate: string, days = 30): PricePoint[] {
  const current = player.price ?? 0;
  if (!current) return [];
  const random = seeded(player.slug);
  const weekly = (player.trend ?? 0) / 100;
  const daily = Math.pow(1 + weekly, 1 / 7) - 1;
  const end = new Date(`${endDate}T00:00:00Z`);
  const points: PricePoint[] = [];
  let price = current;
  for (let index = 0; index < days; index++) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - index);
    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.round(price / 100) * 100,
    });
    // Walk backwards: undo one day of trend, plus a little noise.
    price = (price / (1 + daily)) * (1 + (random() - 0.5) * 0.04);
  }
  points[0].price = current;
  return points.reverse();
}
