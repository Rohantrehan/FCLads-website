import Link from "next/link";
import { Goal, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { type PositionGroup, positionGroupKeys, positionGroups } from "@/lib/positions";
import { playersHref, type PlayersState } from "./playersHref";

/**
 * Position filter. Desktop: vertical sidebar list. Phone/tablet: horizontal scrolling pills.
 * Keeps the search and sort when switching position (the budget resets, since counts differ).
 */
export function PositionNav({
  active,
  counts,
  total,
  state,
}: {
  active?: PositionGroup;
  counts: Record<PositionGroup, number>;
  total: number;
  state: PlayersState;
}) {
  const items = [
    { key: undefined, label: "All positions", short: "", count: total },
    ...positionGroupKeys.map((key) => ({
      key,
      label: positionGroups[key].label,
      short: positionGroups[key].positions.join("/"),
      count: counts[key],
    })),
  ];

  return (
    <nav aria-label="Positions">
      <p className="text-label mb-3 hidden items-center gap-2 text-muted lg:flex">
        <Goal aria-hidden className="size-4 text-mint" />
        Positions
      </p>
      <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {items.map(({ key, label, short, count }) => {
          const isActive = key === active;
          return (
            <li key={label} className="shrink-0">
              <Link
                href={playersHref({ q: state.q, sort: state.sort, group: key })}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors lg:justify-between lg:py-2.5",
                  isActive
                    ? "border-primary/50 bg-primary/15 font-semibold text-mint"
                    : "border-white/8 bg-white/[0.03] text-muted hover:border-white/15 hover:text-white lg:border-transparent lg:bg-transparent",
                )}
              >
                <span className="flex items-baseline gap-1.5">
                  {label}
                  {short && <span className="tabular hidden text-[10px] opacity-70 lg:inline">{short}</span>}
                </span>
                <span
                  className={cn(
                    "tabular rounded px-1.5 text-[11px]",
                    isActive ? "bg-primary/20 text-mint" : "bg-white/5 text-muted",
                  )}
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Search box: a plain GET form, so it works before JavaScript loads. Keeps position and sort. */
export function PlayerSearch({ state }: { state: PlayersState }) {
  return (
    <form action="/players" method="get" role="search" className="relative">
      {state.group && <input type="hidden" name="position" value={state.group} />}
      {state.sort && state.sort !== "meta" && <input type="hidden" name="sort" value={state.sort} />}
      <label htmlFor="player-search" className="sr-only">
        Search players
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
      <input
        id="player-search"
        name="q"
        type="search"
        defaultValue={state.q}
        placeholder="Search by name, club or PlayStyle…"
        autoComplete="off"
        className="h-12 w-full rounded-lg border border-white/10 bg-[#090d14] pr-24 pl-11 text-sm text-on-surface placeholder:text-muted/70 focus:border-mint focus:outline-none"
      />
      {state.q ? (
        <Link
          href={playersHref({ ...state, q: undefined })}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-white"
        >
          <X aria-hidden className="size-4" />
        </Link>
      ) : (
        <button
          type="submit"
          className="tabular absolute top-1/2 right-2 h-8 -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-muted uppercase hover:border-mint/50 hover:text-white"
        >
          Search
        </button>
      )}
    </form>
  );
}

/** Budget filter pills (links), each with how many players it contains. */
export function BudgetPills({
  options,
  counts,
  state,
}: {
  options: { key: string; label: string }[];
  counts: Record<string, number>;
  state: PlayersState;
}) {
  const items = [{ key: undefined, label: "All budgets" }, ...options];
  return (
    <nav aria-label="Budget">
      <ul className="flex flex-wrap gap-2">
        {items.map(({ key, label }) => {
          const isActive = key === state.budget;
          return (
            <li key={label}>
              <Link
                href={playersHref({ ...state, budget: key })}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "tabular flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase transition-colors",
                  isActive
                    ? "border-primary bg-primary text-on-primary"
                    : "border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white",
                )}
              >
                {label}
                {key && <span className={isActive ? "opacity-70" : "text-white/40"}>({counts[key] ?? 0})</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
