"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, FileText, Lock, Play } from "lucide-react";
import { VideoFacade } from "@/components/guide/VideoFacade";
import { cn } from "@/lib/cn";
import type { EpisodeView } from "@/lib/collectionAccess";

interface CollectionPlayerProps {
  episodes: EpisodeView[];
  isLocked: boolean;
  /** Videos in the series that aren't listed yet. */
  remaining: number;
  inOrder?: boolean;
}

/**
 * Player plus episode list. Members pick an episode and it plays here (Loom or unlisted YouTube).
 * Non-members see the titles with a lock; the video links are never sent to them.
 */
export function CollectionPlayer({ episodes, isLocked, remaining, inOrder }: CollectionPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(false);
  const episode = episodes[current];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
        {episode && (
          <>
            <VideoFacade
              key={current}
              video={episode.video}
              locked={isLocked}
              autoPlay={picked}
              title={episode.title}
              minutes={episode.minutes}
            />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="tabular text-[11px] text-mint uppercase">
                  Video {current + 1} of {episodes.length + remaining}
                </p>
                <h3 className="mt-1 font-display text-lg leading-snug font-extrabold">{episode.title}</h3>
              </div>
              {episode.guideHref && (
                <Link
                  href={episode.guideHref}
                  className="text-label flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-primary transition-colors hover:border-primary/40 hover:text-white"
                >
                  <FileText aria-hidden className="size-3.5" />
                  Read the guide
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:col-span-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-label text-muted">Videos in this collection</h3>
          {inOrder && <p className="tabular text-[11px] text-mint uppercase">Watch in order</p>}
        </div>
        <ol className="flex flex-col gap-2 lg:max-h-[30rem] lg:overflow-y-auto lg:pr-1">
          {episodes.map((item, index) => {
            const active = index === current;
            const inner = (
              <>
                <span
                  className={cn(
                    "tabular flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    active && !isLocked ? "bg-primary text-on-primary" : "bg-surface-highest text-mint",
                  )}
                >
                  {active && !isLocked ? <Play aria-hidden className="size-3.5 fill-current" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                  <span className={cn("text-sm font-semibold", active && !isLocked && "text-mint")}>{item.title}</span>
                  <span className="tabular flex items-center gap-1 text-[11px] text-muted uppercase">
                    <Clock aria-hidden className="size-3" />
                    {item.minutes} min
                  </span>
                </span>
                {isLocked && <Lock aria-hidden className="size-4 shrink-0 text-gold/80" />}
              </>
            );
            return (
              <li key={`${item.title}-${index}`}>
                {isLocked ? (
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0f141b] p-3">
                    {inner}
                    <span className="sr-only">(FC Lads+ members)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => {
                      setCurrent(index);
                      setPicked(true);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 transition-colors",
                      active ? "border-primary/50 bg-pitch-green" : "border-white/8 bg-[#0f141b] hover:border-primary/40",
                    )}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
          {remaining > 0 && (
            <li className="rounded-xl border border-dashed border-white/15 p-3 text-sm text-muted">
              + {remaining} more {remaining === 1 ? "video" : "videos"} in this collection
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
