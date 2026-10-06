import { Clock, ShieldCheck, Zap } from "lucide-react";

const steps = [
  "A new patch drops.",
  "The meta changes.",
  "A player suddenly becomes broken.",
  "A tactic stops working.",
  "The market moves.",
];

export function HardTruth() {
  return (
    <section aria-labelledby="hard-truth-heading" className="border-y border-white/6 bg-canvas py-20 lg:py-24">
      <div className="page-container grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <ol className="flex flex-col gap-3 lg:col-span-6">
          {steps.map((step, index) =>
            index === 2 ? (
              <li
                key={step}
                className="my-1 -skew-x-6 bg-gradient-to-r from-[#007a5a] via-[#1e40af] to-[#6366f1] px-5 py-4 shadow-[0_0_30px_rgb(0_122_90/0.4)]"
              >
                <span className="flex skew-x-6 items-center gap-3 font-display text-lg font-extrabold uppercase tracking-wide lg:text-2xl">
                  <Zap aria-hidden className="size-6 shrink-0 animate-pulse text-mint" />
                  {index + 1}. {step}
                </span>
              </li>
            ) : (
              <li
                key={step}
                className="px-5 py-2 font-display text-lg font-extrabold tracking-wide text-white/50 uppercase lg:text-2xl"
              >
                {index + 1}. {step}
              </li>
            ),
          )}
        </ol>

        <div className="flex flex-col gap-6 lg:col-span-6 lg:pl-6">
          <p className="flex items-center gap-2">
            <span aria-hidden className="h-6 w-1.5 rounded-full bg-primary" />
            <span className="font-logo text-xs font-bold tracking-widest uppercase">The hard truth</span>
          </p>
          <h2 id="hard-truth-heading" className="sr-only">
            Why FC Lads exists
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            Most players don&apos;t have the time to spend hundreds of hours figuring everything out. We do. FC Lads
            brings together experienced FC creators and players from around the world who test the game, play FUT
            Champs, follow the market and break down what actually works.
          </p>
          <div className="pt-2">
            <p className="font-display text-4xl leading-none font-extrabold text-mint uppercase drop-shadow-[0_0_25px_rgb(143_240_201/0.3)] lg:text-5xl">
              You just get the answer.
            </p>
            <ul className="tabular mt-4 flex flex-wrap items-center gap-6 text-xs text-muted">
              <li className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-4 text-primary" /> No hours wasted
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck aria-hidden className="size-4 text-primary" /> Tested in-game
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
