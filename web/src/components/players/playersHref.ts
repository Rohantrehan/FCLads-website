import type { PositionGroup } from "@/lib/positions";

export interface PlayersState {
  group?: PositionGroup;
  budget?: string;
  q?: string;
  sort?: string;
}

/** Builds a /players URL from filter state. Defaults are left out so URLs stay clean. */
export function playersHref({ group, budget, q, sort }: PlayersState) {
  const params = new URLSearchParams();
  if (group) params.set("position", group);
  if (budget) params.set("budget", budget);
  if (q?.trim()) params.set("q", q.trim());
  if (sort && sort !== "meta") params.set("sort", sort);
  const query = params.toString();
  return query ? `/players?${query}` : "/players";
}
