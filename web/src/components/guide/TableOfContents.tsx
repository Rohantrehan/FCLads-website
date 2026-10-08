"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

interface TocItem {
  id: string;
  title: string;
  number: number;
  locked: boolean;
}

/**
 * "In this guide" list. Highlights the section currently on screen (scroll-spy).
 * Locked sections link to the paywall instead of their (absent) content.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const unlocked = useMemo(() => items.filter((item) => !item.locked), [items]);
  const [activeId, setActiveId] = useState(unlocked[0]?.id);

  useEffect(() => {
    const headings = unlocked
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (headings.length === 0) return;

    // A heading counts as "current" once it passes the top 30% of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [unlocked]);

  const freeShare = items.length ? Math.round((unlocked.length / items.length) * 100) : 100;

  return (
    <nav aria-labelledby="toc-heading" className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 id="toc-heading" className="flex items-center gap-2 font-display text-sm font-extrabold uppercase">
          <BookOpen aria-hidden className="size-4 text-primary" />
          In this guide
        </h2>
        <span className="tabular rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          {items.length} sections
        </span>
      </div>

      <ol className="flex flex-col gap-1">
        {items.map((item) => {
          const active = !item.locked && item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={item.locked ? "#members-only" : `#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-gradient-to-r from-primary/20 to-azure/10 font-semibold text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                  item.locked && "opacity-70",
                )}
              >
                <span className="flex items-center gap-2.5">
                  {item.locked ? (
                    <Lock aria-hidden className="size-3.5 shrink-0" />
                  ) : (
                    <span
                      aria-hidden
                      className={cn("size-1.5 shrink-0 rounded-full", active ? "bg-primary" : "bg-white/25")}
                    />
                  )}
                  {item.number}. {item.title}
                </span>
                {item.locked && (
                  <span className="text-label shrink-0 text-primary">
                    Lads+<span className="sr-only"> members only</span>
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>

      {freeShare > 0 && freeShare < 100 && (
        <div>
          <div className="tabular mb-1.5 flex justify-between text-xs text-muted">
            <span>Unlocked so far</span>
            <span>{freeShare}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-highest">
            <div className="h-full rounded-full bg-primary" style={{ width: `${freeShare}%` }} />
          </div>
        </div>
      )}
    </nav>
  );
}
