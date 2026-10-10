import type { Metadata } from "next";
import { CheckCircle2, Coins, Info, Lock, MapPin, ReceiptText } from "lucide-react";
import { AccountHeading, fmtDate, SignInToManage } from "@/components/account/AccountBits";
import { NotYetButton } from "@/components/account/NotYetButton";
import { DashPanel } from "@/components/dashboard/DashboardBits";
import { billingDetails, type Invoice, invoices, membership, paymentCard } from "@/data/account";
import { LEGAL_EMAIL } from "@/data/legal";
import { ladsPlus } from "@/data/ladsPlus";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Billing" };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: ladsPlus.currency });
const RECEIPT_NOTE = "Receipts arrive with payments";

function StatusBadge({ status }: { status: Invoice["status"] }) {
  return (
    <span className="tabular inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-mint uppercase">
      <CheckCircle2 aria-hidden className="size-3.5" />
      {status}
    </span>
  );
}

const receiptButton =
  "tabular inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-muted uppercase transition-colors hover:border-primary/40 hover:text-white";

export default async function BillingPage() {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return <SignInToManage />;

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

      <DashPanel
        id="card-heading"
        title="Payment method"
        action={<span className="text-label rounded-md bg-primary px-2 py-1 text-on-primary">Used for FC Lads+</span>}
      >
        <div className="flex flex-col gap-4 rounded-xl border border-white/8 bg-surface p-4 sm:flex-row sm:items-center">
          <span
            aria-hidden
            className="flex h-12 w-[4.5rem] shrink-0 flex-col justify-between rounded-lg border border-white/10 bg-gradient-to-br from-surface-highest to-surface-high p-2"
          >
            <span className="h-2.5 w-4 rounded-sm bg-primary/70" />
            <span className="tabular text-[10px] font-bold tracking-wider uppercase">{paymentCard.brand}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold">
              {paymentCard.brand} ending {paymentCard.last4}
              <span className="text-label rounded bg-primary/15 px-1.5 py-0.5 text-mint">Default</span>
            </p>
            <p className="tabular text-sm text-muted">
              Expires {paymentCard.expires} · {paymentCard.holder}
            </p>
          </div>
          <NotYetButton
            note="Card changes arrive with payments"
            icon="edit"
            className="text-label inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-surface-highest px-4 py-2.5 transition-colors hover:border-primary/50"
          >
            Update card
          </NotYetButton>
        </div>
        <p className="flex items-start gap-2 text-sm text-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Next charge: <strong className="text-white">{money.format(ladsPlus.price)}</strong> on{" "}
            <strong className="text-white">{fmtDate(membership.nextPayment)}</strong>.
          </span>
        </p>
      </DashPanel>

      <DashPanel
        id="invoices-heading"
        title="Payment history"
        icon={<ReceiptText aria-hidden className="size-5 text-primary" />}
        action={<span className="tabular text-xs text-muted">{invoices.length} payments</span>}
      >
        {/* Phones: one card per payment. */}
        <ul className="flex flex-col gap-3 md:hidden">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{fmtDate(invoice.date)}</p>
                  <p className="tabular text-xs text-muted">FC Lads+ monthly · Month {invoice.cycle}</p>
                </div>
                <p className="tabular font-bold text-mint">{money.format(invoice.amount)}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={invoice.status} />
                <NotYetButton note={RECEIPT_NOTE} icon="download" className={receiptButton}>
                  Receipt
                </NotYetButton>
              </div>
            </li>
          ))}
        </ul>

        {/* Tablet and up: a table. */}
        <div className="hidden overflow-hidden rounded-xl border border-white/8 md:block">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">FC Lads+ payments, newest first</caption>
            <thead className="bg-surface text-label text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="tabular px-4 py-4 whitespace-nowrap">{fmtDate(invoice.date)}</td>
                  <td className="px-4 py-4">
                    <span className="block font-semibold">FC Lads+ monthly</span>
                    <span className="tabular text-xs text-muted">
                      Month {invoice.cycle} · Ref {invoice.id}
                    </span>
                  </td>
                  <td className="tabular px-4 py-4 font-bold text-mint">{money.format(invoice.amount)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <NotYetButton note={RECEIPT_NOTE} icon="download" className={receiptButton}>
                      PDF
                    </NotYetButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex flex-col gap-1 rounded-xl bg-surface px-4 py-3 text-sm text-muted sm:flex-row sm:justify-between">
          <span>
            Showing all {invoices.length} payments since {fmtDate(membership.memberSince, "month")}
          </span>
          <span>
            Need a VAT invoice?{" "}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary hover:text-white">
              {LEGAL_EMAIL}
            </a>
          </span>
        </p>
      </DashPanel>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-highest">
            <MapPin aria-hidden className="size-5 text-primary" />
          </span>
          <p className="flex-1">
            <span className="text-label block text-muted">Billing country</span>
            <span className="font-semibold">{billingDetails.country}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-highest">
            <Coins aria-hidden className="size-5 text-primary" />
          </span>
          <p className="flex-1">
            <span className="text-label block text-muted">Currency</span>
            <span className="font-semibold">{billingDetails.currency}</span>
          </p>
          <span className="tabular text-[11px] text-muted uppercase">Fixed</span>
        </div>
      </div>
    </>
  );
}
