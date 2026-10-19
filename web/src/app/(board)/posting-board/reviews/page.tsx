import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Eye, History, Inbox, Unlink } from "lucide-react";
import { BoardHeading } from "@/components/board/ItemList";
import { ReviewCard, type ReviewCardView } from "@/components/creator/ReviewCard";
import { cn } from "@/lib/cn";
import { requireBoardPage } from "@/lib/board/access";
import { getContent } from "@/lib/content";
import { getAllReviews, type ReviewRequest } from "@/lib/reviews";
import { ukMonthName, ukMonthStart, ukShortDay } from "@/lib/ukTime";

export const metadata: Metadata = { title: "Reviews" };

// Every gameplay review in one place. Any Lad can pick up any member's match (even one sent to another
// Lad) or take over one in progress; the review is credited to whoever sends it.

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "gold" | "mint" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-[#0f141b] p-4">
      <dt className="text-label text-muted">{label}</dt>
      <dd className={cn("tabular font-display text-3xl font-extrabold", tone === "gold" && "text-gold", tone === "mint" && "text-mint")}>
        {value}
      </dd>
    </div>
  );
}

function SectionTitle({
  id,
  icon,
  title,
  count,
  hint,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  count: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
        {icon}
        {title}
        <span className="tabular text-xs text-muted">{count}</span>
      </h2>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined);

/** "5 h" under two days, else "3.5 days". */
function duration(ms: number | undefined) {
  if (ms === undefined) return "–";
  const hours = ms / 3_600_000;
  return hours < 48 ? `${Math.max(1, Math.round(hours))} h` : `${(hours / 24).toFixed(1)} days`;
}

export default async function BoardReviewsPage({ searchParams }: PageProps<"/posting-board/reviews">) {
  const { staff, base } = await requireBoardPage();
  const [content, reviews] = await Promise.all([getContent(), getAllReviews()]);
  const name = (slug?: string) => (slug ? (content.getCreator(slug)?.name ?? slug) : undefined);

  // Reviews are sent in your own name. An account with no creator profile picks who it's reviewing as.
  const reviewers = content.creators.filter((creator) => creator.reviewSpecialty);
  const picked = (await searchParams).as;
  const me = staff.creatorSlug ?? (typeof picked === "string" && content.getCreator(picked) ? picked : reviewers[0]?.slug);
  const actingFor = me && me !== staff.creatorSlug ? me : undefined;

  const view = (request: ReviewRequest): ReviewCardView => ({
    id: request.id,
    memberName: request.memberName,
    sent: `Sent ${ukShortDay(request.createdAt)}`,
    forAnyLad: !request.requestedSlug,
    status: request.status === "in_review" ? "in_review" : "waiting",
    matchUrl: request.matchUrl,
    focus: request.focus,
    askedFor: request.requestedSlug && request.requestedSlug !== me ? name(request.requestedSlug) : undefined,
    reviewer: request.status === "in_review" && request.creatorSlug !== me ? name(request.creatorSlug) : undefined,
  });

  // Totals: this UK month and all time.
  const now = new Date();
  const thisMonth = ukMonthStart(now);
  const doneThisMonth = reviews.done.filter((review) => ukMonthStart(review.completedAt) === thisMonth);
  const turnaround = (list: typeof reviews.done) =>
    average(list.map((review) => new Date(review.completedAt).getTime() - new Date(review.createdAt).getTime()));
  const open = reviews.waiting.length + reviews.inReview.length + reviews.needsLink.length;

  const perLad = content.creators
    .map((creator) => {
      const theirs = reviews.done.filter((review) => review.creatorSlug === creator.slug);
      const theirsThisMonth = theirs.filter((review) => ukMonthStart(review.completedAt) === thisMonth);
      return {
        slug: creator.slug,
        name: creator.name,
        thisMonth: theirsThisMonth.length,
        allTime: theirs.length,
        // Sent for a member who asked for another Lad.
        covered: theirs.filter((review) => review.requestedSlug && review.requestedSlug !== creator.slug).length,
        inReview: reviews.inReview.filter((review) => review.creatorSlug === creator.slug).length,
        turnaround: turnaround(theirsThisMonth),
      };
    })
    .filter((row) => row.allTime > 0 || row.inReview > 0 || reviewers.some((reviewer) => reviewer.slug === row.slug))
    .sort((a, b) => b.thisMonth - a.thisMonth || b.allTime - a.allTime);

  return (
    <div className="flex flex-col gap-8">
      <BoardHeading
        title="Reviews"
        description="Every member's gameplay review. Any Lad can pick up any match, even one sent to someone else, or take over one in progress. It's sent in your name."
      />

      {!staff.creatorSlug && (
        <nav aria-label="Reviewing as" className="flex flex-wrap items-center gap-2">
          <span className="text-label text-muted">Reviewing as</span>
          {reviewers.map((item) => (
            <Link
              key={item.slug}
              href={`${base}/reviews?as=${item.slug}`}
              aria-current={item.slug === me ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-bold uppercase",
                item.slug === me ? "border-primary bg-primary text-on-primary" : "border-white/10 text-muted hover:text-white",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      <section aria-labelledby="totals-heading" className="flex flex-col gap-4">
        <h2 id="totals-heading" className="sr-only">
          Totals
        </h2>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Waiting" value={reviews.waiting.length} tone={reviews.waiting.length > 0 ? "gold" : undefined} />
          <Stat label="In review" value={reviews.inReview.length} />
          <Stat label="Need a new link" value={reviews.needsLink.length} />
          <Stat label={`Sent in ${ukMonthName(now)}`} value={doneThisMonth.length} tone="mint" />
          <Stat label="Sent all time" value={reviews.done.length} />
          <Stat label={`Avg. time · ${ukMonthName(now)}`} value={duration(turnaround(doneThisMonth))} />
        </dl>

        {perLad.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#0f141b]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Reviews sent per Lad</caption>
              <thead className="text-label text-muted">
                <tr className="border-b border-white/8">
                  <th scope="col" className="px-4 py-3 font-normal">
                    Lad
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    Sent in {ukMonthName(now)}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    All time
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    For other Lads
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    Reviewing now
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    Avg. time
                  </th>
                </tr>
              </thead>
              <tbody className="tabular">
                {perLad.map((row) => (
                  <tr key={row.slug} className={cn("border-b border-white/5 last:border-0", row.slug === me && "bg-primary/5")}>
                    <th scope="row" className="px-4 py-3 font-semibold">
                      {row.name}
                      {row.slug === me && <span className="text-xs font-normal text-muted"> · you</span>}
                    </th>
                    <td className="px-4 py-3 text-right font-bold text-mint">{row.thisMonth}</td>
                    <td className="px-4 py-3 text-right">{row.allTime}</td>
                    <td className="px-4 py-3 text-right">{row.covered}</td>
                    <td className="px-4 py-3 text-right">{row.inReview}</td>
                    <td className="px-4 py-3 text-right text-muted">{duration(row.turnaround)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open === 0 && (
        <p className="rounded-2xl border border-dashed border-white/12 p-6 text-sm text-muted">
          Nothing waiting or in progress. New matches from members show up here.
        </p>
      )}

      {reviews.inReview.length > 0 && (
        <section aria-labelledby="reviewing-heading" className="flex flex-col gap-4">
          <SectionTitle
            id="reviewing-heading"
            icon={<Eye aria-hidden className="size-5 text-primary" />}
            title="In review"
            count={reviews.inReview.length}
            hint="Yours first. If a Lad is away, take theirs over and send it yourself."
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {[...reviews.inReview]
              .sort((a, b) => Number(b.creatorSlug === me) - Number(a.creatorSlug === me))
              .map((request) => (
                <ReviewCard key={request.id} review={view(request)} creator={actingFor} />
              ))}
          </div>
        </section>
      )}

      {reviews.waiting.length > 0 && (
        <section aria-labelledby="queue-heading" className="flex flex-col gap-4">
          <SectionTitle
            id="queue-heading"
            icon={<Inbox aria-hidden className="size-5 text-primary" />}
            title="Waiting for a Lad"
            count={reviews.waiting.length}
            hint="Oldest first. Anyone can start any of these, including ones a member sent to another Lad."
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {reviews.waiting.map((request) => (
              <ReviewCard key={request.id} review={view(request)} creator={actingFor} />
            ))}
          </div>
        </section>
      )}

      {reviews.needsLink.length > 0 && (
        <section aria-labelledby="link-heading" className="flex flex-col gap-3">
          <SectionTitle
            id="link-heading"
            icon={<Unlink aria-hidden className="size-5 text-gold" />}
            title="Waiting for a new link"
            count={reviews.needsLink.length}
            hint="Sent back to the member. It comes back to the queue when they add a new link."
          />
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.needsLink.map((request) => (
              <li key={request.id} className="flex flex-col gap-1 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
                <p className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{request.memberName}</span>
                  <span className="tabular text-xs text-muted">Asked by {name(request.creatorSlug) ?? "a Lad"}</span>
                </p>
                <p className="text-muted">&ldquo;{request.creatorNote}&rdquo;</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="sent-heading" className="flex flex-col gap-4">
        <SectionTitle
          id="sent-heading"
          icon={<History aria-hidden className="size-5 text-primary" />}
          title="Sent in the last 90 days"
          count={reviews.recent.length}
        />
        {reviews.recent.length === 0 ? (
          <p className="text-sm text-muted">Sent reviews show up here, with who sent each one.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {reviews.recent.map((request) => {
              const reviewer = name(request.creatorSlug) ?? "A Lad";
              const askedFor = request.requestedSlug ? name(request.requestedSlug) : "any Lad";
              const covered = request.requestedSlug && request.requestedSlug !== request.creatorSlug;
              return (
                <li key={request.id} className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0f141b] p-4 text-sm">
                  <p className="flex items-center justify-between gap-2">
                    <span className="font-bold">{request.memberName}</span>
                    <span className="tabular rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-mint uppercase">{reviewer}</span>
                  </p>
                  <p className="tabular text-xs text-muted">
                    {request.completedAt ? ukShortDay(request.completedAt) : ""}
                    {request.title ? ` · ${request.title}` : ""}
                    {` · asked for ${askedFor}`}
                    {covered && <span className="text-gold"> (covered by {reviewer})</span>}
                  </p>
                  {request.plan.length > 0 && (
                    <p className="flex items-start gap-1.5 text-muted">
                      <ClipboardList aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {request.plan.join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
