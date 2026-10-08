"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { playersHref, type PlayersState } from "./playersHref";

/**
 * Sort dropdown. With JavaScript it updates the URL straight away; without it, it is a normal
 * GET form with a submit button.
 */
export function SortSelect({ state, options }: { state: PlayersState; options: Record<string, string> }) {
  const router = useRouter();
  return (
    <form
      action="/players"
      method="get"
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const sort = String(new FormData(event.currentTarget).get("sort") ?? "meta");
        router.push(playersHref({ ...state, sort }), { scroll: false });
      }}
    >
      {state.group && <input type="hidden" name="position" value={state.group} />}
      {state.budget && <input type="hidden" name="budget" value={state.budget} />}
      {state.q && <input type="hidden" name="q" value={state.q} />}
      <label htmlFor="player-sort" className="text-label shrink-0 text-muted">
        Sort
      </label>
      <span className="relative">
        <select
          id="player-sort"
          name="sort"
          defaultValue={state.sort ?? "meta"}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="tabular h-9 appearance-none rounded-lg border border-white/10 bg-[#090d14] pr-9 pl-3 text-xs text-on-surface focus:border-mint focus:outline-none"
        >
          {Object.entries(options).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </span>
      <noscript>
        <button type="submit" className="text-label rounded border border-white/10 px-2 py-1 text-muted">
          Apply
        </button>
      </noscript>
    </form>
  );
}
