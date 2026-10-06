import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessagesSquare, MonitorPlay, Video } from "lucide-react";
import { CreatorCard } from "@/components/cards/CreatorCard";
import { GuideCard } from "@/components/cards/GuideCard";
import { SquadCard } from "@/components/cards/SquadCard";
import { AudienceStats, PickCard } from "@/components/creators/CreatorBits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { creators, getCreator } from "@/data/creators";
import { getGuidesByAuthor } from "@/data/guides";
import { ladsPlus } from "@/data/ladsPlus";
import { getPlayer } from "@/data/players";
import { getSquadsByAuthor } from "@/data/squads";
import { socialLinks } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return creators.map((creator) => ({ slug: creator.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const creator = getCreator((await params).slug);
  if (!creator) return {};
  return {
    title: `${creator.name} — ${creator.role}`,
    description: creator.bio ?? `${creator.name}'s guides, player picks and squads on FC Lads.`,
    alternates: { canonical: `/creators/${creator.slug}` },
  };
}

export default async function CreatorProfilePage({ params }: { params: Params }) {
  const creator = getCreator((await params).slug);
  if (!creator) notFound();

  const authored = getGuidesByAuthor(creator.slug);
  const videos = authored.filter((guide) => guide.format === "video").slice(0, 4);
  const picks = (creator.picks ?? [])
    .map((pick) => ({ ...pick, player: getPlayer(pick.playerSlug) }))
    .filter((pick) => pick.player);
  const squads = getSquadsByAuthor(creator.slug);

  const tabs = [
    { id: "latest", label: "Latest", show: videos.length > 0 },
    { id: "picks", label: "Player picks", show: picks.length > 0 },
    { id: "guides", label: "Guides", show: authored.length > 0 },
    { id: "squads", label: "Squads", show: squads.length > 0 },
  ].filter((tab) => tab.show);

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_70%_60%_at_25%_0%,rgb(14_42_34/0.85),transparent)]" />

      <header className="page-container relative flex flex-col gap-8 pt-8 pb-10">
        <nav aria-label="Breadcrumb">
          <ol className="tabular flex items-center gap-1.5 text-xs text-muted">
            <li>
              <Link href="/creators" className="hover:text-white">
                Creators
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="text-white/80">
              {creator.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <CreatorCard creator={creator} featured showProfileLink={false} className="mx-auto w-full max-w-xs lg:col-span-4" />

          <div className="flex flex-col gap-5 lg:col-span-8">
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone="mint">{creator.role}</Badge>
              <Badge>{creator.country}</Badge>
              {creator.rankLabel && <Badge tone="azure">{creator.rankLabel}</Badge>}
            </p>
            <h1 className="text-hero">{creator.name}</h1>
            <p className="text-sm font-bold tracking-wide text-mint uppercase">{creator.tagline}</p>
            {creator.bio && <p className="max-w-2xl text-lg leading-relaxed text-muted">{creator.bio}</p>}
            <AudienceStats audience={creator.audience} />
            <div className="flex flex-wrap gap-3 pt-2">
              <Button href="/lads-plus" variant="primary">
                <MessagesSquare aria-hidden className="size-4" />
                Ask {creator.name} in Discord
                <span className="tabular rounded bg-on-primary/15 px-1.5 py-0.5 text-[10px]">LADS+</span>
              </Button>
              <Button href={creator.socials.youtube ?? socialLinks.youtube} variant="glass">
                <MonitorPlay aria-hidden className="size-4 text-danger" />
                Subscribe on YouTube
              </Button>
            </div>
          </div>
        </div>
      </header>

      {tabs.length > 1 && (
        <nav
          aria-label="Profile sections"
          className="sticky top-16 z-30 border-y border-white/8 bg-canvas/85 backdrop-blur-xl lg:top-20"
        >
          <ul className="page-container scrollbar-none flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <li key={tab.id} className="shrink-0">
                <a
                  href={`#${tab.id}`}
                  className="tabular block rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase transition-colors hover:border-primary/50 hover:text-mint"
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="page-container flex flex-col gap-20 py-16">
        {videos.length > 0 && (
          <section id="latest" aria-labelledby="latest-heading" className="scroll-mt-40 flex flex-col gap-6">
            <h2 id="latest-heading" className="flex items-center gap-3 font-display text-xl font-extrabold uppercase">
              <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
              Latest videos
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} className="h-full" />
              ))}
            </div>
          </section>
        )}

        {picks.length > 0 && (
          <section id="picks" aria-labelledby="picks-heading" className="scroll-mt-40 flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="picks-heading" className="flex items-center gap-3 font-display text-xl font-extrabold uppercase">
                <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
                {creator.name}&apos;s player picks
              </h2>
              <p className="tabular text-xs text-muted uppercase">Current meta endorsements</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {picks.map(({ player, verdict }) =>
                player ? <PickCard key={player.slug} player={player} verdict={verdict} creatorName={creator.name} /> : null,
              )}
            </div>
          </section>
        )}

        {authored.length > 0 && (
          <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-40 flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="guides-heading" className="flex items-center gap-3 font-display text-xl font-extrabold uppercase">
                <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
                Guides by {creator.name}
              </h2>
              <p className="tabular text-xs text-muted uppercase">{authored.length} guides</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {authored.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} className="h-full" />
              ))}
            </div>
          </section>
        )}

        {squads.length > 0 && (
          <section id="squads" aria-labelledby="squads-heading" className="scroll-mt-40 flex flex-col gap-6">
            <h2 id="squads-heading" className="flex items-center gap-3 font-display text-xl font-extrabold uppercase">
              <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
              {creator.name}&apos;s squads
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {squads.map((squad) => (
                <SquadCard key={squad.slug} squad={squad} authorName={creator.name} />
              ))}
            </div>
          </section>
        )}

        <section
          aria-labelledby="review-cta"
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-pitch-green via-[#0a1d17] to-canvas p-6 md:p-12"
        >
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-mint/10 blur-[90px]" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-label flex items-center gap-2 text-mint">
                <Video aria-hidden className="size-4" />
                1-on-1 gameplay review
              </p>
              <h2 id="review-cta" className="mt-3 font-display text-3xl leading-tight font-extrabold uppercase md:text-4xl">
                Want {creator.name} to review your gameplay?
              </h2>
              <p className="mt-3 text-muted">
                FC Lads+ members get a monthly gameplay review with one of the Lads. Upload a match and get a video breakdown
                with personal tactical fixes.
              </p>
              <p className="tabular mt-4 text-primary">
                {ladsPlus.priceLabel} / month <span className="text-muted">· Cancel anytime</span>
              </p>
            </div>
            <Button href="/lads-plus" size="lg" className="shrink-0">
              Join FC Lads+
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
