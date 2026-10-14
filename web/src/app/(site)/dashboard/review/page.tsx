import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarClock, Check, CheckCircle2, ClipboardList, History, Info, Link2, Play, Video } from "lucide-react";
import { CancelReview } from "@/components/dashboard/CancelReview";
import { DashboardHeading, MembersOnly, ProgressBar } from "@/components/dashboard/DashboardBits";
import { ReviewBooking, type ReviewerOption, type SlotOption } from "@/components/dashboard/ReviewBooking";
import { cn } from "@/lib/cn";
import { getContent } from "@/lib/content";
import { canCancel, CANCEL_BEFORE_HOURS, getMemberReviews, getOpenSlots, type ReviewBooking as Booking } from "@/lib/reviews";
import { ukDay, ukLongDay, ukMonthName, ukMonthStart, ukNextMonthStart, ukShortDay, ukTime } from "@/lib/ukTime";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My Review" };

const steps = [
  { key: "book", title: "Book your session" },
  { key: "session", title: "Go through your match" },
  { key: "plan", title: "Get your plan" },
] as const;

const fullDate = (iso: string) => `${ukShortDay(iso)} ${ukDay(iso).slice(0, 4)}`;

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-primary hover:text-white"
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}

/** "You're booked in": time, Lad, call link, match and cancel. */
function BookedCard({ booking, lad, now }: { booking: Booking; lad?: string; now: number }) {
  const started = new Date(booking.startsAt).getTime() <= now;
  return (
    <section
      aria-labelledby="booked-heading"
      className="flex flex-col items-center gap-5 rounded-2xl border border-primary/40 bg-gradient-to-b from-pitch-green/60 to-[#0f141b] p-6 text-center md:p-10"
    >
      <CheckCircle2 aria-hidden className="size-12 text-primary" />
      <h2 id="booked-heading" className="font-display text-2xl font-extrabold uppercase">
        {started ? "Your session is on now" : "You're booked in"}
      </h2>
      <p className="max-w-md text-muted">
        {lad ?? "One of the Lads"} will go through your match with you on{" "}
        <strong className="text-white">
          {ukLongDay(booking.startsAt)} at {ukTime(booking.startsAt)}
        </strong>{" "}
        (UK time, {booking.durationMinutes} minutes).
      </p>

      <dl className="grid w-full max-w-lg grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-surface p-4">
          <dt className="text-label mb-1 flex items-center gap-1.5 text-mint">
            <Video aria-hidden className="size-3.5" />
            Call link
          </dt>
          <dd>
            {booking.meetingUrl ? (
              <ExternalLink href={booking.meetingUrl}>Join the call</ExternalLink>
            ) : (
              <span className="text-muted">{lad ?? "The Lad"} adds it before the session. Check back here.</span>
            )}
          </dd>
        </div>
        <div className="rounded-xl border border-white/8 bg-surface p-4">
          <dt className="text-label mb-1 flex items-center gap-1.5 text-mint">
            <Link2 aria-hidden className="size-3.5" />
            Your match
          </dt>
          <dd className="flex flex-col gap-1">
            <ExternalLink href={booking.matchUrl}>Open the link</ExternalLink>
            {booking.focus && <span className="text-muted">&ldquo;{booking.focus}&rdquo;</span>}
          </dd>
        </div>
      </dl>

      {canCancel(booking, now) ? (
        <CancelReview bookingId={booking.id} />
      ) : (
        !started && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <Info aria-hidden className="size-3.5" />
            It&apos;s less than {CANCEL_BEFORE_HOURS} hours away, so it can&apos;t be moved any more.
          </p>
        )
      )}
    </section>
  );
}

