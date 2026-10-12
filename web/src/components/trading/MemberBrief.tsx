import { Clock, MessagesSquare, Unlock } from "lucide-react";
import { TaxCalculator } from "@/components/trading/TaxCalculator";
import { BriefSection, ConfidenceBadge, TrendTag, WatchRow } from "@/components/trading/TradingBits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { currentBrief, pastBriefs } from "@/data/tradingBrief";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { socialLinks } from "@/lib/site";

// Server component. Imports the server-only brief, so only render it after checking the viewer is a member.

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00Z`));

/** The full weekly brief. Only rendered for FC Lads+ members (decided on the server). */
export function MemberBrief() {
  const brief = currentBrief;
  const author = getCreator(brief.authorSlug);

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
              {brief.opportunities.map(({ card, confidence, play, buyBelow, sellAt, reason }) => (
                <li key={card} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4">
                  <p className="flex flex-wrap items-center gap-2">
                    <ConfidenceBadge level={confidence} />
                    <span className="tabular text-[10px] text-muted uppercase">{play}</span>
                  </p>
                  <h3 className="font-semibold">{card}</h3>
                  <dl className="flex flex-col gap-1.5 rounded-lg bg-canvas/60 p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Buy under</dt>
                      <dd className="tabular font-semibold text-gold">{formatNumber(buyBelow)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Sell at</dt>
                      <dd className="tabular font-bold text-primary">{formatNumber(sellAt)}</dd>
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

          <BriefSection id="trends-heading" title="Market trends">
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {brief.trends.map((trend) => (
                <li key={trend.label} className="flex flex-col gap-2 rounded-xl border border-white/8 bg-surface p-4">
                  <TrendTag direction={trend.direction} />
                  <h3 className="font-semibold">{trend.label}</h3>
                  <p className="text-sm text-muted">{trend.text}</p>
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="monitor-heading" title="Cards to monitor">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {brief.monitor.map((item) => (
                <li key={item.card}>
                  <WatchRow card={item.card} note={item.note} />
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
