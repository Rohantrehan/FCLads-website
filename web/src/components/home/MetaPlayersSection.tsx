"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { MetaPlayerCard } from "@/components/cards/PlayerCard";
import { AutoScrollRow } from "@/components/ui/AutoScrollRow";
import { Button } from "@/components/ui/Button";
import { FilterPills } from "@/components/ui/FilterPills";
import { groupOf, type PositionGroup, positionGroups } from "@/lib/positions";
import type { Player } from "@/types";

// Groups shown on Home (goalkeepers aren't ranked yet).
const homeGroups = ["strikers", "wingers", "cam", "cm", "cdm", "cb", "fullbacks"] satisfies PositionGroup[];
type Group = (typeof homeGroups)[number];

const options = homeGroups.map((key) => ({ value: key, label: positionGroups[key].short }));

export function MetaPlayersSection({ players, week }: { players: Player[]; week: number }) {
  const [group, setGroup] = useState<Group>("strikers");
  const visible = players
    .filter((player) => groupOf(player.position) === group)
    .sort((a, b) => (a.metaRank ?? 99) - (b.metaRank ?? 99))
    .slice(0, 6);

  return (
    <section aria-labelledby="meta-heading" className="page-container relative py-20">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <span className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-mint uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            Week {week} power ranking
          </span>
          <h2 id="meta-heading" className="text-headline">
            This week&apos;s most broken players
          </h2>
          <p className="text-muted">Tested by the Lads. Updated every Monday.</p>
          <FilterPills label="Filter by position" options={options} value={group} onChange={setGroup} className="pt-2" />
          <Button href={`/players?position=${group}`} variant="ghost" className="mt-4 self-start px-0">
            See all meta players
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>

        <div className="lg:col-span-8">
          {visible.length > 0 ? (
            // `key` restarts the loop from the first card when the position filter changes.
            <AutoScrollRow key={group} count={visible.length} label={`Meta players: ${positionGroups[group].label}`}>
              {visible.map((player, index) => (
                <MetaPlayerCard key={player.slug} player={player} active={index === 0} />
              ))}
            </AutoScrollRow>
          ) : (
            <div
              aria-live="polite"
              className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-center text-muted"
            >
              <p className="font-display font-extrabold text-white/80 uppercase">No ranking yet for {positionGroups[group].label.toLowerCase()}</p>
              <p className="text-sm">The Lads publish new rankings every Monday.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
