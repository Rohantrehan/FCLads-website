import type { Metadata } from "next";
import { Check, ClipboardList, FileVideo, History, Play } from "lucide-react";
import { DashboardHeading, MembersOnly, ProgressBar } from "@/components/dashboard/DashboardBits";
import { ReviewBooking, type ReviewerOption } from "@/components/dashboard/ReviewBooking";
import { getCreator } from "@/data/creators";
import { currentReview, DASHBOARD_TODAY, pastReviews, reviewers, reviewSteps } from "@/data/memberDashboard";
import { cn } from "@/lib/cn";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My Review" };

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const fmt = (iso: string) => dateLabel.format(new Date(`${iso}T00:00:00Z`));

export default async function DashboardReviewPage() {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  const stepIndex = reviewSteps.findIndex((step) => step.key === currentReview.step);
  const left = currentReview.credits.total - currentReview.credits.used;
  const options: ReviewerOption[] = reviewers.flatMap(({ creatorSlug, specialty, slots }) => {
    const creator = getCreator(creatorSlug);
    return creator
      ? [
          {
            slug: creator.slug,
            name: creator.name,
            initials: creator.initials,
            role: creator.role,
            ovr: creator.ovr,
            specialty,
            slots,
          },
        ]
      : [];
  });

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="My review"
        title="Monthly gameplay review"
        description="Included with FC Lads+: one of the Lads goes through a match of yours with you, then sends you a plan to fix what's costing you games."
        aside={
          <p className="tabular flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-mint uppercase">
            {left} of {currentReview.credits.total} review left this month
          </p>
        }
      />

      <section
        aria-labelledby="progress-heading"
        className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="progress-heading" className="font-display text-lg font-extrabold uppercase">
            {currentReview.month} review
          </h2>
          <span className="tabular rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold uppercase">
            Book before {fmt(currentReview.deadline)}
          </span>
        </div>
        <ProgressBar
          value={(stepIndex / reviewSteps.length) * 100}
          label={`${stepIndex} of ${reviewSteps.length} steps done`}
        />
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {reviewSteps.map((step, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;
            return (
              <li
                key={step.key}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  current ? "border-primary/50 bg-primary/10" : "border-white/8 bg-surface",
                  !done && !current && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "tabular flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    done
                      ? "bg-primary text-on-primary"
                      : current
                        ? "ring-2 ring-primary text-primary"
                        : "bg-surface-highest text-muted",
                  )}
                >
                  {done ? <Check aria-hidden className="size-4" /> : index + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-label text-muted">
                    Step {index + 1} · {done ? "Done" : current ? "Now" : "Next"}
                  </span>
                  <span className="font-semibold">{step.title}</span>
                </span>
              </li>
            );
          })}
        </ol>
        {currentReview.upload && (
          <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4 sm:flex-row sm:items-center">
            <FileVideo aria-hidden className="size-8 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="tabular text-[11px] text-mint uppercase">
                Your match · {currentReview.upload.sizeMb} MB · {currentReview.upload.duration}
              </p>
              <p className="truncate font-semibold">{currentReview.upload.fileName}</p>
              <p className="text-sm text-muted">What to look at: &ldquo;{currentReview.upload.focus}&rdquo;</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <ReviewBooking reviewers={options} today={DASHBOARD_TODAY} deadline={currentReview.deadline} />
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
            <span className="tabular text-xs text-muted">{pastReviews.length}</span>
          </h2>
          {pastReviews.map((review) => {
            const coach = getCreator(review.creatorSlug);
            return (
              <article
                key={review.id}
                aria-labelledby={`${review.id}-title`}
                className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 id={`${review.id}-title`} className="font-bold">
                      With {coach?.name}
                    </h3>
                    <p className="tabular text-[11px] text-muted">{fmt(review.date)}</p>
                  </div>
                  <span className="tabular rounded bg-azure/15 px-2 py-0.5 text-[10px] font-bold text-[#93c5fd] uppercase">
                    {review.tag}
                  </span>
                </div>
                <p className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Play aria-hidden className="size-4 fill-current" />
                  </span>
                  <span>
                    <span className="block font-semibold">Session recording</span>
                    <span className="tabular text-xs text-muted">{review.minutes} min</span>
                  </span>
                </p>
                <div>
                  <p className="text-label mb-2 flex items-center gap-1.5 text-mint">
                    <ClipboardList aria-hidden className="size-3.5" />
                    Your plan
                  </p>
                  <ol className="flex flex-col gap-2">
                    {review.actions.map((action, index) => (
                      <li key={action} className="flex gap-3 rounded-lg bg-surface p-3 text-sm">
                        <span className="tabular text-xs font-bold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
