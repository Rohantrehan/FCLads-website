import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Lightbulb, Lock, PlayCircle, Repeat, TrendingUp } from "lucide-react";
import { CopyCode } from "@/components/guide/CopyCode";
import { BudgetTabs, SquadTile } from "@/components/squads/SquadBits";
import { type PitchSlot, SquadPitch } from "@/components/squads/SquadPitch";
import { SquadsHeader } from "@/components/squads/SquadsHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { getGuide } from "@/data/guides";
import { getPlayer } from "@/data/players";
import { getSquad, squads } from "@/data/squads";
import { formationSlots } from "@/lib/formations";
import { benchPlayers, chemistryLinks, squadCosts, squadRating } from "@/lib/squadStats";
import type { Player } from "@/types";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return squads.map((squad) => ({ slug: squad.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const squad = getSquad((await params).slug);
  if (!squad) return {};
  return {
    title: `${squad.name} (${squad.formation})`,
    description: `${squad.note} Full starting XI, bench, tactics and upgrade path.`,
    alternates: { canonical: `/squads/${squad.slug}` },
  };
}

export default async function SquadPage({ params }: { params: Params }) {
  const squad = getSquad((await params).slug);
  if (!squad) notFound();

  const author = getCreator(squad.authorSlug);
  const layout = formationSlots(squad.formation);
  const slots: PitchSlot[] = squad.lineup.flatMap((slot, index) => {
    const player = getPlayer(slot.playerSlug);
    return player && layout[index] ? [{ ...layout[index], player, chem: slot.chem }] : [];
  });
  const initial = Math.max(
    slots.findIndex((slot) => slot.player.slug === squad.keyPlayerSlug),
    0,
  );
  const rating = squadRating(squad);
  const costs = squadCosts(squad);
  const links = chemistryLinks(squad);
  const bench = benchPlayers(squad).map((player) => ({
    player,
    role: squad.bench.find((slot) => slot.playerSlug === player.slug)?.role ?? "",
  }));
  const upgrades = squad.upgrades
    .map((upgrade) => ({ ...upgrade, from: getPlayer(upgrade.fromSlug), to: getPlayer(upgrade.toSlug) }))
    .filter((upgrade): upgrade is typeof upgrade & { from: Player; to: Player } => !!upgrade.from && !!upgrade.to);
  const guide = squad.guideSlug ? getGuide(squad.guideSlug) : undefined;
  const more = squads.filter((other) => other.slug !== squad.slug).slice(0, 4);

  const tactics = [
    { label: "Defensive style", value: squad.defensiveStyle },
    { label: "Width", value: String(squad.width) },
    { label: "Depth", value: String(squad.depth) },
    { label: "Build-up", value: squad.buildUp },
    { label: "Chance creation", value: squad.chanceCreation },
  ];

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]" />

      <SquadsHeader>
        <BudgetTabs squads={squads} active={squad.slug} />
      </SquadsHeader>

      <div className="page-container relative pb-6">
        <nav aria-label="Breadcrumb">
          <ol className="tabular flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <li>
              <Link href="/squads" className="hover:text-white">
                Squads
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="text-white/80">
              {squad.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* Summary · pitch · selected player */}
      <section aria-labelledby="squad-heading" className="page-container relative grid grid-cols-1 gap-6 pb-10 lg:grid-cols-12">
        <div className="order-last flex min-w-0 flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 lg:order-none lg:col-span-3">
          <div>
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">{squad.tier}</Badge>
              <Badge tone="neutral">{squad.formation}</Badge>
            </p>
            <h2 id="squad-heading" className="mt-3 font-display text-2xl leading-tight font-extrabold uppercase">
              {squad.name}
            </h2>
            {squad.record && <p className="tabular mt-1 text-xs text-mint">{squad.record}</p>}
          </div>

          {author && (
            <Link href={`/creators/${author.slug}`} className="flex items-center gap-3 rounded-xl bg-surface-container p-3 hover:bg-surface-high">
              <Avatar initials={author.initials} tone="mint" />
              <span className="flex flex-col">
                <span className="text-sm font-bold">Built by {author.name}</span>
                <span className="text-[11px] text-muted">{author.role}</span>
              </span>
            </Link>
          )}

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container p-3">
              <dt className="text-label text-muted">Squad rating</dt>
              <dd className="font-display text-3xl font-extrabold">{rating}</dd>
            </div>
            <div className="rounded-xl bg-surface-container p-3">
              <dt className="text-label text-muted">Chemistry</dt>
              <dd className="font-display text-3xl font-extrabold text-mint">
                {squad.chemistry}
                <span className="text-base text-muted">/33</span>
              </dd>
            </div>
            <div className="col-span-2 rounded-xl bg-surface-container p-3">
              <dt className="text-label text-muted">Total cost</dt>
              <dd className="mt-1 flex flex-col gap-1">
                <CoinPrice value={costs.total} className="text-xl" />
                <span className="tabular text-[11px] text-muted">
                  XI ≈ {Math.round(costs.xi / 100) / 10}K · Bench ≈ {Math.round(costs.bench / 100) / 10}K
                </span>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-label mb-2 text-muted">League & nation links</h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              {links.leagues.slice(0, 3).map((league) => (
                <li key={league.name} className="flex justify-between gap-3">
                  <span>{league.name}</span>
                  <span className="tabular text-xs text-muted">{league.players} players</span>
                </li>
              ))}
            </ul>
            <p className="tabular mt-2 text-[11px] text-muted">
              {links.nations
                .slice(0, 3)
                .map((nation) => `${nation.name} ${nation.players}`)
                .join(" · ")}
            </p>
          </div>

          {squad.tacticCode && (
            <div className="flex flex-col gap-2">
              <h3 className="text-label text-muted">Custom tactic code</h3>
              <CopyCode code={squad.tacticCode} />
            </div>
          )}

          {guide && (
            <Link
              href={`/guides/${guide.slug}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 p-3 text-sm transition-colors hover:border-primary/40"
            >
              <PlayCircle aria-hidden className="size-4 shrink-0 text-primary" />
              <span className="flex-1">Watch the breakdown</span>
              {guide.access === "plus" && <Lock aria-hidden className="size-3.5 text-gold" />}
              <span className="sr-only">{guide.access === "plus" ? "(FC Lads+ members)" : ""}</span>
            </Link>
          )}
        </div>

        <SquadPitch slots={slots} formation={squad.formation} initial={initial} />
      </section>

      {/* Bench */}
      {bench.length > 0 && (
        <section aria-labelledby="bench-heading" className="page-container pb-12">
          <div className="rounded-2xl border border-white/8 bg-[#0f141b] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="bench-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
                <Repeat aria-hidden className="size-5 text-primary" />
                Bench ({bench.length})
              </h2>
              <p className="tabular flex items-center gap-2 text-[11px] text-muted uppercase">
                Bench value <CoinPrice value={costs.bench} compact />
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
              {bench.map(({ player, role }) => (
                <li key={player.slug}>
                  <Link
                    href={`/players/${player.slug}`}
                    className="flex h-full items-center gap-3 rounded-xl border border-white/8 bg-surface p-3 transition-colors hover:border-primary/40"
                  >
                    <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-highest leading-none">
                      <span className="font-display font-extrabold text-mint">{player.ovr}</span>
                      <span className="tabular text-[9px] text-muted">{player.position}</span>
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold">{player.cardName ?? player.name}</span>
                      <span className="tabular text-[10px] text-primary uppercase">{role}</span>
                      {player.price !== undefined && <CoinPrice value={player.price} compact className="text-[11px]" />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Why it works + upgrades */}
      <div className="page-container grid grid-cols-1 gap-6 pb-14 lg:grid-cols-2">
        {squad.reasons.length > 0 && (
          <section aria-labelledby="why-heading" className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-6">
            <h2 id="why-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
              <Lightbulb aria-hidden className="size-5 text-primary" />
              Why this squad works
            </h2>
            <ol className="flex flex-col gap-4">
              {squad.reasons.map((reason, index) => (
                <li key={reason.title} className="flex gap-3">
                  <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-mint">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold">{reason.title}</h3>
                    <p className="mt-1 text-sm text-muted">{reason.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-white/8 pt-4">
              <h3 className="text-label mb-3 text-muted">Custom tactics</h3>
              <dl className="flex flex-wrap gap-2">
                {tactics.map((tactic) => (
                  <div key={tactic.label} className="tabular flex gap-1.5 rounded-md border border-white/8 bg-surface px-2.5 py-1.5 text-xs">
                    <dt className="text-muted">{tactic.label}:</dt>
                    <dd className="font-bold text-mint">{tactic.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {upgrades.length > 0 && (
          <section aria-labelledby="upgrade-heading" className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-6">
            <div>
              <h2 id="upgrade-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
                <TrendingUp aria-hidden className="size-5 text-primary" />
                Upgrade path
              </h2>
              <p className="mt-1 text-sm text-muted">Got more coins? Upgrade these positions first.</p>
            </div>
            <ol className="flex flex-col gap-4">
              {upgrades.map(({ from, to, gain }) => (
                <li key={from.slug} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="tabular text-[10px] text-muted uppercase">Swap</span>
                    <Link href={`/players/${from.slug}`} className="font-semibold hover:text-mint">
                      {from.name}
                    </Link>
                    <span className="tabular text-xs text-muted">
                      ({from.ovr} {from.position})
                    </span>
                    <ArrowRight aria-label="for" className="size-4 text-primary" />
                  </div>
                  <Link
                    href={`/players/${to.slug}`}
                    className="flex items-center gap-3 rounded-lg bg-pitch-green/50 p-3 transition-colors hover:bg-pitch-green"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-extrabold text-on-primary">
                      {to.ovr}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{to.name}</span>
                      <span className="tabular text-[11px] text-muted">{to.position}</span>
                    </span>
                    {to.price !== undefined && <CoinPrice value={to.price} compact className="text-sm" />}
                  </Link>
                  <p className="text-sm text-muted">{gain}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="border-t border-white/6 bg-surface py-14">
          <div className="page-container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="more-heading" className="font-display text-xl font-extrabold uppercase md:text-2xl">
                More squads
              </h2>
              <Link href="/squads" className="text-label flex items-center gap-1.5 text-primary hover:text-white">
                All {squads.length} squads
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {more.map((other) => (
                <SquadTile key={other.slug} squad={other} authorName={getCreator(other.authorSlug)?.name} rating={squadRating(other)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
