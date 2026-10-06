import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const LADS_PLUS_PRICE = "$29";

const defaultPerks = [
  "Premium guides & slider codes",
  "Private FC Lads Discord",
  "Weekly Trading Brief",
  "Monthly 1-on-1 review",
];

interface PaywallProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  perks?: string[];
  className?: string;
}

/**
 * Upsell block for locked FC Lads+ content.
 * Important: this is presentation only. Locked content must never be sent to the browser for
 * non-members; the server decides what to render (see report §6 "Paywall rule").
 */
export function Paywall({
  eyebrow = "FC Lads+ exclusive",
  title = "This continues for FC Lads+ members",
  description = "Unlock the full breakdown, custom slider codes, VOD analysis and the private Discord coach channels.",
  perks = defaultPerks,
  className,
}: PaywallProps) {
  return (
    <section
      aria-label="FC Lads+ membership required"
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl bg-surface-container/95 p-6 text-center shadow-[0_20px_60px_rgb(0_0_0/0.85)] backdrop-blur-2xl md:p-10",
        className,
      )}
    >
      <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/30 to-secondary/30 text-primary shadow-[0_0_24px_rgb(43_217_139/0.3)]">
        <Lock aria-hidden className="size-8" />
      </span>
      <span className="text-label mb-3 rounded-full bg-primary/10 px-3 py-1 text-primary">{eyebrow}</span>
      <h3 className="text-headline">{title}</h3>
      <p className="mt-3 max-w-lg text-muted">{description}</p>

      <ul className="my-6 grid w-full gap-3 text-left sm:grid-cols-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 rounded-lg bg-surface-high p-2.5 text-sm font-semibold">
            <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />
            {perk}
          </li>
        ))}
      </ul>

      <p className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold">{LADS_PLUS_PRICE}</span>
        <span className="tabular text-sm text-muted">/ month · Cancel anytime</span>
      </p>
      <Button href="/lads-plus" variant="primary" size="lg" className="mt-4 w-full max-w-sm">
        Join FC Lads+
      </Button>
      <p className="mt-4 text-sm text-muted">
        Already a Lad?{" "}
        <Link href="/login" className="text-on-surface underline hover:text-primary">
          Log in to view
        </Link>
      </p>
    </section>
  );
}
