import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ukMonthName, ukMonthStart, ukNextMonthStart } from "@/lib/ukTime";
import type { Viewer } from "@/lib/viewer";

// Monthly gameplay reviews (table review_requests, see
// supabase/migrations/20261015000200_review_requests.sql). A member sends a match any time; a Lad picks
// it up when they're free. Row-level security decides what each person can read; every change goes
// through the database functions in the review actions.

export type ReviewStatus = "waiting" | "in_review" | "fix_link" | "done" | "cancelled";

export interface ReviewRequest {
  id: string;
  memberName: string;
  /** The Lad the member asked for; undefined = any Lad. */
  requestedSlug?: string;
  /** The Lad handling it (requested, or whoever picked it up). */
  creatorSlug?: string;
  reviewMonth: string;
  status: ReviewStatus;
  matchUrl: string;
  focus: string;
  /** Why the Lad needs a new link. */
  creatorNote?: string;
  title?: string;
  notes?: string;
  recordingUrl?: string;
  plan: string[];
  createdAt: string;
  completedAt?: string;
}

/** Members get one review per UK calendar month. */
export const REVIEWS_PER_MONTH = 1;

const COLUMNS =
  "id, member_name, requested_slug, creator_slug, review_month, status, match_url, focus, creator_note, title, notes, recording_url, plan, created_at, completed_at";

interface Row {
  id: string;
  member_name: string;
  requested_slug: string | null;
  creator_slug: string | null;
  review_month: string;
  status: ReviewStatus;
  match_url: string;
  focus: string;
  creator_note: string | null;
  title: string | null;
  notes: string | null;
  recording_url: string | null;
  plan: string[] | null;
  created_at: string;
  completed_at: string | null;
}

const toRequest = (row: Row): ReviewRequest => ({
  id: row.id,
  memberName: row.member_name,
  requestedSlug: row.requested_slug ?? undefined,
  creatorSlug: row.creator_slug ?? undefined,
  reviewMonth: row.review_month,
  status: row.status,
  matchUrl: row.match_url,
  focus: row.focus,
  creatorNote: row.creator_note ?? undefined,
  title: row.title ?? undefined,
  notes: row.notes ?? undefined,
  recordingUrl: row.recording_url ?? undefined,
  plan: row.plan ?? [],
  createdAt: row.created_at,
  completedAt: row.completed_at ?? undefined,
});

const OPEN: ReviewStatus[] = ["waiting", "in_review", "fix_link"];
export const isOpen = (request: ReviewRequest) => OPEN.includes(request.status);
/** The member can still change the link or cancel. */
export const canChange = (request: ReviewRequest) => request.status === "waiting" || request.status === "fix_link";

/** A member's reviews (newest first), the open one, and whether this month's review is used. */
export const getMemberReviews = cache(async (viewer: Viewer) => {
  if (!viewer.id) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_requests")
    .select(COLUMNS)
    .eq("member_id", viewer.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load reviews: ${error.message}`);

  const requests = (data as Row[]).map(toRequest);
  const thisMonth = ukMonthStart(new Date());
  const usedThisMonth = requests.filter((r) => r.status !== "cancelled" && r.reviewMonth === thisMonth).length;
  return {
    requests,
    open: requests.find(isOpen),
    done: requests.filter((request) => request.status === "done"),
    left: Math.max(REVIEWS_PER_MONTH - usedThisMonth, 0),
  };
});

export const REVIEW_STEPS = ["Send your match", "A Lad reviews it", "Get your plan"] as const;

/** Short review status for the dashboard and account pages. Works in the design preview too (no account). */
export async function getReviewSummary(viewer: Viewer) {
  const reviews = await getMemberReviews(viewer);
  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const doneThisMonth = reviews?.done.some((request) => request.reviewMonth === thisMonth) ?? false;
  const nextMonth = new Date(`${ukNextMonthStart(now)}T12:00:00Z`);
  return {
    left: reviews?.left ?? REVIEWS_PER_MONTH,
    used: REVIEWS_PER_MONTH - (reviews?.left ?? REVIEWS_PER_MONTH),
    total: REVIEWS_PER_MONTH,
    open: reviews?.open,
    lastCreatorSlug: reviews?.done[0]?.creatorSlug,
    month: ukMonthName(now),
    /** Last day of this month (noon UTC, safe to format as a UK date). */
    lastDay: new Date(nextMonth.getTime() - 86_400_000),
    nextMonth,
    /** 0 = send, 1 = being reviewed, 2 = plan, 3 = all done this month. */
    stepIndex: doneThisMonth ? 3 : reviews?.open ? 1 : 0,
  };
}

/** Everything the Creator hub shows for one creator: their queue, what they're reviewing, and recent ones. */
export async function getCreatorReviews(creatorSlug: string) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const [open, recent] = await Promise.all([
    supabase
      .from("review_requests")
      .select(COLUMNS)
      .in("status", OPEN)
      .or(`creator_slug.eq.${creatorSlug},creator_slug.is.null`)
      .order("created_at"),
    supabase
      .from("review_requests")
      .select(COLUMNS)
      .eq("creator_slug", creatorSlug)
      .eq("status", "done")
      .gte("completed_at", since)
      .order("completed_at", { ascending: false }),
  ]);
  if (open.error) throw new Error(`Couldn't load reviews: ${open.error.message}`);
  if (recent.error) throw new Error(`Couldn't load reviews: ${recent.error.message}`);

  const requests = (open.data as Row[]).map(toRequest);
  return {
    /** Being reviewed by this creator, oldest first. */
    inReview: requests.filter((request) => request.status === "in_review" && request.creatorSlug === creatorSlug),
    /** Waiting for this creator or for any Lad, oldest first. */
    waiting: requests.filter((request) => request.status === "waiting"),
    /** Sent back for a new link, waiting on the member. */
    needsLink: requests.filter((request) => request.status === "fix_link" && request.creatorSlug === creatorSlug),
    done: (recent.data as Row[]).map(toRequest),
  };
}

/** Plain-English messages for the error codes the review functions raise. */
export function reviewErrorMessage(code: string | undefined) {
  switch (code) {
    case "not_signed_in":
      return "Log in again to continue.";
    case "not_member":
      return "Reviews are part of FC Lads+. Start your free trial to get one.";
    case "bad_match_url":
      return "Paste a link to your match that starts with https:// (YouTube, Google Drive, Medal…).";
    case "focus_too_long":
      return "Keep the note under 500 characters.";
    case "bad_creator":
      return "That Lad isn't taking reviews right now. Pick another one.";
    case "already_open":
      return "You already have a review in progress. Wait for it to finish first.";
    case "month_used":
      return "You've already had this month's review. Your next one opens on the 1st.";
    case "already_started":
      return "A Lad has already started your review, so it can't be changed now.";
    case "not_creator":
      return "Only creators can do this.";
    case "not_available":
      return "Someone else has picked this one up, or the member changed it. Refresh the page.";
    case "note_required":
      return "Say what's wrong with the link so they can fix it.";
    case "note_too_long":
      return "Keep the note under 300 characters.";
    case "plan_required":
      return "Add at least one point to the plan.";
    case "plan_too_long":
      return "The plan can have up to 3 points.";
    case "plan_item_too_long":
      return "Keep each plan point under 300 characters.";
    case "notes_too_long":
      return "Keep the written review under 4,000 characters.";
    case "title_too_long":
      return "Keep the title under 80 characters.";
    case "bad_recording_url":
      return "The video link must start with https://";
    default:
      return "Something went wrong. Please try again.";
  }
}
