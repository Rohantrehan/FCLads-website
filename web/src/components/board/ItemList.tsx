import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Lock, Plus } from "lucide-react";
import type { PostStatus } from "@/lib/content/rows";
import { cn } from "@/lib/cn";
import { ukShortDay, ukTime } from "@/lib/ukTime";

export type ItemState = "Draft" | "Scheduled" | "Live" | "Hidden";

export const stateOf = (status: PostStatus, date: string | undefined, now: number): ItemState =>
  status === "draft" ? "Draft" : date && new Date(date).getTime() > now ? "Scheduled" : "Live";

const stateTone: Record<ItemState, string> = {
  Draft: "bg-white/8 text-muted",
  Scheduled: "bg-gold/12 text-gold",
  Live: "bg-primary/15 text-mint",
  Hidden: "bg-danger/15 text-danger-soft",
};

export interface ListItem {
  id: string;
  href: string;
  title: string;
  /** Second line, e.g. "Wessam · Tip". */
  detail?: string;
  state: ItemState;
  date?: string;
  locked?: boolean;
}

/** Page title for a board section, with an optional "New …" button. */
export function BoardHeading({ title, description, newHref, newLabel }: { title: string; description?: ReactNode; newHref?: string; newLabel?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl leading-none font-extrabold uppercase md:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted">{description}</p>}
      </div>
      {newHref && (
        <Link
          href={newHref}
          className="text-label flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-on-primary hover:brightness-110"
        >
          <Plus aria-hidden className="size-4" />
          {newLabel ?? "New"}
        </Link>
      )}
    </div>
  );
}

export function ItemList({ items, empty }: { items: ListItem[]; empty: string }) {
  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-white/12 p-6 text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8 bg-[#0f141b]">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/4 md:px-5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate font-semibold">
                {item.locked && <Lock aria-label="FC Lads+" className="size-3.5 shrink-0 text-gold" />}
                <span className="truncate">{item.title}</span>
              </p>
              {item.detail && <p className="truncate text-xs text-muted">{item.detail}</p>}
            </div>
            {item.date && (
              <span className="tabular hidden shrink-0 text-xs text-muted sm:inline">
                {ukShortDay(item.date)} · {ukTime(item.date)}
              </span>
            )}
            <span className={cn("tabular shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase", stateTone[item.state])}>{item.state}</span>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
