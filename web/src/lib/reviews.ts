import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ukMonthName, ukMonthStart, ukNextMonthStart } from "@/lib/ukTime";
import type { Viewer } from "@/lib/viewer";

// Monthly gameplay reviews (tables review_slots + review_bookings, see
// supabase/migrations/20261014000000_review_bookings.sql). Row-level security decides what each
// person can read; every change goes through the database functions in the review actions.

export type ReviewStatus = "booked" | "completed" | "missed" | "cancelled";

export interface ReviewBooking {
  id: string;
  creatorSlug: string;
  startsAt: string;
  durationMinutes: number;
  reviewMonth: string;
  memberName: string;
  status: ReviewStatus;
  matchUrl: string;
  focus: string;
  meetingUrl?: string;
  recordingUrl?: string;
  title?: string;
  plan: string[];
}

export interface ReviewSlot {
  id: string;
  creatorSlug: string;
  startsAt: string;
  durationMinutes: number;
  /** Set on the Creator hub when the slot is booked. */
  bookingId?: string;
}

/** Members get one review per UK calendar month. */
export const REVIEWS_PER_MONTH = 1;
/** How far ahead members can book, and how soon a slot can still be booked / cancelled. */
export const BOOKING_WINDOW_DAYS = 60;
export const CANCEL_BEFORE_HOURS = 12;

const BOOKING_COLUMNS =
  "id, creator_slug, starts_at, duration_minutes, review_month, member_name, status, match_url, focus, meeting_url, recording_url, title, plan";

interface BookingRow {
  id: string;
  creator_slug: string;
  starts_at: string;
  duration_minutes: number;
  review_month: string;
  member_name: string;
  status: ReviewStatus;
  match_url: string;
  focus: string;
  meeting_url: string | null;
  recording_url: string | null;
  title: string | null;
  plan: string[] | null;
}

const toBooking = (row: BookingRow): ReviewBooking => ({
  id: row.id,
  creatorSlug: row.creator_slug,
  startsAt: row.starts_at,
  durationMinutes: row.duration_minutes,
  reviewMonth: row.review_month,
  memberName: row.member_name,
  status: row.status,
  matchUrl: row.match_url,
  focus: row.focus,
  meetingUrl: row.meeting_url ?? undefined,
  recordingUrl: row.recording_url ?? undefined,
  title: row.title ?? undefined,
  plan: row.plan ?? [],
});

interface SlotRow {
  id: string;
  creator_slug: string;
  starts_at: string;
  duration_minutes: number;
  booking_id: string | null;
}

const toSlot = (row: SlotRow): ReviewSlot => ({
  id: row.id,
  creatorSlug: row.creator_slug,
  startsAt: row.starts_at,
  durationMinutes: row.duration_minutes,
  bookingId: row.booking_id ?? undefined,
});

/** Session still to come (or happening now): booked and not yet finished. */
export const isUpcoming = (booking: ReviewBooking, now = Date.now()) =>
  booking.status === "booked" && new Date(booking.startsAt).getTime() + booking.durationMinutes * 60_000 > now;

export const canCancel = (booking: ReviewBooking, now = Date.now()) =>
  booking.status === "booked" && new Date(booking.startsAt).getTime() - now >= CANCEL_BEFORE_HOURS * 3_600_000;

/** A member's reviews: all bookings (newest first) and whether this month's review is used. */
export const getMemberReviews = cache(async (viewer: Viewer) => {
  if (!viewer.id) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_bookings")
    .select(BOOKING_COLUMNS)
    .eq("member_id", viewer.id)
    .order("starts_at", { ascending: false });
  if (error) throw new Error(`Couldn't load reviews: ${error.message}`);

  const bookings = (data as BookingRow[]).map(toBooking);
  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const usedThisMonth = bookings.filter((b) => b.status !== "cancelled" && b.reviewMonth === thisMonth).length;
  return {
    bookings,
    upcoming: bookings.find((booking) => isUpcoming(booking)),
    done: bookings.filter((booking) => booking.status === "completed"),
    left: Math.max(REVIEWS_PER_MONTH - usedThisMonth, 0),
    /** Months (first day) that already have a review, so those days can't be booked. */
    usedMonths: [...new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => b.reviewMonth))],
  };
});

export const REVIEW_STEPS = ["Book your session", "Go through your match", "Get your plan"] as const;

