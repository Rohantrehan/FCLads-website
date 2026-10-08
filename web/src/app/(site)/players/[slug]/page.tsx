import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, LineChart, Lock, Network } from "lucide-react";
import { CollectibleCard } from "@/components/cards/PlayerCard";
import { GuideCard } from "@/components/cards/GuideCard";
import { ShareButton } from "@/components/learn/ShareButton";
import {
  AlternativeCard,
  AttributeGroups,
  ChemistryCards,
  FaceStatBars,
  PlayerFacts,
  PlaystyleChips,
  ProReviewSection,
} from "@/components/players/PlayerDetail";
import { PriceChart } from "@/components/players/PriceChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoinPrice, Trend } from "@/components/ui/DataBits";
import { creators, getCreator } from "@/data/creators";
import { getGuideContent } from "@/data/guideContent";
import { guides } from "@/data/guides";
import { CURRENT_PATCH, CURRENT_WEEK, RANKING_PUBLISHED } from "@/data/meta";
import { getPlayer, players } from "@/data/players";
import { formatCompact } from "@/lib/format";
import { getPlayerReview } from "@/lib/playerAccess";
import { groupOf, positionGroups } from "@/lib/positions";
import { priceHistory } from "@/lib/priceHistory";
import { getViewer } from "@/lib/viewer";
import type { Player } from "@/types";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return players.map((player) => ({ slug: player.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const player = getPlayer((await params).slug);
  if (!player) return {};
  return {
    title: `${player.name} (${player.ovr} ${player.position}): stats, price and verdict`,
    description: player.verdict ?? `${player.name} stats, price history and the FC Lads verdict.`,
    alternates: { canonical: `/players/${player.slug}` },
  };
}

/** Cheaper players in the same position group, best meta score first. */
function alternativesFor(player: Player, count = 4) {
  const group = groupOf(player.position);
  const sameGroup = players.filter((other) => other.slug !== player.slug && groupOf(other.position) === group);
  const cheaper = sameGroup.filter((other) => (other.price ?? 0) < (player.price ?? 0));
  return (cheaper.length >= 2 ? cheaper : sameGroup).slice(0, count);
}

function SectionTitle({
  id,
  title,
  description,
  action,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="font-display text-xl font-extrabold uppercase md:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default async function PlayerPage({ params }: { params: Params }) {
  const player = getPlayer((await params).slug);
  if (!player) notFound();

  const viewer = await getViewer();
  const { review, hasReview } = getPlayerReview(player.slug, viewer);
  const group = groupOf(player.position);
  const groupInfo = positionGroups[group];
  const picks = creators.flatMap((creator) =>
    (creator.picks ?? [])
      .filter((pick) => pick.playerSlug === player.slug)
      .map((pick) => ({ creator, verdict: pick.verdict })),
  );
  const history = priceHistory(player, RANKING_PUBLISHED);
  const alternatives = alternativesFor(player);
  const featuredIn = guides.filter((guide) => getGuideContent(guide.slug)?.playerSlugs?.includes(player.slug));
  const moreGuides =
    featuredIn.length > 0
      ? featuredIn.slice(0, 3)
      : guides.filter((guide) => guide.category === "meta-players").slice(0, 3);
  const positions = [player.position, ...(player.altPositions ?? [])];
  const origin = [player.country ?? player.nation, player.club, player.league].filter(Boolean).join(" · ");

  const telemetry = [
    player.matches && {
      label: "Matches this week",
      value: formatCompact(player.matches),
      note: "Competitive games with this card",
    },
    player.goalsPerGame && { label: "Goals per game", value: player.goalsPerGame.toFixed(2), note: "In FUT Champs" },
    player.winRate && {
      label: "Champs win rate",
      value: `${player.winRate.toFixed(1)}%`,
      note: "Teams using this card",
    },
    player.metaRank && {
      label: "Meta ranking",
      value: `#${player.metaRank} ${groupInfo.short}`,
      note: player.metaScore ? `Meta score ${player.metaScore.toFixed(1)}` : `Week ${CURRENT_WEEK}`,
    },
  ].filter(Boolean) as { label: string; value: string; note: string }[];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_70%_60%_at_25%_0%,rgb(14_42_34/0.85),transparent)]"
      />

      {/* Hero */}
      <header className="page-container relative flex flex-col gap-8 pt-8 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="tabular flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li>
                <Link href="/players" className="hover:text-white">
                  Players
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link href={`/players?position=${group}`} className="hover:text-white">
                  {groupInfo.label}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="max-w-[14rem] truncate text-white/80">
                {player.name}
              </li>
            </ol>
          </nav>
          <p className="tabular rounded-full border border-white/10 px-3 py-1 text-[10px] text-mint uppercase">
            Player dossier {"//"} patch {CURRENT_PATCH} verified
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col items-center gap-5 lg:col-span-4">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 m-auto size-64 rounded-full bg-primary/20 blur-[90px]"
              />
              <CollectibleCard player={player} link={false} />
            </div>
            <ShareButton path={`/players/${player.slug}`} title={`${player.name} on FC Lads`} />
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            <div className="flex flex-col gap-3">
              <p className="flex flex-wrap items-center gap-2">
                {player.metaTag && <Badge tone="solid">{player.metaTag}</Badge>}
                {player.metaRank && (
                  <Badge tone="mint">
                    #{player.metaRank} {groupInfo.short} · week {CURRENT_WEEK}
                  </Badge>
                )}
                {player.metaScore && <Badge tone="azure">Meta score {player.metaScore.toFixed(1)}</Badge>}
              </p>
              <h1 className="font-display text-4xl leading-none font-extrabold uppercase md:text-6xl">{player.name}</h1>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                {positions.map((position, index) => (
                  <span
                    key={position}
                    className={
                      index === 0
                        ? "tabular rounded bg-primary/15 px-2 py-0.5 text-xs font-bold text-mint"
                        : "tabular rounded bg-white/8 px-2 py-0.5 text-xs font-bold text-white/70"
                    }
                  >
                    {position}
                  </span>
                ))}
                <span className="ml-1">{origin}</span>
              </p>
            </div>

            <FaceStatBars stats={player.stats} />
            <PlayerFacts player={player} />

            <div className="flex flex-wrap gap-3 pt-1">
              {hasReview && !review ? (
                <Button href="#lads-verdict" variant="primary">
                  <Lock aria-hidden className="size-4" />
                  Unlock the Lads&apos; review
                </Button>
              ) : (
                <Button href="#lads-verdict" variant="primary">
                  Read the Lads&apos; verdict
                </Button>
              )}
              {history.length > 0 && (
                <Button href="#price" variant="glass">
                  <LineChart aria-hidden className="size-4" />
                  Price history
                </Button>
              )}
              <Button href="/squads" variant="glass">
                <Network aria-hidden className="size-4" />
                Find squads
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* The Lads' verdict */}
      {(picks.length > 0 || hasReview || player.verdict) && (
        <section aria-labelledby="lads-verdict-heading" id="lads-verdict" className="page-container scroll-mt-24 pb-14">
          <SectionTitle
            id="lads-verdict-heading"
            title="The Lads' verdict"
            description={picks.length ? undefined : player.verdict}
          />
          <ProReviewSection
            picks={picks}
            review={review}
            reviewAuthor={review ? getCreator(review.authorSlug) : undefined}
            hasReview={hasReview}
            playerName={player.name}
          />
        </section>
      )}

      {/* Telemetry + price */}
      <section aria-labelledby="usage-heading" className="page-container pb-14">
        <SectionTitle id="usage-heading" title={`Usage this week (patch ${CURRENT_PATCH})`} />
        {telemetry.length > 0 && (
          <ul className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {telemetry.map((tile) => (
              <li key={tile.label} className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
                <span className="text-label text-muted">{tile.label}</span>
                <span className="font-display text-3xl font-extrabold text-white md:text-4xl">{tile.value}</span>
                <span className="text-xs text-muted">{tile.note}</span>
              </li>
            ))}
          </ul>
        )}

        {history.length > 0 && player.price !== undefined && (
          <div id="price" className="scroll-mt-24 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-label text-muted">Transfer market price</h3>
                <p className="mt-1 flex flex-wrap items-center gap-3">
                  <CoinPrice value={player.price} className="font-display text-3xl font-extrabold" />
                  {player.trend !== undefined && (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <Trend value={player.trend} /> this week
                    </span>
                  )}
                </p>
              </div>
            </div>
            <PriceChart points={history} />
            <p className="mt-3 text-xs text-muted">Prices are approximate and can move fast on patch and promo days.</p>
          </div>
        )}
      </section>

      {player.attributes && (
        <section aria-labelledby="attributes-heading" className="page-container pb-14">
          <SectionTitle
            id="attributes-heading"
            title="Full in-game attributes"
            description="Every attribute behind the six face stats, before chemistry boosts."
          />
          <div className="rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-7">
            <AttributeGroups attributes={player.attributes} stats={player.stats} />
          </div>
        </section>
      )}

      {(player.playstylesPlus?.length || player.playstyles?.length) && (
        <section aria-labelledby="playstyles-heading" className="page-container pb-14">
          <SectionTitle id="playstyles-heading" title="PlayStyles" description="Highlighted ones are PlayStyles+." />
          <PlaystyleChips plus={player.playstylesPlus} regular={player.playstyles} />
        </section>
      )}

      {player.chemistryStyles && player.chemistryStyles.length > 0 && (
        <section aria-labelledby="chem-heading" className="page-container pb-14">
          <SectionTitle
            id="chem-heading"
            title="Best chemistry styles"
            description="Tested by the Lads. The highlighted one is our pick."
          />
          <ChemistryCards styles={player.chemistryStyles} />
        </section>
      )}

      {alternatives.length > 0 && (
        <section aria-labelledby="alternatives-heading" className="border-t border-white/6 bg-surface py-14">
          <div className="page-container">
            <SectionTitle
              id="alternatives-heading"
              title="Budget alternatives"
              description={`Similar ${groupInfo.label.toLowerCase()} for fewer coins.`}
              action={
                <Link
                  href={`/players?position=${group}&sort=price-asc`}
                  className="text-label flex items-center gap-1.5 text-primary hover:text-white"
                >
                  All {groupInfo.label.toLowerCase()} by price
                  <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {alternatives.map((alternative) => (
                <AlternativeCard key={alternative.slug} player={alternative} />
              ))}
            </div>
          </div>
        </section>
      )}

      {moreGuides.length > 0 && (
        <section aria-labelledby="guides-heading" className="page-container py-14">
          <SectionTitle
            id="guides-heading"
            title={featuredIn.length > 0 ? `Guides featuring ${player.cardName ?? player.name}` : "Meta player guides"}
            action={
              <Link href="/learn" className="text-label flex items-center gap-1.5 text-primary hover:text-white">
                Browse all guides
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} author={getCreator(guide.authorSlug)} className="h-full" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
