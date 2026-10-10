import "server-only";

// Placeholder account data for the signed-in member (Account & billing pages).
// TODO: replace with the real subscription, card and invoices from the payment provider once payments are built.

export interface Invoice {
  id: string;
  date: string;
  cycle: number;
  amount: number;
  status: "paid";
}

export const membership = {
  plan: "FC Lads+",
  subscriptionId: "FL-2026-0628",
  status: "active" as const,
  autoRenew: true,
  memberSince: "2026-06-28",
  nextPayment: "2026-10-28",
};

export const paymentCard = {
  brand: "Visa",
  last4: "4242",
  expires: "08/28",
  holder: "Arjun N.",
};

export const invoices: Invoice[] = [
  { id: "LAD-2026-0928", date: "2026-09-28", cycle: 4, amount: 29, status: "paid" },
  { id: "LAD-2026-0828", date: "2026-08-28", cycle: 3, amount: 29, status: "paid" },
  { id: "LAD-2026-0728", date: "2026-07-28", cycle: 2, amount: 29, status: "paid" },
  { id: "LAD-2026-0628", date: "2026-06-28", cycle: 1, amount: 29, status: "paid" },
];

export const billingDetails = { country: "United Kingdom", currency: "USD ($)" };
