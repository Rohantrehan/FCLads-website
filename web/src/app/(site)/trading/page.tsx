import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, Info, MessagesSquare, Unlock, Zap } from "lucide-react";
import { PriceChart } from "@/components/players/PriceChart";
import { TaxCalculator } from "@/components/trading/TaxCalculator";
import { BriefSection, ConfidenceBadge, LockedBrief, MoverRow } from "@/components/trading/TradingBits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { getPlayer, players } from "@/data/players";
import { featuredMovers, freeMarketNote } from "@/data/trading";
import { currentBrief, pastBriefs } from "@/data/tradingBrief";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { socialLinks } from "@/lib/site";
import { getViewer } from "@/lib/viewer";
import type { Player } from "@/types";

export const metadata: Metadata = {
  title: "Trading: follow the FC market",
  description:
    "A free weekly market note, a transfer tax calculator and the players moving this week. FC Lads+ members get the full weekly trading brief.",
  alternates: { canonical: "/trading" },
};

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00Z`));

const briefSections = [
  "What we're watching",
  "Buy and sell targets",
  "Upcoming events",
  "Market trends",
  "Players to monitor",
];

const resolve = (slugs: string[]) => slugs.map(getPlayer).filter((player): player is Player => !!player);

function Disclaimer() {
  return (
    <p className="page-container flex items-start gap-2 pb-16 text-xs text-muted">
      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      Trading information is for education only. The market can change quickly, and past results don&apos;t guarantee
      future ones.
    </p>
  );
}

export default async function TradingPage() {
  const viewer = await getViewer();
  const isMember = viewer.isMember;
  const noteAuthor = getCreator(freeMarketNote.authorSlug);
  const movers = resolve(featuredMovers);
  const priced = players.filter((player) => player.trend !== undefined && player.price !== undefined);
  const risers = [...priced].sort((a, b) => (b.trend ?? 0) - (a.trend ?? 0)).slice(0, 3);
  const fallers = [...priced].sort((a, b) => (a.trend ?? 0) - (b.trend ?? 0)).slice(0, 3);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]"
      />

      <header className="page-container relative flex flex-col gap-6 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
        <div className="flex flex-col gap-3">
          <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            Market desk {"//"} week {currentBrief.week}
          </p>
          <h1 className="text-hero">Trading</h1>
          <p className="text-lg font-semibold text-primary">Follow the market without living on it.</p>
        </div>
        <p className="glass flex items-center gap-3 self-start rounded-xl px-4 py-3 lg:self-auto">
          <CalendarDays aria-hidden className="size-4 text-primary" />
          <span className="tabular text-xs font-bold uppercase">New brief every Monday</span>
        </p>
      </header>

      {isMember ? (
        <MemberBrief />
      ) : (
        <>
          {/* Free weekly note + featured movers */}
          <section aria-labelledby="free-note-heading" className="page-container relative pb-10">
            <div className="grid grid-cols-1 gap-6 rounded-2xl border border-primary/25 bg-[#0f141b] p-5 md:p-7 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-8">
                <p className="flex flex-wrap items-center gap-2">
                  <Badge tone="mint">
                    <Zap aria-hidden className="size-3" />
                    Free market note
                  </Badge>
                  <span className="tabular text-[11px] text-muted uppercase">Week {currentBrief.week}</span>
                </p>
                {noteAuthor && (
                  <Link
                    href={`/creators/${noteAuthor.slug}`}
                    className="flex items-center gap-3 self-start hover:text-mint"
                  >
                    <Avatar initials={noteAuthor.initials} tone="mint" />
                    <span className="flex flex-col">
                      <span className="text-sm font-bold">{noteAuthor.name}</span>
                      <span className="text-[11px] text-muted">{noteAuthor.role}</span>
                    </span>
                  </Link>
                )}
                <h2 id="free-note-heading" className="font-display text-2xl leading-snug font-extrabold md:text-3xl">
                  &ldquo;{freeMarketNote.headline}&rdquo;
                </h2>
                <p className="leading-relaxed text-muted">{freeMarketNote.body}</p>
                <dl className="flex flex-wrap gap-2">
                  {[
                    { label: "Action", value: freeMarketNote.action, tone: "text-danger-soft" },
                    { label: "Risk", value: freeMarketNote.risk, tone: "text-mint" },
                    { label: "Window", value: freeMarketNote.window, tone: "text-white" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="tabular flex gap-1.5 rounded-md border border-white/8 bg-surface px-3 py-1.5 text-xs uppercase"
                    >
                      <dt className="text-muted">{item.label}:</dt>
                      <dd className={cn("font-bold", item.tone)}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4">
                <h3 className="text-label text-muted">Cards to watch this week</h3>
                {movers.map((player) => (
                  <MoverRow key={player.slug} player={player} />
                ))}
              </div>
            </div>
          </section>

          {/* Free tools: tax calculator + movers */}
          <div className="page-container grid grid-cols-1 gap-6 pb-14 lg:grid-cols-3">
            <TaxCalculator />
            <section
              aria-labelledby="risers-heading"
              className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
            >
              <h2 id="risers-heading" className="font-display font-extrabold uppercase">
                Rising this week
              </h2>
              {risers.map((player) => (
                <MoverRow key={player.slug} player={player} />
              ))}
            </section>
            <section
              aria-labelledby="fallers-heading"
              className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
            >
              <h2 id="fallers-heading" className="font-display font-extrabold uppercase">
                Falling this week
              </h2>
              {fallers.map((player) => (
                <MoverRow key={player.slug} player={player} />
              ))}
            </section>
          </div>

          <div className="page-container pb-12">
            <LockedBrief week={currentBrief.week} sections={briefSections} />
          </div>
        </>
      )}

      <Disclaimer />
    </div>
  );
}

/** The full weekly brief. Only rendered for FC Lads+ members (decided on the server). */
function MemberBrief() {
  const brief = currentBrief;
  const author = getCreator(brief.authorSlug);
  const opportunities = brief.opportunities
    .map((opportunity) => ({ ...opportunity, player: getPlayer(opportunity.playerSlug) }))
    .filter((opportunity): opportunity is typeof opportunity & { player: Player } => !!opportunity.player);
  const monitor = resolve(brief.monitor);
  const indexNow = brief.index.at(-1)?.value ?? 0;
  const indexPrev = brief.index.at(-2)?.value ?? indexNow;
  const notes = Object.fromEntries(brief.indexNotes.map((note) => [note.date, note.label]));

  return (
    <>
      <div className="page-container relative pb-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone="mint">
                <Unlock aria-hidden className="size-3" />
                FC Lads+ brief
              </Badge>
              <span className="tabular text-[11px] text-muted uppercase">
                {fmt(brief.from)} – {fmt(brief.to)}
              </span>
            </p>
            <h2 className="font-display text-2xl font-extrabold uppercase">Weekly trading brief: week {brief.week}</h2>
          </div>
          {author && (
            <p className="flex items-center gap-3">
              <Avatar initials={author.initials} tone="mint" />
              <span className="flex flex-col">
                <span className="text-sm font-bold">{author.name}</span>
                <span className="tabular flex items-center gap-1 text-[11px] text-muted">
                  <Clock aria-hidden className="size-3" />
                  {brief.readMinutes} min read
                </span>
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="page-container grid grid-cols-1 gap-6 pb-12 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <BriefSection id="watching-heading" title="What we're watching">
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {brief.watching.map((item, index) => (
                <li key={item.title} className="flex flex-col gap-2 rounded-xl border border-white/8 bg-surface p-4">
                  <span className="tabular text-[11px] text-mint">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.text}</p>
                </li>
              ))}
            </ol>
          </BriefSection>

          <BriefSection id="opportunities-heading" title="Buy and sell targets">
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {opportunities.map(({ player, confidence, play, targetOut, reason }) => (
                <li key={player.slug} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4">
                  <p className="flex flex-wrap items-center gap-2">
                    <ConfidenceBadge level={confidence} />
                    <span className="tabular text-[10px] text-muted uppercase">{play}</span>
                  </p>
                  <Link href={`/players/${player.slug}`} className="flex items-center gap-3 hover:text-mint">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-highest font-display font-extrabold text-mint">
                      {player.ovr}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold">{player.name}</span>
                      <span className="tabular text-[11px] text-muted">
                        {player.position} · {player.league}
                      </span>
                    </span>
                  </Link>
                  <dl className="flex flex-col gap-1.5 rounded-lg bg-canvas/60 p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Now</dt>
                      <dd>{player.price !== undefined && <CoinPrice value={player.price} />}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Sell at</dt>
                      <dd className="tabular font-bold text-primary">{formatNumber(targetOut)}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-muted">{reason}</p>
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="events-heading" title="Upcoming events" aside="This week">
            <ol className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {brief.events.map((event) => (
                <li
                  key={event.day}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border p-3",
                    event.highlight ? "border-primary/60 bg-pitch-green/50" : "border-white/8 bg-surface",
                  )}
                >
                  <p className="flex items-center justify-between gap-2">
                    <span className="font-display font-extrabold text-mint uppercase">{event.day}</span>
                    {event.tag && <span className="tabular text-[9px] text-muted uppercase">{event.tag}</span>}
                  </p>
                  <h3 className="text-sm font-semibold">{event.title}</h3>
                  <p className="text-xs text-muted">{event.text}</p>
                </li>
              ))}
            </ol>
          </BriefSection>

          <BriefSection
            id="trends-heading"
            title="Market trends"
            aside={`Index ${indexNow.toFixed(1)} (${indexNow >= indexPrev ? "+" : ""}${(indexNow - indexPrev).toFixed(1)} today)`}
          >
            <p className="-mt-2 text-sm text-muted">
              The FC Lads market index: the average price of the cards we track, last 14 days.
            </p>
            <PriceChart
              points={brief.index.map((point) => ({ date: point.date, price: point.value }))}
              ranges={[14]}
              unit="index"
              notes={notes}
            />
          </BriefSection>

          <BriefSection id="monitor-heading" title="Players to monitor">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {monitor.map((player) => (
                <li key={player.slug}>
                  <MoverRow player={player} />
                </li>
              ))}
            </ul>
          </BriefSection>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-gradient-to-b from-pitch-green/60 to-[#0f141b] p-5">
            <h2 className="flex items-center gap-2 font-display font-extrabold uppercase">
              <MessagesSquare aria-hidden className="size-5 text-primary" />
              Trading lounge
            </h2>
            <p className="text-sm text-muted">
              Live price alerts and quick questions to the analysts, in the members&apos; Discord.
            </p>
            <Button href={socialLinks.discord} variant="primary" size="sm" className="w-full">
              Open the trading Discord
            </Button>
          </div>
          <TaxCalculator />
          <section
            aria-labelledby="past-heading"
            className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
          >
            <h2 id="past-heading" className="font-display font-extrabold uppercase">
              Past briefs
            </h2>
            <ul className="flex flex-col gap-3">
              {pastBriefs.map((past) => (
                <li key={past.week} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="tabular flex justify-between text-[11px] text-mint uppercase">
                    <span>Week {past.week}</span>
                    <span className="text-muted">
                      {fmt(past.from)} – {fmt(past.to)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm font-semibold">{past.title}</p>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted">The full archive opens with accounts.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
