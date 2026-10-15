import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Eye, History, Inbox, Unlink } from "lucide-react";
import { ReviewCard, type ReviewCardView } from "@/components/creator/ReviewCard";
import { DashboardHeading } from "@/components/dashboard/DashboardBits";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getContent } from "@/lib/content";
import { getCreatorReviews, type ReviewRequest } from "@/lib/reviews";
import { ukShortDay } from "@/lib/ukTime";
import { canRunReviews, getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Creator hub", robots: { index: false } };

function Gate({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="page-container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-headline">{title}</h1>
      <p className="max-w-md text-muted">{text}</p>
      {action}
    </div>
  );
}

/** Creators run their gameplay reviews here: the queue of matches, the ones they're reviewing, and recent ones. Admins can pick any creator. */
export default async function CreatorHubPage({ searchParams }: PageProps<"/creator">) {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) {
    return (
      <Gate
        title="Creator hub"
        text="Log in with your creator account to manage your gameplay reviews."
        action={<Button href="/login?next=/creator">Log in</Button>}
      />
    );
  }
  if (!canRunReviews(viewer)) {
    return <Gate title="Creators only" text="This page is for the FC Lads creators who run gameplay reviews." />;
  }

  const content = await getContent();
  const isAdmin = viewer.role === "admin";
  const reviewers = content.creators.filter((creator) => creator.reviewSpecialty);
  const requested = (await searchParams).creator;
  const slug =
    isAdmin && typeof requested === "string" && content.getCreator(requested)
      ? requested
      : (viewer.creatorSlug ?? (isAdmin ? reviewers[0]?.slug : undefined));

  if (!slug) {
    return (
      <Gate
        title="Almost there"
        text="Your account isn't linked to a creator profile yet. Ask an admin to link it, then come back."
      />
    );
  }

  const creator = content.getCreator(slug);
  const { inReview, waiting, needsLink, done } = await getCreatorReviews(slug);
  // Admins acting for someone else pass the creator to the actions.
  const actingFor = isAdmin && slug !== viewer.creatorSlug ? slug : undefined;

  const view = (request: ReviewRequest): ReviewCardView => ({
    id: request.id,
    memberName: request.memberName,
    sent: `Sent ${ukShortDay(request.createdAt)}`,
    forAnyLad: !request.requestedSlug,
    status: request.status === "in_review" ? "in_review" : "waiting",
    matchUrl: request.matchUrl,
    focus: request.focus,
  });

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Creator hub"
        title={
          <>
            Gameplay reviews{creator && <span className="text-primary"> · {creator.name}</span>}
          </>
        }
        description="Members send a match whenever they like. Pick one up when you're free, watch it, then send a written review (and a video if you like) with a 3-point plan."
      />

      {isAdmin && (
        <nav aria-label="Choose a creator" className="flex flex-wrap items-center gap-2">
          <span className="text-label text-muted">Admin · viewing</span>
          {reviewers.map((item) => (
            <Link
              key={item.slug}
              href={`/creator?creator=${item.slug}`}
              aria-current={item.slug === slug ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-bold uppercase",
                item.slug === slug
                  ? "border-primary bg-primary text-on-primary"
                  : "border-white/10 text-muted hover:text-white",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {!creator?.reviewSpecialty && (
        <p className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
          Members can&apos;t pick you yet: add &ldquo;what you review best&rdquo; to your creator profile on the posting board
          (an admin can do it under Creators).
        </p>
      )}

      <section aria-labelledby="reviewing-heading" className="flex flex-col gap-4">
        <h2 id="reviewing-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
          <Eye aria-hidden className="size-5 text-primary" />
          You&apos;re reviewing
          <span className="tabular text-xs text-muted">{inReview.length}</span>
        </h2>
        {inReview.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 p-6 text-sm text-muted">
            Nothing in progress. Start one from the queue below.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {inReview.map((request) => (
              <ReviewCard key={request.id} review={view(request)} creator={actingFor} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="queue-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="queue-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
            <Inbox aria-hidden className="size-5 text-primary" />
            Waiting for a Lad
            <span className="tabular text-xs text-muted">{waiting.length}</span>
          </h2>
          <p className="text-sm text-muted">Oldest first. Matches sent to you, plus ones for any Lad.</p>
        </div>
        {waiting.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 p-6 text-sm text-muted">The queue is empty. Nice work.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {waiting.map((request) => (
              <ReviewCard key={request.id} review={view(request)} creator={actingFor} />
            ))}
          </div>
        )}
      </section>

      {needsLink.length > 0 && (
        <section aria-labelledby="link-heading" className="flex flex-col gap-3">
          <h2 id="link-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
            <Unlink aria-hidden className="size-5 text-gold" />
            Waiting for a new link
            <span className="tabular text-xs text-muted">{needsLink.length}</span>
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {needsLink.map((request) => (
              <li key={request.id} className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
                <p className="font-bold">{request.memberName}</p>
                <p className="text-muted">&ldquo;{request.creatorNote}&rdquo;</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="past-heading" className="flex flex-col gap-4">
        <h2 id="past-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
          <History aria-hidden className="size-5 text-primary" />
          Sent in the last 90 days
          <span className="tabular text-xs text-muted">{done.length}</span>
        </h2>
        {done.length === 0 ? (
          <p className="text-sm text-muted">Reviews you send show up here.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {done.map((request) => (
              <li key={request.id} className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0f141b] p-4 text-sm">
                <p className="flex items-center justify-between gap-2">
                  <span className="font-bold">{request.memberName}</span>
                  <span className="tabular rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-mint uppercase">Sent</span>
                </p>
                <p className="tabular text-xs text-muted">
                  {request.completedAt ? ukShortDay(request.completedAt) : ""}
                  {request.title ? ` · ${request.title}` : ""}
                </p>
                {request.plan.length > 0 && (
                  <p className="flex items-start gap-1.5 text-muted">
                    <ClipboardList aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {request.plan.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
