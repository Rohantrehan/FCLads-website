import Link from "next/link";
import type { ReactNode } from "react";
import { Paywall } from "@/components/ui/Paywall";
import { cn } from "@/lib/cn";

/** Page title row for a dashboard tab. */
export function DashboardHeading({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl leading-none font-extrabold uppercase md:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted">{description}</p>}
      </div>
      {aside}
    </div>
  );
}

/** Card shell used across the dashboard. */
export function DashPanel({
  id,
  title,
  icon,
  action,
  className,
  children,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Small link in a panel's top-right corner. */
export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-label text-primary transition-colors hover:text-white">
      {children}
    </Link>
  );
}

/** Thin progress bar. `value` is 0–100. */
export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn("h-1.5 overflow-hidden rounded-full bg-surface-highest", className)}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/** What non-members see on any dashboard page. The member content is never rendered for them. */
export function MembersOnly() {
  return (
    <div className="page-container py-16">
      <Paywall
        eyebrow="Members area"
        title="Your FC Lads+ dashboard"
        description="Log in with your FC Lads+ account to see your feed, the trading brief, the video library, your monthly review and the private Discord."
        className="shadow-none"
      />
    </div>
  );
}
