import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Video } from "lucide-react";
import { DashboardHeading, DashPanel, MembersOnly, PanelLink } from "@/components/dashboard/DashboardBits";
import { FeedPostCard } from "@/components/feed/FeedCards";
import { Button } from "@/components/ui/Button";
import { CoinPrice } from "@/components/ui/DataBits";
import { creators, getCreator } from "@/data/creators";
import { currentReview } from "@/data/memberDashboard";
import { getPlayer } from "@/data/players";
import { cn } from "@/lib/cn";
import { queryFeed } from "@/lib/feedAccess";
import { getViewer } from "@/lib/viewer";
import type { Player } from "@/types";

export const metadata: Metadata = { title: "Creators" };

const POSTS_SHOWN = 8;

export default async function DashboardCreatorsPage({ searchParams }: PageProps<"/dashboard/creators">) {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  const { creator: raw } = await searchParams;
  const selected = typeof raw === "string" ? getCreator(raw) : undefined;
  const all = queryFeed({ limit: 100 }, viewer).items;
  const posts = all.filter((post) => !selected || post.authorSlug === selected.slug).slice(0, POSTS_SHOWN);
  const countFor = (slug: string) => all.filter((post) => post.authorSlug === slug).length;

  // One pick per creator: the Lads' recommended players this week.
  const picks = creators.flatMap((creator) => {
    const pick = creator.picks?.[0];
    const player = pick && getPlayer(pick.playerSlug);
    return pick && player ? [{ creator, player: player as Player, verdict: pick.verdict }] : [];
  });
  const reviewsLeft = currentReview.credits.total - currentReview.credits.used;

  const chips: { slug?: string; name: string; count: number }[] = [
    { name: "All creators", count: all.length },
    ...creators.map((creator) => ({ slug: creator.slug, name: creator.name, count: countFor(creator.slug) })),
  ];

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Creators"
        title="From the Lads"
        description="Every post from the creators in one place: tactics, market calls, squads and quick tips."
      />

      <nav aria-label="Filter by creator" className="scrollbar-none -mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {chips.map((chip) => {
            const current = chip.slug === selected?.slug;
            return (
              <li key={chip.slug ?? "all"}>
                <Link
                  href={chip.slug ? `/dashboard/creators?creator=${chip.slug}` : "/dashboard/creators"}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    current
                      ? "border-primary bg-primary text-on-primary"
                      : "border-white/10 text-muted hover:border-white/25 hover:text-white",
                  )}
                >
                  {chip.name}
                  <span className={cn("tabular text-[11px]", current ? "text-on-primary/70" : "text-muted/70")}>
                    {chip.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section aria-label="Creator posts" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          {posts.length > 0 ? (
            <div className="md:columns-2 md:gap-6 [&>*]:mb-6 [&>*]:break-inside-avoid">
              {posts.map((post) => (
                <FeedPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-muted">
              {selected?.name} hasn&apos;t posted yet. Check back soon.
            </p>
          )}
          <PanelLink href={selected ? `/creators/${selected.slug}` : "/feed"}>
            {selected ? `See ${selected.name}'s profile` : "Open the full feed"}
          </PanelLink>
        </section>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <DashPanel
            id="picks-heading"
            title="Recommended this week"
            icon={<Star aria-hidden className="size-5 text-primary" />}
          >
            <ul className="flex flex-col gap-3">
              {picks.map(({ creator, player, verdict }) => (
                <li key={creator.slug}>
                  <Link
                    href={`/players/${player.slug}`}
                    className="group flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4 transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-highest leading-none">
                        <span className="font-display font-extrabold text-mint">{player.ovr}</span>
                        <span className="tabular text-[9px] text-muted">{player.position}</span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-semibold group-hover:text-primary">{player.name}</span>
                        <span className="text-[11px] text-muted">Picked by {creator.name}</span>
                      </span>
                      {player.price !== undefined && <CoinPrice value={player.price} compact className="text-sm" />}
                    </span>
                    <span className="text-sm text-muted italic">&ldquo;{verdict}&rdquo;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </DashPanel>

          <DashPanel
            id="ask-review-heading"
            title="Want a Lad to look at your game?"
            icon={<Video aria-hidden className="size-5 text-primary" />}
            className="border-primary/30"
          >
            <p className="text-sm text-muted">
              Send a match and book a 30-minute session with Stefan, Hobs or Wessam. You have {reviewsLeft}{" "}
              {reviewsLeft === 1 ? "review" : "reviews"} left this month.
            </p>
            <Button href="/dashboard/review" variant="primary" size="sm" className="w-full">
              Book my review
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </DashPanel>
        </aside>
      </div>
    </div>
  );
}
