import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowUpRight, CalendarClock, Check, ClipboardList, Eye, History, Hourglass, Info, Link2, Play } from "lucide-react";
import { CancelReview } from "@/components/dashboard/CancelReview";
import { DashboardHeading, MembersOnly, ProgressBar } from "@/components/dashboard/DashboardBits";
import { EditMatchForm, SendReviewForm, type ReviewerOption } from "@/components/dashboard/ReviewForm";
import { cn } from "@/lib/cn";
import { getContent } from "@/lib/content";
import { canChange, getMemberReviews, REVIEW_STEPS, type ReviewRequest as Request } from "@/lib/reviews";
import { ukDay, ukMonthName, ukMonthStart, ukNextMonthStart, ukShortDay } from "@/lib/ukTime";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My Review" };

const steps = REVIEW_STEPS.map((title) => ({ key: title, title }));

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

/** The open request: waiting, being reviewed, or needs a new link. */
function OpenRequestCard({ request, lad }: { request: Request; lad?: string }) {
  const who = lad ?? "One of the Lads";
  const state = {
    waiting: {
      icon: Hourglass,
      title: "Match sent",
      text: lad
        ? `${lad} will pick it up when they're free. You'll see the review here.`
        : "The first Lad who's free will pick it up. You'll see the review here.",
    },
    in_review: { icon: Eye, title: `${who} is reviewing it`, text: "Your review and plan will appear here when they're done." },
    fix_link: { icon: AlertTriangle, title: "New link needed", text: `${who} couldn't open your match.` },
  }[request.status as "waiting" | "in_review" | "fix_link"];

  return (
    <section
      aria-labelledby="open-heading"
      className={cn(
        "flex flex-col items-center gap-5 rounded-2xl border bg-gradient-to-b to-[#0f141b] p-6 text-center md:p-10",
        request.status === "fix_link" ? "border-gold/50 from-gold/10" : "border-primary/40 from-pitch-green/60",
      )}
    >
      <state.icon aria-hidden className={cn("size-12", request.status === "fix_link" ? "text-gold" : "text-primary")} />
      <h2 id="open-heading" className="font-display text-2xl font-extrabold uppercase">
        {state.title}
      </h2>
      <p className="max-w-md text-muted">{state.text}</p>
      {request.status === "fix_link" && request.creatorNote && (
        <p className="max-w-md rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm">
          &ldquo;{request.creatorNote}&rdquo;
        </p>
      )}

      <div className="w-full max-w-lg rounded-xl border border-white/8 bg-surface p-4 text-left text-sm">
        <p className="text-label mb-1 flex items-center gap-1.5 text-mint">
          <Link2 aria-hidden className="size-3.5" />
          Your match · sent {ukShortDay(request.createdAt)}
        </p>
        <div className="flex flex-col gap-1">
          <ExternalLink href={request.matchUrl}>Open the link</ExternalLink>
          {request.focus && <span className="text-muted">&ldquo;{request.focus}&rdquo;</span>}
        </div>
      </div>

      {canChange(request) && (
        <div className="flex w-full flex-col items-center gap-3">
          <EditMatchForm
            requestId={request.id}
            matchUrl={request.matchUrl}
            focus={request.focus}
            startOpen={request.status === "fix_link"}
          />
          <CancelReview requestId={request.id} />
        </div>
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
          Log in with a real FC Lads+ account to send a match for review. (The design preview has no account.)
        </p>
      </div>
    );
  }

  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const nextMonth = new Date(`${ukNextMonthStart(now)}T12:00:00Z`);
  const lastDayThisMonth = new Date(nextMonth.getTime() - 86_400_000);

  const reviewerOptions: ReviewerOption[] = content.creators
    .filter((creator) => creator.reviewSpecialty)
    .map((creator) => ({
      slug: creator.slug,
      name: creator.name,
      initials: creator.initials,
      role: creator.role,
      specialty: creator.reviewSpecialty ?? "",
    }));

  const { open, done, left } = reviews;
  const doneThisMonth = done.some((request) => request.reviewMonth === thisMonth);
  const stepIndex = doneThisMonth ? 3 : open ? 1 : 0;
  const ladName = (slug?: string) => (slug ? content.getCreator(slug)?.name : undefined);

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="My review"
        title="Monthly gameplay review"
        description="Included with FC Lads+: send a match any time, one of the Lads reviews it and sends back what's costing you games, with a plan to fix it."
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
          {open ? (
            <OpenRequestCard request={open} lad={ladName(open.creatorSlug)} />
          ) : left === 0 ? (
            <p className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
              You&apos;ve had this month&apos;s review. Your next one opens on {ukShortDay(nextMonth)}.
            </p>
          ) : (
            <SendReviewForm reviewers={reviewerOptions} />
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
            <span className="tabular text-xs text-muted">{done.length}</span>
          </h2>
          {done.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-muted">
              Your reviews and plans will appear here after your first one.
            </p>
          )}
          {done.map((review) => (
            <article
              key={review.id}
              aria-labelledby={`review-${review.id}-title`}
              className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 id={`review-${review.id}-title`} className="font-bold">
                    By {ladName(review.creatorSlug) ?? "the Lads"}
                  </h3>
                  <p className="tabular text-[11px] text-muted">{fullDate(review.completedAt ?? review.createdAt)}</p>
                </div>
                {review.title && (
                  <span className="tabular rounded bg-azure/15 px-2 py-0.5 text-[10px] font-bold text-[#93c5fd] uppercase">
                    {review.title}
                  </span>
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
                    <span className="block font-semibold">Watch the video review</span>
                    <span className="text-xs text-muted">Opens in a new tab</span>
                  </span>
                </a>
              )}
              {review.notes && (
                <details className="group rounded-xl bg-surface p-3 text-sm" open={review === done[0]}>
                  <summary className="cursor-pointer font-semibold marker:text-primary">Written review</summary>
                  <p className="mt-2 whitespace-pre-line text-muted">{review.notes}</p>
                </details>
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
            </article>
          ))}
        </aside>
      </div>
    </div>
  );
}
