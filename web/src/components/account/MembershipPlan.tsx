"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Award, CalendarDays, History, Lock, RotateCcw, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface MembershipPlanProps {
  plan: string;
  subscriptionId: string;
  priceLabel: string;
  /** Pre-formatted dates, e.g. "28 Oct 2026". */
  nextPayment: string;
  nextPaymentShort: string;
  memberSince: string;
  losses: { title: string; detail: string }[];
  /** Server-rendered sections shown between the plan card and the cancel row. */
  children: ReactNode;
}

/**
 * Plan card + "Cancel membership" row + the confirmation dialog.
 * Cancelling isn't saved yet (no payments backend): it previews the cancelled state only.
 */
export function MembershipPlan({
  plan,
  subscriptionId,
  priceLabel,
  nextPayment,
  nextPaymentShort,
  memberSince,
  losses,
  children,
}: MembershipPlanProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);
  const [cancelled, setCancelled] = useState(false);
  const changed = useRef(false);

  // Move focus to the row that replaced the button the user just pressed.
  useEffect(() => {
    if (!changed.current) return;
    (cancelled ? keepButtonRef : cancelButtonRef).current?.focus();
  }, [cancelled]);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  const setStatus = (value: boolean) => {
    changed.current = true;
    setCancelled(value);
  };
  const confirmCancel = () => {
    setStatus(true);
    close();
  };

  return (
    <>
      <section
        aria-labelledby="plan-heading"
        className={cn(
          "relative overflow-hidden rounded-2xl border",
          cancelled
            ? "border-gold/30 bg-[#0f141b]"
            : "border-primary/30 bg-gradient-to-br from-pitch-green to-[#0f141b]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.025)_0_2px,transparent_2px_14px)]"
        />
        <div className="relative flex flex-col gap-6 p-5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-canvas/60">
                <Award aria-hidden className="size-6 text-primary" />
              </span>
              <div>
                <h2
                  id="plan-heading"
                  className="font-display text-3xl leading-none font-extrabold uppercase md:text-4xl"
                >
                  {plan}
                </h2>
                <p className="tabular mt-1 text-[11px] tracking-widest text-mint uppercase">
                  Subscription {subscriptionId}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "tabular flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase",
                cancelled ? "border-gold/40 bg-gold/10 text-gold" : "border-primary/40 bg-primary/10 text-mint",
              )}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", cancelled ? "bg-gold" : "bg-mint")} />
              {cancelled ? `Ends ${nextPaymentShort}` : "Active membership"}
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none font-extrabold">{priceLabel}</span>
              <span className="text-lg text-muted">/ month</span>
            </p>
            <span className="tabular rounded-md border border-white/10 bg-canvas/60 px-3 py-1.5 text-xs font-bold text-mint uppercase">
              {cancelled ? "Auto-renew off" : "Auto-renew on"}
            </span>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <span className="tabular flex items-center gap-2 text-muted">
              <CalendarDays aria-hidden className="size-4" />
              {cancelled ? "Access until" : "Next payment"}: <strong className="text-white">{nextPayment}</strong>
            </span>
            <span className="tabular flex items-center gap-2 text-muted">
              <History aria-hidden className="size-4" />
              Member since <strong className="text-white">{memberSince}</strong>
            </span>
            <Link
              href="/account/billing"
              className="text-label flex items-center gap-1.5 text-primary transition-colors hover:text-white sm:ml-auto"
            >
              Manage payment method
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {children}

      {cancelled ? (
        <section
          aria-labelledby="cancelled-heading"
          className="flex flex-col gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:flex-row sm:items-center"
        >
          <RotateCcw aria-hidden className="size-6 shrink-0 text-gold" />
          <div className="flex-1">
            <h2 id="cancelled-heading" className="font-semibold">
              Your membership ends on {nextPayment}
            </h2>
            <p className="text-sm text-muted">
              You won&apos;t be charged again. Changed your mind? Turn it back on any time before then.
            </p>
            <p className="mt-1 text-xs text-muted/80">
              Preview only: payments aren&apos;t connected yet, so nothing was cancelled.
            </p>
          </div>
          <button
            ref={keepButtonRef}
            type="button"
            onClick={() => setStatus(false)}
            className="text-label rounded-lg bg-primary px-4 py-2.5 text-on-primary transition-all hover:brightness-110"
          >
            Keep my membership
          </button>
        </section>
      ) : (
        <section
          aria-labelledby="change-plan-heading"
          className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 sm:flex-row sm:items-center"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-highest">
            <RotateCcw aria-hidden className="size-5 text-muted" />
          </span>
          <div className="flex-1">
            <h2 id="change-plan-heading" className="font-semibold">
              Want to end your plan?
            </h2>
            <p className="text-sm text-muted">You keep everything until the end of the month you&apos;ve paid for.</p>
          </div>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="self-start rounded-lg px-3 py-2 text-sm text-muted underline-offset-4 transition-colors hover:text-danger-soft hover:underline sm:self-auto"
          >
            Cancel membership
          </button>
        </section>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="cancel-title"
        aria-describedby="cancel-description"
        onClick={(event) => event.target === event.currentTarget && close()}
        onClose={() => cancelButtonRef.current?.focus()}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain [scrollbar-width:thin] rounded-3xl border border-white/10 bg-[#11161d] p-0 text-on-surface shadow-[0_24px_80px_rgb(0_0_0/0.6)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-5 p-6 md:px-8 md:py-7">
          <div className="flex items-start justify-between gap-4">
            <p className="text-label flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1.5 text-danger-soft">
              <TriangleAlert aria-hidden className="size-4" />
              Cancel membership
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h2 id="cancel-title" className="font-display text-3xl leading-none font-extrabold uppercase">
              Cancel {plan}?
            </h2>
            <p id="cancel-description" className="text-muted">
              You&apos;ll keep access until <strong className="text-white">{nextPaymentShort}</strong>. After that you
              lose the members-only guides, the private Discord, the trading brief and your monthly review.
            </p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {losses.map((loss) => (
              <li key={loss.title} className="flex gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-danger/20 text-danger-soft">
                  <X aria-hidden className="size-4" />
                </span>
                <span>
                  <span className="block font-display text-sm font-extrabold uppercase">{loss.title}</span>
                  <span className="block text-[13px] leading-snug text-muted">{loss.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted">
            <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              You won&apos;t be charged again. You can turn it back on any time before{" "}
              <strong className="text-white">{nextPaymentShort}</strong> and nothing changes.
            </span>
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              autoFocus
              onClick={close}
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-display text-lg font-extrabold text-on-primary uppercase shadow-[0_0_24px_rgb(43_217_139/0.3)] transition-all hover:brightness-110"
            >
              <ShieldCheck aria-hidden className="size-5" />
              Keep my membership
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-danger-soft uppercase transition-colors hover:bg-danger/10"
            >
              Yes, cancel membership
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
