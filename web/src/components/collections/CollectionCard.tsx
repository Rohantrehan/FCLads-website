import Link from "next/link";
import { ArrowRight, ListVideo, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { categoryLabels } from "@/lib/format";
import type { Collection, CollectionBadge } from "@/types";

export const badgeInfo: Record<CollectionBadge, { label: string; tone: "mint" | "azure" | "gold" | "neutral" }> = {
  start: { label: "Start here", tone: "mint" },
  "in-order": { label: "Watch in order", tone: "azure" },
  meta: { label: "Meta", tone: "gold" },
  archive: { label: "Full archive", tone: "neutral" },
};

/** Stacked "playlist" thumbnail: two cards peeking behind a pitch-lines poster, video count on the right. */
export function PlaylistThumb({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("relative pt-3", className)}>
      <div aria-hidden className="absolute inset-x-6 top-0 h-3 rounded-t-lg bg-white/[0.06]" />
      <div aria-hidden className="absolute inset-x-3 top-1.5 h-3 rounded-t-lg bg-white/[0.1]" />
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-pitch-green via-surface-container to-navy">
        <svg aria-hidden viewBox="0 0 320 180" className="absolute inset-0 size-full opacity-25" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#8FF0C9" strokeWidth="1">
            <rect x="10" y="10" width="300" height="160" />
            <line x1="160" y1="10" x2="160" y2="170" />
            <circle cx="160" cy="90" r="28" />
          </g>
        </svg>
        <span
          aria-hidden
          className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-canvas/70 text-mint ring-1 ring-mint/40 backdrop-blur-md transition-transform group-hover:scale-110"
        >
          <Play className="size-5 fill-current" />
        </span>
        <span className="absolute inset-y-0 right-0 flex w-[30%] flex-col items-center justify-center gap-1 bg-canvas/80 backdrop-blur-md">
          <span className="font-display text-2xl leading-none font-extrabold">{count}</span>
          <span className="tabular flex items-center gap-1 text-[10px] text-muted uppercase">
            <ListVideo aria-hidden className="size-3" />
            {count === 1 ? "video" : "videos"}
          </span>
        </span>
      </div>
    </div>
  );
}

/** Collection (playlist) card for the collections grid. Whole card links to the collection page. */
export function CollectionCard({ collection, className }: { collection: Collection; className?: string }) {
  const badge = collection.badge ? badgeInfo[collection.badge] : undefined;
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40",
        className,
      )}
    >
      <PlaylistThumb count={collection.videoCount} />
      <div className="flex flex-1 flex-col gap-2 px-1">
        <p className="flex flex-wrap items-center gap-2">
          {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
          {collection.category && (
            <span className="tabular text-[10px] text-muted uppercase">{categoryLabels[collection.category]}</span>
          )}
        </p>
        <h3 className="font-display text-base leading-snug font-extrabold transition-colors group-hover:text-primary">
          <Link href={`/learn/collections/${collection.slug}`} className="after:absolute after:inset-0">
            {collection.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{collection.description}</p>
        <p className="text-label mt-auto flex items-center gap-1.5 pt-2 text-primary">
          View collection
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}
