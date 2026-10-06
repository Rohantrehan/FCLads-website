import Link from "next/link";
import { Search, X } from "lucide-react";
import type { GuideCategory } from "@/types";
import { learnHref } from "./learnHref";

const popular = ["Tactics", "Sliders", "Patch", "4-3-2-1"];

/**
 * Search box. A plain GET form, so it works before JavaScript loads and the result URL is shareable.
 * Keeps the current category while searching.
 */
export function LearnSearch({ q, category }: { q?: string; category?: GuideCategory }) {
  return (
    <div className="flex w-full flex-col gap-3 lg:max-w-md">
      <form action="/learn" method="get" role="search" className="relative">
        {category && <input type="hidden" name="category" value={category} />}
        <label htmlFor="learn-search" className="sr-only">
          Search guides
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
        <input
          id="learn-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search guides, tactics…"
          autoComplete="off"
          className="h-12 w-full rounded-lg border border-white/10 bg-[#090d14] pr-24 pl-11 text-sm text-on-surface placeholder:text-muted/70 focus:border-mint focus:outline-none"
        />
        {q ? (
          <Link
            href={learnHref({ category })}
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
      <p className="tabular flex flex-wrap items-center gap-2 text-[11px] text-muted uppercase">
        <span>Popular:</span>
        {popular.map((term) => (
          <Link
            key={term}
            href={learnHref({ q: term })}
            className="rounded border border-white/10 px-2 py-0.5 transition-colors hover:border-mint/50 hover:text-white"
          >
            {term}
          </Link>
        ))}
      </p>
    </div>
  );
}
