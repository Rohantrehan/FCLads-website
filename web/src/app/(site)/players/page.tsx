import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { MetaPlayersHeader } from "@/components/players/MetaPlayersHeader";
import { NerfsCard, PatchImpactCard, ProPickCard } from "@/components/players/MetaAside";
import { PodiumCard, RankingTable } from "@/components/players/MetaRanking";
import { BudgetPills, PlayerSearch, PositionNav } from "@/components/players/PlayersFilters";
import { playersHref, type PlayersState } from "@/components/players/playersHref";
import { SortSelect } from "@/components/players/SortSelect";
import { Button } from "@/components/ui/Button";
import { getCreator } from "@/data/creators";
import { CURRENT_PATCH, CURRENT_WEEK, metaAnalystSlug, patchImpact, patchNerfs, proPick } from "@/data/meta";
import { getPlayer, players } from "@/data/players";
import {
  type BudgetKey,
  budgets,
  countByBudget,
  countByGroup,
  queryPlayers,
  type SortKey,
  sorts,
} from "@/lib/playerAccess";
import { isPositionGroup, positionGroups } from "@/lib/positions";
import { getViewer } from "@/lib/viewer";
import type { Player } from "@/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function readParams(searchParams: SearchParams) {
  const params = await searchParams;
  const position = first(params.position);
  const budget = first(params.budget);
  const sort = first(params.sort);
  const q = first(params.q)?.trim().slice(0, 60);
  return {
    group: isPositionGroup(position) ? position : undefined,
    budget: budget && budget in budgets ? (budget as BudgetKey) : undefined,
    sort: sort && sort in sorts ? (sort as SortKey) : ("meta" as SortKey),
    q: q || undefined,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { group } = await readParams(searchParams);
  const label = group ? positionGroups[group].label : "Meta players";
  return {
    title: group ? `Meta ${label.toLowerCase()} (week ${CURRENT_WEEK})` : `Meta players (week ${CURRENT_WEEK})`,
    description: `The most broken EA SPORTS FC players this week, ranked and tested by the FC Lads. Patch ${CURRENT_PATCH}, updated every Monday.`,
    alternates: { canonical: group ? `/players?position=${group}` : "/players" },
  };
}

export default async function PlayersPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await readParams(searchParams);
  const viewer = await getViewer();
  const { visible, lockedCount, total } = queryPlayers(query, viewer);
  const state: PlayersState = { group: query.group, budget: query.budget, q: query.q, sort: query.sort };

  // Podium only for the plain "most broken" ranking; searches and other sorts are a flat list.
  const showPodium = query.sort === "meta" && !query.q && visible.length >= 3;
  const podium = showPodium ? visible.slice(0, 3) : [];
  const rows = showPodium ? visible.slice(3) : visible;

  const groupLabel = query.group ? positionGroups[query.group].label : "All positions";
  const caption = `${groupLabel} ranking, ${query.sort === "meta" ? "by meta score" : sorts[query.sort].toLowerCase()}`;

  const pickCreator = getCreator(proPick.creatorSlug);
  const pickPlayer = getPlayer(proPick.playerSlug);
  const nerfs = patchNerfs
    .map((nerf) => ({ ...nerf, player: getPlayer(nerf.playerSlug) }))
    .filter((nerf): nerf is typeof nerf & { player: Player } => !!nerf.player);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]"
      />

      <MetaPlayersHeader week={CURRENT_WEEK} />

      <div className="page-container relative grid grid-cols-1 gap-6 pb-20 lg:grid-cols-12">
        {/* Left: positions + patch note */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3 xl:col-span-3">
          <div className="lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-6">
            <div className="lg:rounded-2xl lg:border lg:border-white/8 lg:bg-[#0f141b] lg:p-4">
              <PositionNav active={query.group} counts={countByGroup()} total={players.length} state={state} />
            </div>
            <div className="hidden lg:block">
              <PatchImpactCard patch={CURRENT_PATCH} {...patchImpact} />
            </div>
          </div>
        </div>

        {/* Centre: filters, podium, ranking */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-9 xl:col-span-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4">
            <PlayerSearch state={state} />
            <BudgetPills
              options={(Object.keys(budgets) as BudgetKey[]).map((key) => ({ key, label: budgets[key].label }))}
              counts={countByBudget(query.group)}
              state={state}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SortSelect
                key={`${query.sort}-${query.group}-${query.budget}-${query.q}`}
                state={state}
                options={sorts}
              />
              <p id="player-count" className="tabular text-[11px] text-muted uppercase" aria-live="polite">
                {total} {total === 1 ? "player" : "players"}
              </p>
            </div>
          </div>

          {total === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
              <SearchX aria-hidden className="size-10 text-white/30" />
              <p className="font-display text-lg font-extrabold uppercase">
                {query.group === "gk" && !query.q && !query.budget
                  ? "Goalkeeper rankings are coming"
                  : "No players found"}
              </p>
              <p className="max-w-sm text-sm text-muted">
                {query.group === "gk" && !query.q && !query.budget
                  ? "The Lads are still testing keepers this patch. Check back on Monday."
                  : "Try another name or budget, or clear the filters."}
              </p>
              <Button href={playersHref({})} variant="glass" size="sm" className="mt-2">
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {podium.length === 3 && (
                <section aria-label="Top three" className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3 md:items-start">
                  <PodiumCard player={podium[1]} place={2} showRank className="md:order-1" />
                  <PodiumCard player={podium[0]} place={1} showRank className="order-first md:order-2" />
                  <PodiumCard player={podium[2]} place={3} showRank className="md:order-3" />
                </section>
              )}

              {(rows.length > 0 || lockedCount > 0) && (
                <section
                  aria-labelledby="ranking-heading"
                  className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4 md:p-5"
                >
                  <h2 id="ranking-heading" className="font-display text-lg font-extrabold uppercase md:text-xl">
                    {showPodium
                      ? `${groupLabel}: ranks ${podium.length + 1}${rows.length > 1 ? `–${podium.length + rows.length}` : ""}`
                      : query.q
                        ? `Results for “${query.q}”`
                        : `${groupLabel}: ${sorts[query.sort].toLowerCase()}`}
                  </h2>
                  <RankingTable
                    players={rows}
                    startRank={podium.length + 1}
                    lockedCount={lockedCount}
                    caption={caption}
                  />
                </section>
              )}
            </>
          )}
        </div>

        {/* Right: pro pick + nerfs */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-9 lg:col-start-4 xl:col-span-3 xl:col-start-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:sticky xl:top-28 xl:grid-cols-1">
            {pickCreator && pickPlayer && (
              <ProPickCard creator={pickCreator} player={pickPlayer} quote={proPick.quote} week={CURRENT_WEEK} />
            )}
            <NerfsCard patch={CURRENT_PATCH} nerfs={nerfs} analyst={getCreator(metaAnalystSlug)} />
            <div className="lg:hidden">
              <PatchImpactCard patch={CURRENT_PATCH} {...patchImpact} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
