import { CheckCircle2, Lock, Zap } from "lucide-react";
import { ShieldMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";

export const JOIN_HREF = "/signup?plan=plus";

export function PlusHero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_10%,rgb(14_42_34/0.9),transparent)]" />
        <div className="absolute -top-20 right-1/4 h-[900px] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-mint/20 to-transparent" />
      </div>

      <div className="page-container relative grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <p className="text-label rounded-full border border-primary/40 bg-pitch-green px-3 py-1 text-mint">
            Lads+ membership {"//"} all-access pass
          </p>
          <h1 className="text-hero">
            FC Lads<span className="text-primary">+</span>
          </h1>
          <p className="font-display text-2xl leading-tight font-extrabold md:text-3xl">
            Stop guessing. Ask people who know the game.
          </p>
          <p className="max-w-xl text-lg text-muted">
            FC Lads+ is for players who want more than YouTube videos. Join the actual FC Lads community: premium guides,
            the private Discord, the creators, the weekly trading brief and a personal gameplay review every month.
          </p>

          <div className="glass flex w-full max-w-xl flex-col gap-5 rounded-2xl p-5 shadow-rim sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold">{ladsPlus.priceLabel}</span>
                <span className="text-muted">/ month</span>
              </p>
              <p className="tabular mt-1 flex items-center gap-1.5 text-xs text-mint">
                <CheckCircle2 aria-hidden className="size-3.5" />
                Billed monthly · Instant access
              </p>
              <p className="mt-1 text-xs text-muted">Cancel anytime from your account</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button href={JOIN_HREF} variant="primary" size="lg">
                Join FC Lads+
                <Zap aria-hidden className="size-4" />
              </Button>
              <p className="tabular flex items-center justify-center gap-1.5 text-[11px] text-muted">
                <Lock aria-hidden className="size-3" />
                Secure payment
              </p>
            </div>
          </div>
        </div>

        {/* Decorative membership card */}
        <div className="flex justify-center lg:col-span-5">
          <div className="relative w-full max-w-sm rotate-2 rounded-3xl bg-gradient-to-br from-mint via-primary to-azure p-[2px] shadow-[0_0_60px_rgb(43_217_139/0.35)] transition-transform duration-500 hover:rotate-0">
            <div className="relative flex aspect-[1/1.25] flex-col justify-between overflow-hidden rounded-[22px] bg-canvas p-6">
              <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-transparent via-mint/10 to-transparent" />
              <div aria-hidden className="absolute -top-20 -right-20 size-56 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="font-logo text-lg font-black">FC LADS+</p>
                  <p className="tabular text-[10px] text-mint uppercase">Member access</p>
                </div>
                <ShieldMark className="size-10" />
              </div>
              <div className="relative flex flex-col items-center gap-2 text-center">
                <span className="flex size-24 flex-col items-center justify-center rounded-2xl border border-primary/40 bg-pitch-green shadow-[0_0_30px_rgb(43_217_139/0.3)]">
                  <span className="font-display text-4xl leading-none font-extrabold text-mint">99</span>
                  <span className="tabular text-[10px] text-muted">META</span>
                </span>
                <p className="font-display text-2xl font-extrabold tracking-widest uppercase">Elite tier</p>
              </div>
              <div className="tabular relative flex items-end justify-between text-[10px] text-muted uppercase">
                <span>
                  Member since
                  <br />
                  <span className="text-sm text-white">Today</span>
                </span>
                <span className="text-right">
                  Status
                  <br />
                  <span className="text-sm text-mint">Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
