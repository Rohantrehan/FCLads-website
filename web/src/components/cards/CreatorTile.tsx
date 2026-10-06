import Link from "next/link";
import { BadgeCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Creator } from "@/types";

/** Compact creator tile (Home "Meet the Lads"): country, monogram, name, role and one headline stat. */
export function CreatorTile({ creator, className }: { creator: Creator; className?: string }) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between rounded-2xl border border-white/8 bg-[#0f141b] p-4 transition-all sm:p-5 hover:-translate-y-1 hover:border-primary/40",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="tabular text-xs text-white/50">{creator.countryCode}</span>
          <BadgeCheck aria-label="Verified creator" className="size-4 text-primary" />
        </div>
        <div className="mt-4 flex flex-col items-center text-center">
          <span
            aria-hidden
            className="flex size-20 items-center justify-center rounded-full border border-white/10 bg-surface-high font-display text-2xl font-extrabold"
          >
            {creator.initials}
          </span>
          <h3 className="mt-3 font-display text-base font-extrabold">
            <Link href={`/creators/${creator.slug}`} className="after:absolute after:inset-0">
              {creator.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs font-bold text-mint">{creator.role}</p>
        </div>
      </div>
      {creator.highlight && (
        <dl className="tabular mt-6 flex flex-col items-center gap-1 border-t border-white/5 pt-4 text-center text-[11px] uppercase sm:flex-row sm:justify-between sm:text-left">
          <dt className="text-muted">{creator.highlight.label}</dt>
          <dd className="font-bold">{creator.highlight.value}</dd>
        </dl>
      )}
    </article>
  );
}

/** Dashed placeholder tile for the open creator slot. */
export function OpenSlotTile({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-5 text-center text-muted",
        className,
      )}
    >
      <UserPlus aria-hidden className="size-8 text-white/30" />
      <h3 className="font-display text-sm font-extrabold uppercase text-white/70">More Lads coming</h3>
      <p className="text-xs">New creators join the crew soon.</p>
    </article>
  );
}
