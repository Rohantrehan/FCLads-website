import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/viewer";

// The signed-in member's FC Lads+ subscription (table memberships, kept in step with the payment
// provider). Row-level security only returns the viewer's own row.

export interface Membership {
  status: string;
  /** e.g. "Free trial", "Active membership". */
  statusLabel: string;
  subscriptionId?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  memberSince: string;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free trial",
  active: "Active membership",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  unpaid: "Unpaid",
  paused: "Paused",
  incomplete: "Payment pending",
  incomplete_expired: "Payment expired",
};

export const getMembership = cache(async (viewer: Viewer): Promise<Membership | undefined> => {
  if (!viewer.id) return undefined;
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("status, subscription_id, trial_end, current_period_end, cancel_at_period_end, created_at")
    .eq("user_id", viewer.id)
    .maybeSingle();
  if (!data) return undefined;
  return {
    status: data.status,
    statusLabel: STATUS_LABELS[data.status] ?? data.status,
    subscriptionId: data.subscription_id ?? undefined,
    trialEnd: data.trial_end ?? undefined,
    currentPeriodEnd: data.current_period_end ?? undefined,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    memberSince: data.created_at,
  };
});
