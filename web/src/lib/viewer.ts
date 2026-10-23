import "server-only";

import { cache } from "react";
import { createClient, isAuthConfigured } from "@/lib/supabase/server";

// Who is looking at the page. Every paywall check goes through here.

export type ViewerRole = "member" | "creator" | "admin";

export interface Viewer {
  isSignedIn: boolean;
  isMember: boolean;
  /** Account ID. Missing for visitors. */
  id?: string;
  /** "creator" and "admin" can run gameplay reviews (the Creator hub). */
  role?: ViewerRole;
  /** Creator in the CMS this account belongs to (creators only). */
  creatorSlug?: string;
  /** Display name, when signed in. */
  name?: string;
  email?: string;
}

const visitor: Viewer = { isSignedIn: false, isMember: false };

/** Membership statuses that keep FC Lads+ access. `past_due` keeps it during Dodo's grace period. */
const MEMBER_STATUSES = new Set(["trialing", "active", "past_due"]);

export const isMemberStatus = (status: string) => MEMBER_STATUSES.has(status);

/** The signed-in user and their FC Lads+ status. Cached for the length of one request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  if (!isAuthConfigured) return visitor;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return visitor;

  // Row-level security only returns the user's own rows.
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("display_name, role, creator_slug").eq("id", userId).maybeSingle(),
    supabase.from("memberships").select("status").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    isSignedIn: true,
    isMember: membership ? isMemberStatus(membership.status) : false,
    id: userId,
    role: (profile?.role as ViewerRole | undefined) ?? "member",
    creatorSlug: profile?.creator_slug ?? undefined,
    name: profile?.display_name ?? undefined,
    email: typeof data.claims.email === "string" ? data.claims.email : undefined,
  };
});

/** Creators and admins run gameplay reviews. */
export const canRunReviews = (viewer: Viewer) => viewer.role === "creator" || viewer.role === "admin";
