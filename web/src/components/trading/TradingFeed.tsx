import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { TradingPostCard } from "@/components/trading/TradingPostCard";
import { cn } from "@/lib/cn";
import { DEFAULT_RANGE, queryTradingPosts, tradingRanges, type TradingRange } from "@/lib/tradingAccess";
import type { Viewer } from "@/lib/viewer";

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00Z`));

interface TradingFeedProps {
  viewer: Viewer;
  /** Page the filters link back to, e.g. "/trading". */
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Date filter (Today, Yesterday, Last 3 days, Last 7 days, Custom) + the creators' trading posts.
 * Works without JavaScript: presets are links, the custom range is a GET form.
 */
export function TradingFeed({ viewer, basePath, searchParams }: TradingFeedProps) {
  const { range, from, to, today, items } = queryTradingPosts(searchParams, viewer);
  const hrefFor = (key: TradingRange) => (key === DEFAULT_RANGE ? basePath : `${basePath}?range=${key}`);
  const windowLabel = from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <nav aria-label="Filter posts by date">
          <ul className="flex flex-wrap gap-2">
            {(Object.keys(tradingRanges) as TradingRange[]).map((key) => {
              const current = key === range;
              return (
                <li key={key}>
                  <Link
                    href={hrefFor(key)}
                    scroll={false}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      current
                        ? "border-primary bg-primary text-on-primary"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-white",
                    )}
                  >
                    {key === "custom" && <CalendarDays aria-hidden className="size-4" />}
                    {tradingRanges[key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {range === "custom" && (
          <form
            action={basePath}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-white/8 bg-[#0f141b] p-4"
          >
            <input type="hidden" name="range" value="custom" />
            <label className="flex flex-col gap-1.5 text-xs text-muted">
              From
              <input
                type="date"
                name="from"
                defaultValue={from}
                max={today}
                className="tabular rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-muted">
              To
              <input
                type="date"
                name="to"
                defaultValue={to}
                max={today}
                className="tabular rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="text-label rounded-lg bg-primary px-4 py-2.5 text-on-primary transition-all hover:brightness-110"
            >
              Show posts
            </button>
          </form>
        )}

        <p className="tabular text-xs text-muted" aria-live="polite">
          {items.length} {items.length === 1 ? "post" : "posts"} · {windowLabel}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((post) => (
            <TradingPostCard key={post.id} post={post} today={today} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/12 p-10 text-center">
          <p className="font-semibold">No trading posts {range === "today" ? "yet today" : "in this range"}.</p>
          <Link href={hrefFor("7d")} className="text-label text-primary hover:text-white">
            See the last 7 days
          </Link>
        </div>
      )}
    </div>
  );
}
