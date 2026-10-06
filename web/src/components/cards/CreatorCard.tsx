import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Creator } from "@/types";

const ratingLabels = [
  ["gam", "GAM"],
  ["tac", "TAC"],
  ["trd", "TRD"],
  ["meta", "META"],
] as const;

/** Creator styled as a FUT card: OVR, role, portrait, GAM/TAC/TRD/META ratings, profile link. */
export function CreatorCard({
  creator,
  featured,
  showProfileLink = true,
  className,
}: {
  creator: Creator;
  featured?: boolean;
  /** Hide on the creator's own profile page. */
  showProfileLink?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group relative flex flex-col transition-transform duration-300", showProfileLink && "hover:-translate-y-2", className)}>
      {featured && (
        <div
          aria-hidden
          className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary via-mint/40 to-transparent opacity-80 blur-md transition-opacity group-hover:opacity-100"
        />
      )}
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-xl p-4 shadow-xl",
          featured
            ? "bg-gradient-to-b from-surface-highest via-surface-high to-canvas"
            : "bg-surface-high/90 transition-colors group-hover:bg-surface-highest",
        )}
      >
        <header className="flex items-start justify-between">
          <div>
            <p className="flex items-baseline gap-1">
              <span className="font-display text-4xl leading-none font-extrabold text-primary">{creator.ovr}</span>
              <span className="text-label text-muted">OVR</span>
            </p>
            <p className="tabular text-sm font-semibold">{creator.cardPosition}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {creator.badge && (
              <span className="text-label rounded-full bg-primary px-2 py-0.5 text-on-primary">{creator.badge}</span>
            )}
            {creator.rankLabel && <span className="tabular text-[11px] text-muted">{creator.rankLabel}</span>}
          </div>
        </header>

        <div className="relative my-3 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-canvas">
          {/* Portrait placeholder until real creator photos are supplied. */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-pitch-green/80 via-navy to-canvas" />
          <span className="relative font-logo text-5xl font-black text-mint/70">{creator.initials}</span>
          <span className="absolute top-2 right-2 rounded bg-canvas/80 px-1.5 py-0.5 backdrop-blur-md">
            <ShieldCheck aria-label="Verified creator" className="size-3.5 text-primary" />
          </span>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-canvas to-transparent" />
        </div>

        <div className="mb-3 flex flex-col gap-0.5">
          <h3 className="font-display text-xl font-extrabold tracking-wide uppercase">{creator.name}</h3>
          <p className="text-label text-primary">{creator.tagline}</p>
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-canvas/90 p-2.5">
          {ratingLabels.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between px-1">
              <dt className="tabular text-[11px] text-muted">{label}</dt>
              <dd className={cn("tabular text-sm font-bold", key === "meta" && "text-mint", key === "gam" && "text-primary")}>
                {creator.ratings[key]}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between">
          <span className="tabular text-xs text-muted">
            {creator.countryCode} · {creator.role}
          </span>
          {showProfileLink && (
          <Link
            href={`/creators/${creator.slug}`}
            className="text-label flex items-center gap-1 text-primary transition-colors after:absolute after:inset-0 hover:text-on-surface"
          >
            Profile
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
          )}
        </div>
      </div>
    </article>
  );
}
