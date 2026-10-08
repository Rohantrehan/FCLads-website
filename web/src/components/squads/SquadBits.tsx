import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FormationPitch } from "@/components/cards/SquadCard";
import { CoinPrice } from "@/components/ui/DataBits";
import { cn } from "@/lib/cn";
import type { Squad } from "@/types";

/** Budget tabs (50K, 100K, …). Each one links to that budget's squad. */
export function BudgetTabs({ squads, active }: { squads: Squad[]; active?: string }) {
  return (
    <nav aria-label="Squads by budget" className="scrollbar-none -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-1 rounded-xl border border-white/8 bg-[#0f141b] p-1">
        {squads.map((squad) => {
          const isActive = squad.slug === active;
          return (
            <li key={squad.slug}>
              <Link
                href={`/squads/${squad.slug}`}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 font-display font-extrabold transition-colors",
                  isActive ? "bg-primary text-on-primary" : "text-white/80 hover:bg-white/5 hover:text-white",
                )}
              >
                {squad.budgetLabel}
                <span
                  className={cn(
                    "tabular text-[10px] font-bold uppercase",
                    isActive ? "text-on-primary/70" : "text-muted",
                  )}
                >
                  {squad.formation}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact squad card: budget, creator, formation, rating, mini pitch and cost. */
export function SquadTile({ squad, authorName, rating }: { squad: Squad; authorName?: string; rating: number }) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <span className="tabular rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-mint uppercase">
          {squad.budgetLabel} coins
        </span>
        {authorName && <span className="tabular text-[10px] text-muted uppercase">By {authorName}</span>}
      </div>
      <div>
        <h3 className="font-display text-lg leading-tight font-extrabold uppercase group-hover:text-mint">
          <Link href={`/squads/${squad.slug}`} className="after:absolute after:inset-0">
            {squad.name}
          </Link>
        </h3>
        <p className="tabular mt-1 text-[11px] text-muted">
          {squad.formation} · Rating {rating} · {squad.chemistry}/33 chem
        </p>
      </div>
      <p className="line-clamp-2 text-sm text-muted">{squad.note}</p>
      <FormationPitch formation={squad.formation} className="mt-auto" />
      <div className="flex items-center justify-between border-t border-white/8 pt-3">
        <CoinPrice value={squad.budget} compact />
        <span className="text-label flex items-center gap-1 text-primary">
          View squad
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
