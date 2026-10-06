import { Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ladsPlus, ladsPlusPerks } from "@/data/ladsPlus";
import { PerkIcon } from "./PerkIcon";

export function LadsPlusTeaser() {
  return (
    <section aria-labelledby="lads-plus-heading" className="page-container py-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary-bright/30 bg-gradient-to-br from-pitch-green via-[#0a1d17] to-[#08160f] px-5 py-10 shadow-[0_20px_60px_rgb(14_42_34/0.6)] md:p-10 lg:p-14">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-mint/10 blur-[100px]" />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-1/4 h-full w-px rotate-45 bg-gradient-to-b from-transparent via-gold/20 to-transparent"
        />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="tabular mb-6 inline-flex items-center gap-2 rounded-full border border-primary-bright/40 bg-canvas/60 px-3.5 py-1.5 text-xs font-bold text-mint uppercase">
            <Award aria-hidden className="size-4" />
            Exclusive pro tier
          </p>
          <h2 id="lads-plus-heading" className="font-display text-3xl leading-tight font-extrabold uppercase lg:text-5xl">
            Stop guessing. Ask people who know the game.
          </h2>
          <p className="mt-4 flex flex-wrap items-baseline justify-center gap-2">
            <span className="font-display text-4xl font-extrabold lg:text-5xl">{ladsPlus.priceLabel}</span>
            <span className="font-display font-bold text-mint">/month</span>
            <span className="tabular ml-2 text-xs text-white/50">CANCEL ANYTIME</span>
          </p>

          <ul className="mt-10 grid w-full grid-cols-2 gap-3.5 text-left md:grid-cols-5">
            {ladsPlusPerks.map((perk, index) => (
              <li
                key={perk.key}
                className={`flex flex-col gap-2 rounded-xl border border-white/10 bg-canvas/60 p-4 backdrop-blur-md ${index === ladsPlusPerks.length - 1 ? "col-span-2 md:col-span-1" : ""}`}
              >
                <PerkIcon perk={perk.key} className="size-6 text-mint" />
                <span className="font-display text-xs font-bold uppercase">{perk.title}</span>
                <span className="text-xs text-muted">{perk.description}</span>
              </li>
            ))}
          </ul>

          <Button href="/lads-plus" size="lg" className="mt-10 px-10">
            Join FC Lads+
            <Zap aria-hidden className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
