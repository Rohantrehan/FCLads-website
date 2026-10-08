import { getPlayer } from "@/data/players";
import type { Player, Squad } from "@/types";

const resolve = (slugs: string[]) => slugs.map(getPlayer).filter((player): player is Player => !!player);

export const startingXI = (squad: Squad) => resolve(squad.lineup.map((slot) => slot.playerSlug));
export const benchPlayers = (squad: Squad) => resolve(squad.bench.map((slot) => slot.playerSlug));

/** Simple squad rating: the average OVR of the starting XI (the in-game formula is close to this). */
export function squadRating(squad: Squad) {
  const xi = startingXI(squad);
  return xi.length ? Math.round(xi.reduce((sum, player) => sum + player.ovr, 0) / xi.length) : 0;
}

export function squadCosts(squad: Squad) {
  const sum = (players: Player[]) => players.reduce((total, player) => total + (player.price ?? 0), 0);
  const xi = sum(startingXI(squad));
  const bench = sum(benchPlayers(squad));
  return { xi, bench, total: xi + bench };
}

/** How many starters come from each league and nation, biggest groups first. */
export function chemistryLinks(squad: Squad) {
  const count = (values: (string | undefined)[]) => {
    const map = new Map<string, number>();
    for (const value of values) if (value) map.set(value, (map.get(value) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, players]) => ({ name, players }));
  };
  const xi = startingXI(squad);
  return {
    leagues: count(xi.map((player) => player.league)),
    nations: count(xi.map((player) => player.country ?? player.nation)),
  };
}
