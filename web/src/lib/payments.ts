import "server-only";

import DodoPayments from "dodopayments";
import type { Subscription } from "dodopayments/resources/subscriptions";
import { syncDiscordRole } from "@/lib/discord";
import { adminDb } from "@/lib/supabase/admin";
import { isMemberStatus, type Viewer } from "@/lib/viewer";

// FC Lads+ payments through Dodo Payments (merchant of record: they handle tax in every country).
// One subscription product with a free trial; the card is taken at checkout and first charged when the
// trial ends. Dodo is the source of truth: the webhook (/payments) and the checkout return (/join/done)
// fetch the subscription from Dodo and copy it into the memberships table, which decides access.

const apiKey = process.env.DODO_PAYMENTS_API_KEY;
const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";

export const isPaymentsConfigured = Boolean(apiKey && productId && adminDb);

export const dodo = apiKey ? new DodoPayments({ bearerToken: apiKey, environment }) : null;

const DAY = 86_400_000;

/** Dodo has no trial status: a subscription is on its trial until created_at + trial_period_days. */
function trialEnd(subscription: Subscription) {
  if (subscription.trial_period_days <= 0) return null;
  return new Date(new Date(subscription.created_at).getTime() + subscription.trial_period_days * DAY);
}

/** Dodo's status in the words the memberships table uses (see isMemberStatus for who keeps access). */
function membershipStatus(subscription: Subscription) {
  switch (subscription.status) {
    case "active": {
      const end = trialEnd(subscription);
      return end && end.getTime() > Date.now() ? "trialing" : "active";
    }
    // Renewal failed but Dodo's grace period is open: access stays while they retry.
    case "past_due":
      return "past_due";
    // Renewal failed and access is removed until the card is fixed.
    case "on_hold":
      return "unpaid";
    case "paused":
      return "paused";
    case "pending":
      return "incomplete";
    case "failed":
      return "incomplete_expired";
    case "cancelled":
    case "expired":
      return "canceled";
  }
}

/**
 * Copies a Dodo subscription into the memberships table. The account comes from the checkout metadata
 * (user_id), never from anything the browser sends. Returns false when the subscription isn't ours.
 */
export async function syncSubscription(subscription: Subscription) {
  if (!adminDb) throw new Error("Payments database isn't configured: set SUPABASE_SECRET_KEY.");
  const userId = subscription.metadata?.user_id;
  if (typeof userId !== "string" || subscription.product_id !== productId) return false;

  const { data: current, error: readError } = await adminDb
    .from("memberships")
    .select("subscription_id, status, trial_used")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(`Couldn't read the membership: ${readError.message}`);

  // An old subscription's late update never replaces a newer one that still gives access.
  if (current?.subscription_id && current.subscription_id !== subscription.subscription_id && isMemberStatus(current.status)) {
    return true;
  }

  const end = trialEnd(subscription);
  const status = membershipStatus(subscription);
  // The trial only counts as used once it actually started (a declined card at checkout doesn't use it).
  const trialStarted = subscription.trial_period_days > 0 && !["incomplete", "incomplete_expired"].includes(status);
  const { error } = await adminDb.from("memberships").upsert({
    user_id: userId,
    status,
    customer_id: subscription.customer.customer_id,
    subscription_id: subscription.subscription_id,
    trial_end: end?.toISOString() ?? null,
    current_period_end: subscription.next_billing_date,
    cancel_at_period_end: subscription.cancel_at_next_billing_date,
    trial_used: Boolean(current?.trial_used) || trialStarted,
  });
  if (error) throw new Error(`Couldn't save the membership: ${error.message}`);
  // The Discord members role follows the membership (never throws).
  await syncDiscordRole(userId);
  return true;
}

/** Fetches the subscription from Dodo and copies it in. */
export async function syncSubscriptionById(subscriptionId: string) {
  if (!dodo) throw new Error("Payments aren't configured: set DODO_PAYMENTS_API_KEY.");
  return syncSubscription(await dodo.subscriptions.retrieve(subscriptionId));
}

/** The viewer's billing ids from their membership row (row-level security is skipped; the id is theirs). */
export async function getBillingIds(viewer: Viewer) {
  if (!adminDb || !viewer.id) return undefined;
  const { data } = await adminDb
    .from("memberships")
    .select("customer_id, subscription_id, trial_used")
    .eq("user_id", viewer.id)
    .maybeSingle();
  return data
    ? { customerId: data.customer_id as string | null, subscriptionId: data.subscription_id as string | null, trialUsed: data.trial_used as boolean }
    : undefined;
}

/** A Dodo checkout for FC Lads+. The free trial is once per account. */
export async function createCheckout(viewer: Viewer, siteUrl: string, trialDays: number) {
  if (!dodo || !productId || !viewer.id || !viewer.email) throw new Error("Payments aren't configured.");
  const billing = await getBillingIds(viewer);
  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: billing?.customerId ? { customer_id: billing.customerId } : { email: viewer.email, name: viewer.name },
    subscription_data: { trial_period_days: billing?.trialUsed ? 0 : trialDays },
    metadata: { user_id: viewer.id },
    return_url: `${siteUrl}/join/done`,
    cancel_url: `${siteUrl}/lads-plus`,
    customization: { theme: "dark" },
    feature_flags: { allow_customer_editing_email: false },
  });
  if (!session.checkout_url) throw new Error("Dodo didn't return a checkout link.");
  return session.checkout_url;
}

/** Card, receipts and invoices live in Dodo's customer portal. */
export async function createPortalLink(customerId: string, returnUrl: string) {
  if (!dodo) throw new Error("Payments aren't configured.");
  return (await dodo.customers.customerPortal.create(customerId, { return_url: returnUrl })).link;
}

/** Past payments for the billing page, newest first. */
export async function listPayments(customerId: string) {
  if (!dodo) return [];
  const page = await dodo.payments.list({ customer_id: customerId, page_size: 24 });
  return page.items.map((payment) => ({
    id: payment.payment_id,
    createdAt: payment.created_at,
    amount: payment.total_amount,
    currency: payment.currency,
    status: payment.status ?? "processing",
    invoiceUrl: payment.invoice_url ?? undefined,
    card: payment.card_last_four ? `${payment.card_network ?? "Card"} •••• ${payment.card_last_four}` : undefined,
  }));
}

/** The site's own address, for links Dodo sends people back to. */
export function siteUrlFrom(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || new URL(request.url).origin).replace(/\/$/, "");
}
