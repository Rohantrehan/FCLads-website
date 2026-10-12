import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Info, Zap } from "lucide-react";
import { MemberBrief } from "@/components/trading/MemberBrief";
import { TaxCalculator } from "@/components/trading/TaxCalculator";
import { LockedBrief, WatchRow } from "@/components/trading/TradingBits";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { freeMarketNote, watchList, weeklyCycle } from "@/data/trading";
import { currentBrief } from "@/data/tradingBrief";
import { cn } from "@/lib/cn";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Trading: follow the FC market",
  description:
    "A free weekly market note, a transfer tax calculator and how the market moves each week. FC Lads+ members get the full weekly trading brief.",
  alternates: { canonical: "/trading" },
};

const briefSections = [
  "What we're watching",
  "Buy and sell targets",
  "Upcoming events",
  "Market trends",
  "Cards to monitor",
];

function Disclaimer() {
  return (
    <p className="page-container flex items-start gap-2 pb-16 text-xs text-muted">
      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      Trading information is for education only. The market can change quickly, and past results don&apos;t guarantee
      future ones.{" "}
      <Link href="/legal/trading-disclaimer" className="underline hover:text-white">
        Read the trading disclaimer
      </Link>
    </p>
  );
}

export default async function TradingPage() {
  const viewer = await getViewer();
  const isMember = viewer.isMember;
  const noteAuthor = getCreator(freeMarketNote.authorSlug);

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
          {/* Free weekly note + watch list */}
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
                {watchList.map((item) => (
                  <WatchRow key={item.card} card={item.card} note={item.note} />
                ))}
              </div>
            </div>
          </section>

          {/* Free tools: tax calculator + the weekly market cycle */}
          <div className="page-container grid grid-cols-1 gap-6 pb-14 lg:grid-cols-3">
            <TaxCalculator />
            <section
              aria-labelledby="cycle-heading"
              className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 lg:col-span-2"
            >
              <div>
                <h2 id="cycle-heading" className="font-display font-extrabold uppercase">
                  How the market moves each week
                </h2>
                <p className="mt-1 text-sm text-muted">The same pattern repeats most weeks. Buy low, sell high.</p>
              </div>
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {weeklyCycle.map((step) => (
                  <li key={step.day} className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-surface p-3">
                    <span className="font-display font-extrabold text-mint uppercase">{step.day}</span>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="text-xs text-muted">{step.text}</p>
                  </li>
                ))}
              </ol>
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
