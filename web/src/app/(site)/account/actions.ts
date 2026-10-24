"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { removeDiscordLink } from "@/lib/discord";
import { createPortalLink, dodo, getBillingIds, syncSubscription } from "@/lib/payments";
import { getViewer } from "@/lib/viewer";

// Membership actions on the account pages. The subscription id always comes from the viewer's own
// membership row, never from the form.

export interface MembershipActionState {
  message?: string;
  /** True once auto-renew is off (cancelled at the end of the paid month or the trial). */
  cancelled?: boolean;
}

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const head = await headers();
  return `${head.get("x-forwarded-proto") ?? "http"}://${head.get("host")}`;
}

/** Turns auto-renew off (cancel = true) or back on. Access stays until the date already shown. */
async function setAutoRenew(cancel: boolean): Promise<MembershipActionState> {
  const viewer = await getViewer();
  const billing = await getBillingIds(viewer);
  if (!dodo || !billing?.subscriptionId) return { message: "We couldn't find your membership. Refresh the page and try again." };
  try {
    const subscription = await dodo.subscriptions.update(billing.subscriptionId, { cancel_at_next_billing_date: cancel });
    await syncSubscription(subscription);
  } catch (error) {
    console.error("[payments] auto-renew change failed", error);
    return { message: "Something went wrong. Please try again." };
  }
  revalidatePath("/account", "layout");
  return { cancelled: cancel };
}

export async function cancelMembership(): Promise<MembershipActionState> {
  return setAutoRenew(true);
}

export async function keepMembership(): Promise<MembershipActionState> {
  return setAutoRenew(false);
}

/** Opens Dodo's billing portal: change card, see payments and download invoices. */
export async function openBillingPortal() {
  const viewer = await getViewer();
  const billing = await getBillingIds(viewer);
  if (!billing?.customerId) redirect("/account/billing");
  let link: string;
  try {
    link = await createPortalLink(billing.customerId, `${await siteUrl()}/account/billing`);
  } catch (error) {
    console.error("[payments] billing portal failed", error);
    redirect("/account/billing?portal=error");
  }
  redirect(link);
}

/** Takes the FC Lads+ role off the viewer's Discord account and forgets the link. */
export async function unlinkDiscord() {
  const viewer = await getViewer();
  if (!viewer.id) redirect("/login");
  try {
    await removeDiscordLink(viewer.id);
  } catch (error) {
    console.error("[discord] unlink failed", error);
    redirect("/dashboard/discord?discord=error");
  }
  revalidatePath("/account", "layout");
  revalidatePath("/dashboard", "layout");
  redirect(`${viewer.isMember ? "/dashboard/discord" : "/account/membership"}?discord=unlinked`);
}
