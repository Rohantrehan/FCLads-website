import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/DataBits";
import { categoryLabels } from "@/lib/format";
import type { Creator, Guide } from "@/types";
import { ShareButton } from "./ShareButton";

/** Large featured guide: 16:9 video thumbnail on the left, details and CTA on the right. */
export function FeaturedGuide({ guide, author }: { guide: Guide; author?: Creator }) {
  const href = `/guides/${guide.slug}`;
  return (
    <article className="relative grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-pitch-green/60 via-surface-container to-canvas p-4 shadow-[0_0_40px_rgb(43_217_139/0.12)] md:grid-cols-2 md:p-6">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-pitch-green via-surface-container to-navy"
      >
        <svg viewBox="0 0 320 180" className="absolute inset-0 size-full opacity-30" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#8FF0C9" strokeWidth="1">
            <rect x="10" y="10" width="300" height="160" />
            <line x1="160" y1="10" x2="160" y2="170" />
            <circle cx="160" cy="90" r="28" />
            <rect x="10" y="50" width="44" height="80" />
            <rect x="266" y="50" width="44" height="80" />
          </g>
        </svg>
        <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_30px_rgb(43_217_139/0.6)] transition-transform group-hover:scale-110">
          <Play className="size-7 fill-current" />
        </span>
        <span className="absolute top-3 left-3">
          <Badge tone="azure">Featured</Badge>
        </span>
        <span className="tabular absolute right-3 bottom-3 flex items-center gap-1 rounded bg-canvas/80 px-2 py-1 text-xs text-white backdrop-blur-md">
          <Clock aria-hidden className="size-3.5" />
          {guide.minutes} min
        </span>
      </Link>

      <div className="flex flex-col justify-center gap-4">
        <p className="flex flex-wrap items-center gap-2">
          <Badge tone="solid">{categoryLabels[guide.category]}</Badge>
          {guide.access === "free" ? <Badge>Free</Badge> : <Badge tone="mint">Lads+</Badge>}
        </p>
        <h2 className="font-display text-2xl leading-tight font-extrabold uppercase lg:text-3xl">
          <Link href={href} className="transition-colors hover:text-mint">
            {guide.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-muted">{guide.excerpt}</p>
        {author && (
          <div className="flex items-center gap-3">
            <Avatar initials={author.initials} tone="mint" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{author.name}</span>
              <span className="tabular text-[11px] text-mint uppercase">
                {author.role} · {guide.minutes} min {guide.format === "video" ? "video" : "read"}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Button href={href} variant="primary" className="flex-1">
            {guide.format === "video" ? "Watch guide now" : "Read guide now"}
          </Button>
          <ShareButton path={href} title={guide.title} />
        </div>
      </div>
    </article>
  );
}
