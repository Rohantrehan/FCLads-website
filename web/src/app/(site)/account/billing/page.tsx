import type { Metadata } from "next";
import Link from "next/link";
import { Coins, CreditCard, Info, Lock, ReceiptText } from "lucide-react";
import { AccountHeading, fmtDate, SignInToManage } from "@/components/account/AccountBits";
import { DashPanel } from "@/components/dashboard/DashboardBits";
import { LEGAL_EMAIL } from "@/data/legal";
import { getPlus } from "@/lib/content";
import { getMembership } from "@/lib/membership";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Billing" };

// Cards and receipts live with the payment provider (Stripe, still to connect). Until then this page
// shows the member's real plan dates and empty states, never sample cards or invoices.

function Empty({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/12 p-8 text-center">
      {icon}
      <p className="font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted">{children}</p>
    </div>
  );
}

export default async function BillingPage() {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return <SignInToManage next="/account/billing" />;
  if (!viewer.isMember) {
    return (
      <>
        <AccountHeading title="Billing" description="Your payment card, past payments and receipts for FC Lads+." />
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/12 p-10 text-center">
          <ReceiptText aria-hidden className="size-8 text-muted" />
          <p className="font-semibold">No payments yet</p>
          <p className="max-w-md text-sm text-muted">
            You&apos;re on the free plan. Your card and receipts show up here once you start FC Lads+.
          </p>
          <Link href="/account/membership" className="text-label text-primary hover:text-white">
            See your plan
          </Link>
        </section>
      </>
    );
  }

  const [plus, membership] = await Promise.all([getPlus(), getMembership(viewer)]);
  const nextCharge = membership?.status === "trialing" ? (membership.trialEnd ?? membership.currentPeriodEnd) : membership?.currentPeriodEnd;

  return (
    <>
      <AccountHeading
        title="Billing"
        description="Your payment card, past payments and receipts for FC Lads+."
        aside={
          <p className="tabular flex items-center gap-2 self-start rounded-lg border border-white/10 bg-[#0f141b] px-3 py-2 text-xs text-muted md:self-auto">
            <Lock aria-hidden className="size-4 text-primary" />
            Card details are never stored by FC Lads
          </p>
        }
      />

      <DashPanel id="card-heading" title="Payment method">
        <Empty icon={<CreditCard aria-hidden className="size-7 text-muted" />} title="No card on file yet">
          Card payments are being set up. Your card will show here, and you&apos;ll be able to change it, once they&apos;re live.
        </Empty>
        {!membership?.cancelAtPeriodEnd && nextCharge && (
          <p className="flex items-start gap-2 text-sm text-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Next charge: <strong className="text-white">{plus.priceLabel}</strong> on{" "}
              <strong className="text-white">{fmtDate(nextCharge)}</strong>.
            </span>
          </p>
        )}
      </DashPanel>

      <DashPanel id="invoices-heading" title="Payment history" icon={<ReceiptText aria-hidden className="size-5 text-primary" />}>
        <Empty icon={<ReceiptText aria-hidden className="size-7 text-muted" />} title="No payments yet">
          Every payment and its receipt will be listed here.
        </Empty>
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          Need a VAT invoice?{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary hover:text-white">
            {LEGAL_EMAIL}
          </a>
        </p>
      </DashPanel>

      <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4 md:max-w-md">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-highest">
          <Coins aria-hidden className="size-5 text-primary" />
        </span>
        <p className="flex-1">
          <span className="text-label block text-muted">Currency</span>
          <span className="font-semibold">{plus.currency}</span>
        </p>
      </div>
    </>
  );
}
