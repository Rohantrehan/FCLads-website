import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarClock, Lock, MessagesSquare, Newspaper, Play, Video, Zap } from "lucide-react";
import { DashboardHeading, DashPanel, MembersOnly, PanelLink } from "@/components/dashboard/DashboardBits";
import { Avatar } from "@/components/ui/DataBits";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getContent } from "@/lib/content";
import { feedTopics } from "@/lib/content/constants";
import { getReviewSummary, REVIEW_STEPS } from "@/lib/reviews";
import { ukLongDay, ukShortDay } from "@/lib/ukTime";
import { categoryLabels } from "@/lib/format";
import { getViewer } from "@/lib/viewer";
import type { Creator, FeedPost } from "@/types";

// The layout's title template only applies to child pages, so this page sets its full title.
export const metadata: Metadata = { title: { absolute: "My Feed · My Lads+ | FC Lads" } };

/** Card in the "New from the Lads" row. The whole card is one link. */
function DropCard({
  kicker,
  title,
  href,
  author,
  highlight,
  children,
}: {
  kicker: string;
  title: string;
  href: string;
  author?: Creator;
  highlight?: boolean;
  children?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5 transition-colors hover:border-primary/50",
        highlight ? "border-primary/40 shadow-[0_0_32px_color-mix(in_oklab,var(--color-primary)_8%,transparent)]" : "border-white/8",
      )}
    >
      <p className="text-label text-mint">{kicker}</p>
      <h3 className="font-display text-lg leading-tight font-extrabold uppercase transition-colors group-hover:text-primary">
        <Link href={href} className="after:absolute after:inset-0">
          {title}
        </Link>
      </h3>
      {author && (
        <p className="flex items-center gap-2 text-sm">
          <Avatar initials={author.initials.charAt(0)} size="sm" tone="mint" />
          <span className="font-semibold">{author.name}</span>
          <span className="text-xs text-muted">{author.role}</span>
        </p>
      )}
      {children && <div className="mt-auto">{children}</div>}
    </article>
  );
}

/** A feed post's headline and a line of text, whatever its type. */
function feedSummary(post: FeedPost) {
  switch (post.type) {
    case "video":
      return { title: post.title, text: post.excerpt };
    case "update":
      return { title: post.title, text: post.points[0] ?? "" };
    case "trading":
      return { title: post.title, text: `${post.targets.length} buy targets` };
    case "tip":
      return { title: post.label, text: post.text };
    case "poll":
      return { title: post.question, text: `${post.options.length} options to vote on` };
  }
}

