import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Flame, Rss } from "lucide-react";
import { FeedPostCard, isWidePost } from "@/components/feed/FeedCards";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { Button } from "@/components/ui/Button";
import { getCreator } from "@/data/creators";
import { countByTopic, FEED_PAGE_SIZE, feedPosts, feedTopics, isFeedTopic, postsToday, trending } from "@/data/feed";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";
import { queryFeed } from "@/lib/feedAccess";
import { formatCompact } from "@/lib/format";
import { getViewer } from "@/lib/viewer";
import type { FeedTopic } from "@/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function readParams(searchParams: SearchParams) {
  const params = await searchParams;
  const topic = first(params.topic);
  const limit = Number(first(params.limit));
  return {
    topic: isFeedTopic(topic) ? topic : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : FEED_PAGE_SIZE,
  };
}

function feedHref(topic?: FeedTopic, limit?: number) {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  return query ? `/feed?${query}` : "/feed";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { topic } = await readParams(searchParams);
  return {
    title: topic ? `${feedTopics[topic]} feed` : "The FC Lads feed",
    description:
      "Everything happening in EA SPORTS FC: patch changes, player verdicts, squads, trading tips and Champs advice from the Lads.",
    alternates: { canonical: topic ? `/feed?topic=${topic}` : "/feed" },
  };
}

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const { topic, limit } = await readParams(searchParams);
  const { items, total } = queryFeed({ topic, limit }, await getViewer());
  const counts = countByTopic();
  const remaining = total - items.length;
  // Wide posts (videos, polls) get a full row; runs of narrow posts share a two-column block.
  const segments = items.reduce<{ wide: boolean; posts: typeof items }[]>((acc, post) => {
    const wide = isWidePost(post);
    const last = acc.at(-1);
    if (!wide && last && !last.wide) last.posts.push(post);
    else acc.push({ wide, posts: [post] });
    return acc;
  }, []);
  const tabs = [
    { key: undefined, label: "All", count: feedPosts.length },
    ...(Object.keys(feedTopics) as FeedTopic[]).map((key) => ({ key, label: feedTopics[key], count: counts[key] })),
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]"
      />

      <header className="page-container relative flex flex-col gap-6 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
        <div className="flex flex-col gap-3">
          <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
            <Rss aria-hidden className="size-3.5" />
            The feed {"//"} updated all day
          </p>
          <h1 className="text-hero">
            The FC Lads <span className="text-primary">feed</span>
          </h1>
          <p className="max-w-xl text-lg font-semibold text-primary">
            Everything happening in FC, without spending your whole day online.
          </p>
        </div>
        <p className="glass flex items-center gap-3 self-start rounded-xl px-4 py-3 lg:self-auto">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="tabular text-xs font-bold uppercase">{postsToday()} new posts today</span>
        </p>
      </header>

      <nav aria-label="Feed topics" className="page-container relative pb-8">
        <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {tabs.map(({ key, label, count }) => {
            const active = key === topic;
            return (
              <li key={label} className="shrink-0">
                <Link
                  href={feedHref(key)}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "tabular flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-colors",
                    active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white",
                  )}
                >
                  {label}
                  <span className={active ? "text-on-primary/70" : "text-white/40"}>{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="page-container relative grid grid-cols-1 gap-8 pb-20 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <h2 className="sr-only">{topic ? `${feedTopics[topic]} posts` : "Latest posts"}</h2>
          {segments.map((segment) =>
            segment.wide ? (
              <FeedPostCard key={segment.posts[0].id} post={segment.posts[0]} />
            ) : (
              // Narrow posts pack into two balanced columns between the wide ones (no gaps).
              <div key={segment.posts[0].id} className="gap-6 md:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid [&>*:last-child]:mb-0">
                {segment.posts.map((post) => (
                  <FeedPostCard key={post.id} post={post} />
                ))}
              </div>
            ),
          )}

          <div className="flex flex-col items-center gap-2 pt-2">
            {remaining > 0 && (
              <Button href={feedHref(topic, limit + FEED_PAGE_SIZE)} variant="glass" scroll={false}>
                Load more posts
              </Button>
            )}
            <p id="feed-count" className="tabular text-[11px] text-muted uppercase" aria-live="polite">
              Showing {items.length} of {total} posts
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 lg:sticky lg:top-28">
            <div>
              <p className="text-label text-muted">Free</p>
              <p className="mt-1 text-sm text-muted">
                The feed, meta player rankings, squads and our YouTube videos are free for everyone.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-pitch-green/40 p-4">
              <p className="text-label text-mint">FC Lads+ ({ladsPlus.priceLabel}/mo)</p>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Every guide and video series",
                  "Full trading targets and sell prices",
                  "Private Discord and a monthly review",
                ].map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button href={JOIN_HREF} variant="primary" size="sm" className="mt-1 w-full">
                Join FC Lads+
              </Button>
            </div>
          </div>

          <section
            aria-labelledby="trending-heading"
            className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
          >
            <h2 id="trending-heading" className="flex items-center gap-2 font-display font-extrabold uppercase">
              <Flame aria-hidden className="size-5 text-gold" />
              Trending this week
            </h2>
            <ol className="flex flex-col gap-3">
              {trending.map((item, index) => (
                <li key={item.title}>
                  <Link href={item.href} className="group flex items-center gap-3">
                    <span className="tabular w-8 shrink-0 font-display text-lg font-extrabold text-white/30 group-hover:text-primary">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold group-hover:text-mint">{item.title}</span>
                      <span className="tabular text-[11px] text-muted">
                        {getCreator(item.authorSlug)?.name} · {formatCompact(item.views)} views
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="follow-heading"
            className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
          >
            <h2 id="follow-heading" className="font-display font-extrabold uppercase">
              Follow the Lads
            </h2>
            <p className="text-sm text-muted">Daily clips, streams and patch alerts on every platform.</p>
            <SocialIcons />
          </section>
        </aside>
      </div>
    </div>
  );
}
