import type { Metadata } from "next";
import { CheckCircle2, Zap } from "lucide-react";
import { CompareTable, Faq } from "@/components/plus/CompareAndFaq";
import { PerkShowcase } from "@/components/plus/PerkShowcase";
import { JOIN_HREF, PlusHero } from "@/components/plus/PlusHero";
import { CreatorAccessSection, DiscordSection, ReviewSection, TradingSection } from "@/components/plus/PlusSections";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";

export const metadata: Metadata = {
  title: "FC Lads+ membership",
  description: `Every guide and video series, the private FC Lads Discord, creator access, a weekly trading brief and a monthly 1-on-1 gameplay review. ${ladsPlus.priceLabel} a month, cancel anytime.`,
  alternates: { canonical: "/lads-plus" },
};

const outcomes = [
  "Learn the game.",
  "Understand the meta.",
  "Follow the market.",
  "Talk to experienced players.",
  "Get your gameplay analysed.",
  "Improve every month.",
];

export default function LadsPlusPage() {
  return (
    <>
      <PlusHero />

      <section aria-labelledby="includes-heading" className="border-t border-white/6 bg-surface py-16 lg:py-20">
        <div className="page-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-label text-mint">What you get</p>
            <h2 id="includes-heading" className="text-headline mt-2">
              Your membership includes
            </h2>
            <p className="mt-2 text-muted">Everything you need to compete at the top level in Ultimate Team.</p>
          </div>
          <PerkShowcase />
        </div>
      </section>

      <DiscordSection />
      <div className="border-t border-white/6 bg-surface">
        <CreatorAccessSection />
      </div>
      <TradingSection />
      <div className="border-t border-white/6 bg-surface">
        <ReviewSection />
      </div>

      <section aria-labelledby="summary-heading" className="page-container py-16">
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-pitch-green via-[#0a1d17] to-canvas p-6 md:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-label text-mint">All-in-one</p>
            <h2 id="summary-heading" className="text-headline mt-2">
              One membership. Everything FC.
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-center gap-3 font-semibold">
                  <CheckCircle2 aria-hidden className="size-5 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-rim lg:col-span-5">
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold">{ladsPlus.priceLabel}</span>
              <span className="text-muted">/ month</span>
            </p>
            <p className="text-sm text-muted">No contract · Cancel anytime</p>
            <Button href={JOIN_HREF} size="lg" className="w-full">
              Join FC Lads+
              <Zap aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-white/6 bg-surface">
        <CompareTable />
      </div>
      <Faq />
    </>
  );
}
