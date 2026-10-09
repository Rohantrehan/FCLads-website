import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { CornerTag } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/DataBits";
import { cn } from "@/lib/cn";
import { categoryLabels } from "@/lib/format";
import type { Creator, Guide } from "@/types";

/** Dark pitch-lines artwork used when a guide has no thumbnail yet. */
function PitchPlaceholder() {
  return (
    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-pitch-green via-surface-container to-navy">
      <svg viewBox="0 0 320 180" className="absolute inset-0 size-full opacity-30" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#8FF0C9" strokeWidth="1">
          <rect x="10" y="10" width="300" height="160" />
          <line x1="160" y1="10" x2="160" y2="170" />
          <circle cx="160" cy="90" r="28" />
          <rect x="10" y="50" width="44" height="80" />
          <rect x="266" y="50" width="44" height="80" />
        </g>
      </svg>
    </div>
  );
}

interface GuideCardProps {
  guide: Guide;
  author?: Creator;
  /** The viewer is a member: show a play button instead of the lock on Lads+ guides. */
  unlocked?: boolean;
  className?: string;
}

/** Guide / video card: thumbnail with FREE/LADS+ corner tag and category chip, title, excerpt, author row. */
export function GuideCard({ guide, author, unlocked, className }: GuideCardProps) {
  const isVideo = guide.format === "video";
  const locked = guide.access === "plus" && !unlocked;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0f141b] shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary/40",
        className,
      )}
    >
      <div className="relative h-44 overflow-hidden bg-surface-high">
        {guide.image ? (
          <Image
            src={guide.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PitchPlaceholder />
        )}
        {locked ? (
          <span
            aria-hidden
            className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-canvas/70 text-gold ring-1 ring-gold/50 shadow-[0_0_24px_rgb(216_178_90/0.35)] backdrop-blur-md"
          >
            <Lock className="size-5" />
          </span>
        ) : (
          isVideo && (
            <span
              aria-hidden
              className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-canvas/70 text-mint ring-1 ring-mint/40 backdrop-blur-md transition-transform group-hover:scale-110"
            >
              <Play className="size-5 fill-current" />
            </span>
          )
        )}
        <CornerTag tier={guide.access} />
        <span className="tabular absolute bottom-2.5 left-3 rounded bg-canvas/80 px-2.5 py-1 text-[10px] font-bold uppercase text-mint backdrop-blur-md">
          {categoryLabels[guide.category]}
          {" // "}
          {guide.minutes} min {isVideo ? "video" : "read"}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-display text-base font-extrabold transition-colors group-hover:text-primary">
            {/* Stretched link: whole card is clickable, but only one link in the tab order. */}
            <Link href={`/guides/${guide.slug}`} className="after:absolute after:inset-0">
              {guide.title}
              {locked && <span className="sr-only"> (FC Lads+ members)</span>}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{guide.excerpt}</p>
        </div>
        {author && (
          <div className="mt-4 flex items-center gap-2.5 border-t border-white/5 pt-4">
            <Avatar initials={author.initials.charAt(0)} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs leading-none font-bold">{author.name}</span>
              <span className="text-[11px] text-muted">{author.role}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
