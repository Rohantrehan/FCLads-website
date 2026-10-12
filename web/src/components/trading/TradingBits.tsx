import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, Eye, Lock, MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";

/** Card shell with a green bar before the title, as in the brief design. */
export function BriefSection({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-3 font-display text-lg font-extrabold uppercase md:text-xl">
          <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {aside && <span className="tabular text-[11px] text-mint uppercase">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** A card (or card type) to keep an eye on, with the creator's short note. Plain text: no player database. */
export function WatchRow({ card, note }: { card: string; note: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-3">
      <Eye aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold">{card}</span>
        <span className="text-xs text-muted">{note}</span>
      </span>
    </div>
  );
}

const trendMeta = {
  up: { icon: TrendingUp, label: "Rising", className: "text-primary" },
  down: { icon: TrendingDown, label: "Falling", className: "text-danger-soft" },
  flat: { icon: MoveRight, label: "Steady", className: "text-gold" },
};

/** Direction label for a market trend: icon + word, never colour alone. */
export function TrendTag({ direction }: { direction: keyof typeof trendMeta }) {
  const { icon: Icon, label, className } = trendMeta[direction];
  return (
    <span className={cn("tabular inline-flex items-center gap-1 text-[11px] font-bold uppercase", className)}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

/** What the locked brief contains, with the upsell. Only titles: no brief content is sent. */
export function LockedBrief({ week, sections }: { week: number; sections: string[] }) {
  return (
    <section aria-labelledby="brief-locked-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="tabular flex items-center gap-2 text-[11px] font-bold text-gold uppercase">
            <Lock aria-hidden className="size-3.5" />
            FC Lads+ members
          </p>
          <h2 id="brief-locked-heading" className="text-headline mt-1">
            Weekly trading brief: week {week}
          </h2>
          <p className="mt-1 text-sm text-muted">Every Monday: what to buy, what to sell, and when.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ol className="flex flex-col gap-2 lg:col-span-5">
          {sections.map((section, index) => (
            <li key={section} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0f141b] p-4">
              <span className="tabular text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-semibold">{section}</span>
              <Lock aria-hidden className="size-4 text-gold/80" />
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-pitch-green/70 to-[#0f141b] p-6 text-center md:p-8 lg:col-span-7">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lock aria-hidden className="size-6" />
          </span>
          <h3 className="font-display text-2xl leading-tight font-extrabold uppercase md:text-3xl">
            Every week we break down what&apos;s happening in the market
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-left text-sm sm:grid-cols-2">
            {[
              "Buy and sell price targets",
              "Upcoming events and promo calendar",
              "Fodder price forecasts",
              "Cards to watch, every week",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />
                {perk}
              </li>
            ))}
          </ul>
          <Button href={JOIN_HREF} variant="primary" className="mt-2">
            Unlock the brief ({ladsPlus.priceLabel}/mo)
          </Button>
          <Link href="/login" className="text-sm text-primary hover:text-white">
            Already a member? Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ConfidenceBadge({ level }: { level: "High" | "Medium" }) {
  return (
    <span
      className={cn(
        "tabular rounded px-2 py-0.5 text-[10px] font-bold uppercase",
        level === "High" ? "bg-primary/15 text-mint" : "bg-gold/15 text-gold",
      )}
    >
      {level} confidence
    </span>
  );
}