export default async function DashboardReviewPage() {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;
  const content = await getContent();

  // Design preview (DEV_VIEWER) has no real account, so there's nothing to load or book.
  const reviews = await getMemberReviews(viewer);
  if (!reviews) {
    return (
      <div className="page-container flex flex-col gap-8 pt-10 pb-20">
        <DashboardHeading eyebrow="My review" title="Monthly gameplay review" description="Preview mode." />
        <p className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-muted">
          Log in with a real FC Lads+ account to book a review. (The design preview has no account.)
        </p>
      </div>
    );
  }

  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const nextMonth = new Date(`${ukNextMonthStart(now)}T12:00:00Z`);
  const lastDayThisMonth = new Date(nextMonth.getTime() - 86_400_000);

  const slots = await getOpenSlots();
  const reviewerOptions: ReviewerOption[] = content.creators
    .filter((creator) => creator.reviewSpecialty)
    .map((creator) => ({
      slug: creator.slug,
      name: creator.name,
      initials: creator.initials,
      role: creator.role,
      ovr: creator.ovr,
      specialty: creator.reviewSpecialty ?? "",
    }));
  const reviewerSlugs = new Set(reviewerOptions.map((option) => option.slug));
  const slotOptions: SlotOption[] = slots
    .filter((slot) => reviewerSlugs.has(slot.creatorSlug))
    .map((slot) => ({ id: slot.id, creatorSlug: slot.creatorSlug, day: ukDay(slot.startsAt), time: ukTime(slot.startsAt) }));

  const { upcoming, done, left } = reviews;
  const doneThisMonth = done.some((booking) => booking.reviewMonth === thisMonth);
  const stepIndex = doneThisMonth ? 3 : upcoming ? 1 : 0;
  const ladName = (slug: string) => content.getCreator(slug)?.name;
  const past = reviews.bookings.filter((booking) => booking.status === "completed" || booking.status === "missed");

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="My review"
        title="Monthly gameplay review"
        description="Included with FC Lads+: one of the Lads goes through a match of yours with you, then sends you a plan to fix what's costing you games."
        aside={
          <p className="tabular flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-mint uppercase">
            {left} of 1 review left this month
          </p>
        }
      />

      <section
        aria-labelledby="progress-heading"
        className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="progress-heading" className="font-display text-lg font-extrabold uppercase">
            {ukMonthName(now)} review
          </h2>
          <span className="tabular flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold uppercase">
            <CalendarClock aria-hidden className="size-3.5" />
            {left > 0 ? `Use it by ${ukShortDay(lastDayThisMonth)}` : `Next review from ${ukShortDay(nextMonth)}`}
          </span>
        </div>
        <ProgressBar value={(stepIndex / steps.length) * 100} label={`${stepIndex} of ${steps.length} steps done`} />
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isDone = index < stepIndex;
            const current = index === stepIndex;
            return (
              <li
                key={step.key}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  current ? "border-primary/50 bg-primary/10" : "border-white/8 bg-surface",
                  !isDone && !current && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "tabular flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isDone
                      ? "bg-primary text-on-primary"
                      : current
                        ? "ring-2 ring-primary text-primary"
                        : "bg-surface-highest text-muted",
                  )}
                >
                  {isDone ? <Check aria-hidden className="size-4" /> : index + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-label text-muted">
                    Step {index + 1} · {isDone ? "Done" : current ? "Now" : "Next"}
                  </span>
                  <span className="font-semibold">{step.title}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
          {upcoming ? (
            <BookedCard booking={upcoming} lad={ladName(upcoming.creatorSlug)} now={now.getTime()} />
          ) : (
            <>
              {left === 0 && (
                <p className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
                  You&apos;ve had this month&apos;s review. You can already book next month&apos;s: pick a day from{" "}
                  {ukShortDay(nextMonth)} onwards.
                </p>
              )}
              {reviewerOptions.length ? (
                <ReviewBooking
                  reviewers={reviewerOptions}
                  slots={slotOptions}
                  today={ukDay(now)}
                  usedMonths={reviews.usedMonths}
                />
              ) : (
                <p className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-muted">
                  The Lads haven&apos;t opened their review calendars yet. Check back soon.
                </p>
              )}
            </>
          )}
        </div>

        <aside aria-labelledby="past-reviews-heading" className="flex flex-col gap-4 lg:col-span-4">
          <h2
            id="past-reviews-heading"
            className="flex items-center justify-between gap-2 font-display text-lg font-extrabold uppercase"
          >
            <span className="flex items-center gap-2">
              <History aria-hidden className="size-5 text-primary" />
              Past reviews
            </span>
            <span className="tabular text-xs text-muted">{past.length}</span>
          </h2>
          {past.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-muted">
              Your reviews and plans will appear here after your first session.
            </p>
          )}
          {past.map((review) => (
            <article
              key={review.id}
              aria-labelledby={`review-${review.id}-title`}
              className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 id={`review-${review.id}-title`} className="font-bold">
                    With {ladName(review.creatorSlug) ?? "the Lads"}
                  </h3>
                  <p className="tabular text-[11px] text-muted">{fullDate(review.startsAt)}</p>
                </div>
                {review.status === "missed" ? (
                  <span className="tabular rounded bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger-soft uppercase">
                    Missed
                  </span>
                ) : (
                  review.title && (
                    <span className="tabular rounded bg-azure/15 px-2 py-0.5 text-[10px] font-bold text-[#93c5fd] uppercase">
                      {review.title}
                    </span>
                  )
                )}
              </div>
              {review.recordingUrl && (
                <a
                  href={review.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm hover:bg-surface-high"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Play aria-hidden className="size-4 fill-current" />
                  </span>
                  <span>
                    <span className="block font-semibold">Session recording</span>
                    <span className="tabular text-xs text-muted">{review.durationMinutes} min</span>
                  </span>
                </a>
              )}
              {review.plan.length > 0 && (
                <div>
                  <p className="text-label mb-2 flex items-center gap-1.5 text-mint">
                    <ClipboardList aria-hidden className="size-3.5" />
                    Your plan
                  </p>
                  <ol className="flex flex-col gap-2">
                    {review.plan.map((action, index) => (
                      <li key={index} className="flex gap-3 rounded-lg bg-surface p-3 text-sm">
                        <span className="tabular text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {review.status === "missed" && (
                <p className="text-sm text-muted">This session was missed, so it used that month&apos;s review.</p>
              )}
            </article>
          ))}
        </aside>
      </div>
    </div>
  );
}