export default async function MyFeedPage() {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  const content = await getContent();
  const { getCreator } = content;
  // Everything on this page comes from what the Lads post on the posting board.
  const guide = content.featuredGuide();
  // Newest trading post. Members only (checked above), so FC Lads+ text is fine here.
  const tradingPost = content.tradingPosts[0];
  const feedPost = content.feedPosts.find((post) => post.type !== "trading");
  const feedLine = feedPost && feedSummary(feedPost);
  const upcoming = content.upcomingGuide;
  const latestVideos = content.guides.filter((item) => item.format === "video").slice(0, 3);
  const updates = content.feedPosts.flatMap((post) => (post.type === "update" ? [post] : [])).slice(0, 3);
  const discordInvite = content.settings.socials.discord;
  const review = await getReviewSummary(viewer);
  const lastReviewer = review.lastCreatorSlug ? getCreator(review.lastCreatorSlug) : undefined;
  const openReviewer = review.open?.creatorSlug ? getCreator(review.open.creatorSlug) : undefined;
  const hasDrops = Boolean(guide || tradingPost || feedPost || upcoming);

  return (
    <div className="page-container flex flex-col gap-10 pt-10 pb-20">
      <DashboardHeading
        eyebrow="My feed"
        title={
          <>
            Welcome back, <span className="text-primary">{viewer.name}</span>
          </>
        }
        description="Here's what the Lads posted since your last visit."
      />

      {hasDrops && (
        <section aria-labelledby="drops-heading" className="flex flex-col gap-4">
          <h2 id="drops-heading" className="font-display text-lg font-extrabold uppercase">
            New from the Lads
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guide && (
              <DropCard
                kicker={`New ${guide.format === "video" ? "video" : "guide"} · ${categoryLabels[guide.category]}`}
                title={guide.title}
                href={`/guides/${guide.slug}`}
                author={getCreator(guide.authorSlug)}
                highlight
              >
                <p className="line-clamp-3 text-sm text-muted">{guide.excerpt}</p>
              </DropCard>
            )}

            {tradingPost && (
              <DropCard
                kicker="New trading post"
                title={tradingPost.title}
                href="/dashboard/trading"
                author={getCreator(tradingPost.authorSlug)}
              >
                <p className="line-clamp-3 text-sm text-muted">{tradingPost.text}</p>
              </DropCard>
            )}

            {feedPost && feedLine && (
              <DropCard
                kicker={`Feed · ${feedTopics[feedPost.topic]}`}
                title={feedLine.title}
                href="/feed"
                author={getCreator(feedPost.authorSlug)}
              >
                {feedLine.text && (
                  <blockquote className="line-clamp-3 border-l-2 border-primary pl-3 text-sm text-muted">
                    {feedLine.text}
                  </blockquote>
                )}
              </DropCard>
            )}

            {upcoming && (
              <article className="flex flex-col gap-4 rounded-2xl border border-dashed border-white/12 p-5 text-muted">
                <p className="text-label">Coming {ukLongDay(upcoming.publishedAt)}</p>
                <h3 className="font-display text-lg leading-tight font-extrabold text-white/70 uppercase">
                  {upcoming.title}
                </h3>
                <span className="mt-auto flex items-center gap-2 text-xs">
                  <Lock aria-hidden className="size-3.5" />
                  Unlocks when it&apos;s published
                </span>
              </article>
            )}
          </div>
        </section>
      )}

      {latestVideos.length > 0 && (
        <DashPanel
          id="videos-heading"
          title="Latest videos"
          icon={<Play aria-hidden className="size-5 text-primary" />}
          action={<PanelLink href="/dashboard/gameplay">Video library</PanelLink>}
        >
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {latestVideos.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-label text-mint">{getCreator(item.authorSlug)?.name}</span>
                    <span className="tabular text-[11px] text-muted">{item.minutes} min</span>
                  </span>
                  <span className="font-display leading-tight font-extrabold uppercase group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="mt-auto line-clamp-2 text-sm text-muted">{item.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DashPanel>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {updates.length > 0 && (
          <DashPanel
            id="week-heading"
            title="This week in FC"
            icon={<Newspaper aria-hidden className="size-5 text-primary" />}
            action={<PanelLink href="/feed?topic=updates">All updates</PanelLink>}
          >
            <ul className="flex flex-col gap-3">
              {updates.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-xl border border-white/8 bg-surface p-4">
                  <Zap aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                  <span>
                    <span className="text-label block text-gold">{item.title}</span>
                    {item.points[0] && <span className="mt-1 block text-sm">{item.points[0]}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </DashPanel>
        )}

        <DashPanel
          id="next-review-heading"
          title="Your next review"
          icon={<Video aria-hidden className="size-5 text-primary" />}
          action={
            <span className="tabular rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold uppercase">
              {review.left > 0 ? `Use it by ${ukShortDay(review.lastDay)}` : `Next from ${ukShortDay(review.nextMonth)}`}
            </span>
          }
          className="border-primary/25"
        >
          <div className="flex flex-col gap-2">
            <p className="tabular flex justify-between text-xs text-muted">
              <span>{review.month} review</span>
              <span className="text-mint">
                {Math.min(review.stepIndex, REVIEW_STEPS.length)} / {REVIEW_STEPS.length} steps done
              </span>
            </p>
            <ol className="grid grid-cols-3 gap-2">
              {REVIEW_STEPS.map((step, index) => (
                <li key={step} className="flex flex-col gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 rounded-full",
                      index < review.stepIndex
                        ? "bg-primary"
                        : index === review.stepIndex
                          ? "bg-primary/40"
                          : "bg-surface-highest",
                    )}
                  />
                  <span className={cn("text-[11px]", index <= review.stepIndex ? "text-on-surface" : "text-muted")}>
                    {step}
                    <span className="sr-only">
                      {index < review.stepIndex ? " (done)" : index === review.stepIndex ? " (next)" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {review.open && (
            <p className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4 text-sm">
              <CalendarClock aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold">
                  {review.open.status === "in_review"
                    ? `${openReviewer?.name ?? "A Lad"} is reviewing your match`
                    : review.open.status === "fix_link"
                      ? "Your match link needs fixing"
                      : `Match sent${openReviewer ? ` to ${openReviewer.name}` : ""}`}
                </span>
                <span className="text-muted">Your review and plan will appear on your review page.</span>
              </span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/dashboard/review" variant="primary">
              {review.open ? "See your review" : review.left > 0 ? "Send your match" : "See your plan"}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
            {lastReviewer && !review.open && (
              <span className="text-xs text-muted">
                Last review with {lastReviewer.name}. You can pick anyone this month.
              </span>
            )}
          </div>
        </DashPanel>
      </div>

      {discordInvite && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <MessagesSquare aria-hidden className="size-3.5" />
          Something missing? Ask the Lads on{" "}
          <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white">
            Discord
          </a>
        </p>
      )}
    </div>
  );
}
