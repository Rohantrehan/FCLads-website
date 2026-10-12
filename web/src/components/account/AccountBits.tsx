import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ladsPlus, ladsPlusPerks } from "@/data/ladsPlus";

const dateFormats = {
  long: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
  short: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
  month: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }),
};

/** Formats an ISO date: "28 Oct 2026" (long), "28 Oct" (short) or "Oct 2026" (month). */
export function fmtDate(iso: string, style: keyof typeof dateFormats = "long") {
  return dateFormats[style].format(new Date(`${iso}T00:00:00Z`));
}

/** Title row for an account page. */
export function AccountHeading({
  title,
  description,
  aside,
}: {
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          Account & settings
        </p>
        <h1 className="font-display text-3xl leading-none font-extrabold uppercase md:text-5xl">{title}</h1>
        <p className="max-w-2xl text-muted">{description}</p>
      </div>
      {aside}
    </div>
  );
}

/** What visitors who aren't signed in see. Account data is never rendered for them. */
export function SignInToManage({ next = "/account/membership" }: { next?: string }) {
  return (
    <section
      aria-labelledby="sign-in-heading"
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-8 text-center md:p-10"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <UserRound aria-hidden className="size-7" />
      </span>
      <h1 id="sign-in-heading" className="text-headline">
        Log in to manage your account
      </h1>
      <p className="text-muted">Your membership, payment card and receipts are here once you&apos;re logged in.</p>
      <Button href={`/login?next=${encodeURIComponent(next)}`} variant="primary" size="lg" className="w-full max-w-xs">
        Log in
      </Button>
      <p className="text-sm text-muted">
        Not a member yet?{" "}
        <Link href="/lads-plus" className="text-on-surface underline hover:text-primary">
          See FC Lads+
        </Link>
      </p>
    </section>
  );
}

/** Membership card for signed-in users without FC Lads+: the free plan and the trial offer. */
export function FreePlan({ name, email }: { name?: string; email?: string }) {
  return (
    <section
      aria-labelledby="free-plan-heading"
      className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#0f141b] p-6 md:p-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-label text-muted">Current plan</p>
          <h2 id="free-plan-heading" className="font-display text-3xl font-extrabold">
            Free
          </h2>
          {(name || email) && (
            <p className="text-sm break-all text-muted">
              {name && <span className="font-semibold text-on-surface">{name}</span>}
              {name && email && " · "}
              {email}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <p className="tabular text-sm">
            <span className="font-display text-2xl font-extrabold text-mint">{ladsPlus.priceLabel}</span>
            <span className="text-muted"> / month after a {ladsPlus.trialDays}-day free trial</span>
          </p>
          <p className="text-xs text-muted">Cancel any time. No charge if you cancel during the trial.</p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ladsPlusPerks.map((perk) => (
          <li key={perk.key} className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4">
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{perk.title}</span>
              <span className="text-sm text-muted">{perk.description}</span>
            </span>
          </li>
        ))}
      </ul>

      <Button href="/lads-plus" variant="primary" size="lg" className="w-full sm:w-auto sm:self-start">
        Start {ladsPlus.trialDays}-day free trial
        <ArrowRight aria-hidden className="size-4" />
      </Button>
    </section>
  );
}
