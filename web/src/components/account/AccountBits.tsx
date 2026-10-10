import Link from "next/link";
import type { ReactNode } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
export function SignInToManage() {
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
      <Button href="/login" variant="primary" size="lg" className="w-full max-w-xs">
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
