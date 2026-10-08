"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Lock, Play } from "lucide-react";
import type { VideoSource } from "@/types";

interface VideoFacadeProps {
  /** Only passed for members. Undefined = locked or not uploaded yet. */
  video?: VideoSource;
  title: string;
  minutes: number;
  /** Non-member view: shows a lock and a link to the paywall instead of a play button. */
  locked?: boolean;
  lockedHref?: string;
  /** Start the player straight away (e.g. after picking an episode from a list). */
  autoPlay?: boolean;
}

const SAFE_ID = /^[A-Za-z0-9_-]+$/;

/** Embed URL for a Loom or (unlisted) YouTube video. YouTube uses the privacy-friendly nocookie domain. */
function embedUrl(video: VideoSource) {
  if (!SAFE_ID.test(video.id)) return undefined;
  return video.provider === "loom"
    ? `https://www.loom.com/embed/${video.id}?autoplay=1&hide_owner=true&hide_share=true`
    : `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
}

/**
 * Lightweight video player for Loom and unlisted YouTube videos: shows a static poster first and
 * only loads the real player when the user presses play. Saves ~1MB of scripts per page and sets
 * no third-party cookies until then.
 */
export function VideoFacade({ video, title, minutes, locked, lockedHref = "#members-only", autoPlay }: VideoFacadeProps) {
  const [playing, setPlaying] = useState(!!autoPlay);
  const src = video && !locked ? embedUrl(video) : undefined;

  if (playing && src) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-pitch-green via-surface-container to-navy">
      <svg aria-hidden viewBox="0 0 320 180" className="absolute inset-0 size-full opacity-25" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#8FF0C9" strokeWidth="0.8">
          <rect x="10" y="10" width="300" height="160" />
          <line x1="160" y1="10" x2="160" y2="170" />
          <circle cx="160" cy="90" r="28" />
          <rect x="10" y="50" width="44" height="80" />
          <rect x="266" y="50" width="44" height="80" />
        </g>
      </svg>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />

      {locked ? (
        <Link
          href={lockedHref}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-canvas/70 text-gold ring-1 ring-gold/50 shadow-[0_0_30px_rgb(216_178_90/0.35)] backdrop-blur-md transition-transform group-hover:scale-110 sm:size-20">
            <Lock aria-hidden className="size-6 sm:size-7" />
          </span>
          <span className="tabular text-xs font-bold tracking-widest text-gold uppercase">
            FC Lads+ members only
            <span className="sr-only">: {title}. Find out how to unlock it.</span>
          </span>
        </Link>
      ) : src ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_40px_rgb(43_217_139/0.6)] transition-transform group-hover:scale-110">
            <Play className="size-8 fill-current" />
          </span>
        </button>
      ) : (
        <p className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-white/15 bg-canvas/60 text-white/50 backdrop-blur-md">
            <Play aria-hidden className="size-6" />
          </span>
          <span className="tabular text-xs font-bold tracking-widest text-muted uppercase">Video coming soon</span>
        </p>
      )}

      <span className="tabular pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded bg-canvas/80 px-2.5 py-1 text-xs text-white backdrop-blur-md">
        <Clock aria-hidden className="size-3.5" />
        {minutes} min
      </span>
    </div>
  );
}
