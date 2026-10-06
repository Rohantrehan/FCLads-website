import { CheckCircle2, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";

const outcomes = [
  "Learn the game.",
  "Understand the meta.",
  "Follow the market.",
  "Talk to experienced players.",
  "Get your gameplay analysed.",
  "Improve every month.",
];

export function MembershipCta() {
  return (
    <>
      <section aria-labelledby="one-membership-heading" className="border-t border-white/6 bg-surface py-20">
        <div className="page-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <div>
              <p className="tabular text-xs font-bold tracking-widest text-primary uppercase">All-in-one access</p>
              <h2 id="one-membership-heading" className="text-headline mt-1">
                One membership. Everything FC.
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-center gap-3 text-sm font-semibold">
                  <CheckCircle2 aria-hidden className="size-5 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#0f141b] p-6 shadow-[0_15px_40px_rgb(0_0_0/0.6)] md:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-extrabold uppercase">FC Lads+ pass</p>
                  <p className="tabular mt-0.5 text-xs text-muted">Cancel anytime</p>
                </div>
                <p className="text-right">
                  <span className="font-display text-3xl font-extrabold">{ladsPlus.priceLabel}</span>
                  <span className="tabular text-xs text-mint">/mo</span>
                </p>
              </div>
              <div aria-hidden className="h-px w-full bg-white/5" />
              <dl className="tabular flex flex-col gap-2.5 text-xs text-muted">
                <div className="flex justify-between gap-4">
                  <dt>Activation</dt>
                  <dd className="text-white">Instant</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Platform</dt>
                  <dd className="text-white">Console / PC</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Discord role</dt>
                  <dd className="text-primary">Added automatically</dd>
                </div>
              </dl>
              <Button href="/lads-plus" className="w-full rounded-xl">
                Join FC Lads+
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Log in" className="page-container py-12">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/8 bg-surface-high/40 p-5 backdrop-blur-xl sm:flex-row">
          <p className="flex items-center gap-3 text-sm font-medium">
            <CircleUser aria-hidden className="size-6 shrink-0 text-primary" />
            Already a Lad? Log in to access your FC Lads+ dashboard, custom tactics and pro queue.
          </p>
          <Button href="/login" variant="glass" size="sm" className="shrink-0 rounded-lg">
            Log in
          </Button>
        </div>
      </section>
    </>
  );
}