/** Short review status for the dashboard and account pages. Works in the design preview too (no account). */
export async function getReviewSummary(viewer: Viewer) {
  const reviews = await getMemberReviews(viewer);
  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const doneThisMonth = reviews?.done.some((booking) => booking.reviewMonth === thisMonth) ?? false;
  const nextMonth = new Date(`${ukNextMonthStart(now)}T12:00:00Z`);
  return {
    left: reviews?.left ?? REVIEWS_PER_MONTH,
    used: REVIEWS_PER_MONTH - (reviews?.left ?? REVIEWS_PER_MONTH),
    total: REVIEWS_PER_MONTH,
    upcoming: reviews?.upcoming,
    lastCreatorSlug: reviews?.done[0]?.creatorSlug,
    month: ukMonthName(now),
    /** Last day of this month (noon UTC, safe to format as a UK date). */
    lastDay: new Date(nextMonth.getTime() - 86_400_000),
    nextMonth,
    /** 0 = book, 1 = session, 2 = plan, 3 = all done this month. */
    stepIndex: doneThisMonth ? 3 : reviews?.upcoming ? 1 : 0,
  };
}

/** Free times members can book (row-level security only returns open, future slots to members). */
export async function getOpenSlots() {
  const supabase = await createClient();
  const from = new Date(Date.now() + 2 * 3_600_000).toISOString();
  const to = new Date(Date.now() + BOOKING_WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("review_slots")
    .select("id, creator_slug, starts_at, duration_minutes, booking_id")
    .is("booking_id", null)
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at");
  if (error) throw new Error(`Couldn't load free times: ${error.message}`);
  return (data as SlotRow[]).map(toSlot);
}

/** Everything the Creator hub shows for one creator: their future slots and their bookings. */
export async function getCreatorReviews(creatorSlug: string) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const [slots, bookings] = await Promise.all([
    supabase
      .from("review_slots")
      .select("id, creator_slug, starts_at, duration_minutes, booking_id")
      .eq("creator_slug", creatorSlug)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at"),
    supabase
      .from("review_bookings")
      .select(BOOKING_COLUMNS)
      .eq("creator_slug", creatorSlug)
      .neq("status", "cancelled")
      .gte("starts_at", since)
      .order("starts_at"),
  ]);
  if (slots.error) throw new Error(`Couldn't load free times: ${slots.error.message}`);
  if (bookings.error) throw new Error(`Couldn't load bookings: ${bookings.error.message}`);

  const all = (bookings.data as BookingRow[]).map(toBooking);
  const now = Date.now();
  return {
    freeSlots: (slots.data as SlotRow[]).map(toSlot).filter((slot) => !slot.bookingId),
    /** Booked sessions still to run, soonest first. Includes ones that have started but not been closed. */
    toRun: all.filter((booking) => booking.status === "booked"),
    /** Done or missed, newest first. */
    past: all.filter((booking) => booking.status !== "booked").reverse(),
    now,
  };
}

/** Plain-English messages for the error codes the review functions raise. */
export function reviewErrorMessage(code: string | undefined) {
  switch (code) {
    case "not_signed_in":
      return "Log in again to continue.";
    case "not_member":
      return "Reviews are part of FC Lads+. Start your free trial to book one.";
    case "bad_match_url":
      return "Paste a link to your match that starts with https:// (YouTube, Google Drive, Medal…).";
    case "focus_too_long":
      return "Keep the note under 500 characters.";
    case "slot_taken":
      return "Someone just booked that time. Pick another one.";
    case "slot_too_soon":
      return "That time is too soon. Pick one at least 2 hours from now.";
    case "already_booked":
      return "You already have a session booked. Cancel it first if you want a different time.";
    case "month_used":
      return "You've already had your review for that month. Pick a time in a month you haven't used yet.";
    case "too_late_to_cancel":
      return `Sessions can only be cancelled or moved up to ${CANCEL_BEFORE_HOURS} hours before they start.`;
    case "not_creator":
      return "Only creators can do this.";
    case "bad_times":
      return "Pick at least one time.";
    case "too_far_ahead":
      return "You can add times up to 90 days ahead.";
    case "not_started":
      return "You can mark a session done or missed once it has started.";
    case "plan_required":
      return "Add at least one point to the plan.";
    case "plan_too_long":
      return "The plan can have up to 3 points.";
    case "bad_meeting_url":
    case "bad_recording_url":
      return "Links must start with https://";
    case "cancelled":
      return "That session was cancelled by the member.";
    default:
      return "Something went wrong. Please try again.";
  }
}
