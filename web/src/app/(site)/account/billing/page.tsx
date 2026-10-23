import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Coins, CreditCard, Info, Lock, ReceiptText } from "lucide-react";
import { openBillingPortal } from "@/app/(site)/account/actions";
import { AccountHeading, fmtDate, SignInToManage } from "@/components/account/AccountBits";
import { StatusNote } from "@/components/auth/AuthBits";
import { DashPanel } from "@/components/dashboard/DashboardBits";
import { Button } from "@/components/ui/Button";
import { LEGAL_EMAIL } from "@/data/legal";
import { getPlus } from "@/lib/content";
import { getMembership } from "@/lib/membership";
import { getBillingIds, listPayments } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Billing" };

// Cards and receipts live with Dodo Payments. This page lists the payments from Dodo; changing the card
// and downloading invoices happen in Dodo's billing portal (openBillingPortal).

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount / 100);

const PAYMENT_LABELS: Record<string, string> = {
  succeeded: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  processing: "Processing",
};

function Empty({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/12 p-8 text-center">
      {icon}
      <p className="font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted">{children}</p>
    </div>
  );
}

export default async function BillingPage({ searchParams }: PageProps<"/account/billing">) {
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

  const [plus, membership, billing] = await Promise.all([getPlus(), getMembership(viewer), getBillingIds(viewer)]);
  const payments = billing?.customerId ? await listPayments(billing.customerId).catch(() => undefined) : [];
  const portalError = (await searchParams).portal === "error";
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

      {portalError && <StatusNote tone="error">We couldn&apos;t open the billing portal just now. Please try again.</StatusNote>}

      <DashPanel id="card-heading" title="Payment method">
        <div className="flex flex-col gap-4 rounded-xl border border-white/8 bg-surface p-5 sm:flex-row sm:items-center">
          <CreditCard aria-hidden className="size-7 shrink-0 text-primary" />
          <p className="flex-1 text-sm text-muted">
            Your card is kept safely by our payment partner, Dodo Payments. Change it, or download invoices, in the
            billing portal.
          </p>
          {billing?.customerId && (
            <form action={openBillingPortal}>
              <Button type="submit" variant="glass" size="md" className="w-full sm:w-auto">
                Change card
                <ArrowUpRight aria-hidden className="size-4" />
              </Button>
            </form>
          )}
        </div>
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
        {payments === undefined ? (
          <Empty icon={<ReceiptText aria-hidden className="size-7 text-muted" />} title="Payments couldn't load">
            Refresh the page in a minute, or open the billing portal.
          </Empty>
        ) : payments.length === 0 ? (
          <Empty icon={<ReceiptText aria-hidden className="size-7 text-muted" />} title="No payments yet">
            {membership?.status === "trialing"
              ? "You're on the free trial, so nothing has been charged yet."
              : "Every payment and its receipt will be listed here."}
          </Empty>
        ) : (
          <ul className="flex flex-col divide-y divide-white/8 rounded-xl border border-white/8 bg-surface">
            {payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <span className="tabular min-w-24 text-white">{fmtDate(payment.createdAt)}</span>
                <span className="tabular font-semibold">{money(payment.amount, payment.currency)}</span>
                <span className="text-muted">
                  {payment.amount === 0 ? "Free trial started" : (PAYMENT_LABELS[payment.status] ?? "Pending")}
                </span>
                {payment.card && <span className="tabular text-muted">{payment.card}</span>}
                {payment.invoiceUrl && (
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-label ml-auto flex items-center gap-1 text-primary hover:text-white"
                  >
                    Invoice
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
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
