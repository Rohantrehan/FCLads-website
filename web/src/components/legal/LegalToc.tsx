"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { cn } from "@/lib/cn";

interface TocItem {
  id: string;
  title: string;
}

/**
 * Table of contents for a legal page. Highlights the section on screen (scroll-spy).
 * Phones get a collapsible list above the text; desktop gets a sticky card.
 */
export function LegalToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return;

    // A section counts as "current" once its top passes the top 30% of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol className="flex flex-col gap-0.5">
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-primary/10 font-semibold text-white" : "text-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <span className={cn("tabular w-5 shrink-0 text-[11px]", active ? "text-primary" : "text-muted/70")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );

  const heading = (
    <span className="flex items-center gap-2 font-display text-sm font-extrabold uppercase">
      <ListOrdered aria-hidden className="size-4 text-primary" />
      Contents
    </span>
  );
  const count = <span className="tabular text-[11px] text-muted">{items.length} sections</span>;

  return (
    <>
      <details className="group rounded-2xl border border-white/8 bg-surface lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          {heading}
          <span className="flex items-center gap-2">
            {count}
            <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <nav aria-label="Contents" className="border-t border-white/8 p-2">
          {list}
        </nav>
      </details>

      <nav
        aria-label="Contents"
        className="hidden flex-col gap-3 rounded-2xl border border-white/8 bg-surface p-4 lg:flex"
      >
        <div className="flex items-center justify-between px-1">
          {heading}
          {count}
        </div>
        {list}
      </nav>
    </>
  );
}
