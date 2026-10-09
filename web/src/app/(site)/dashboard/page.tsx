import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  Crosshair,
  FileText,
  Lock,
  MessagesSquare,
  Newspaper,
  Play,
  Video,
  Zap,
} from "lucide-react";
import { DashboardHeading, DashPanel, MembersOnly, PanelLink, ProgressBar } from "@/components/dashboard/DashboardBits";
import { FormationPitch } from "@/components/cards/SquadCard";
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { Button } from "@/components/ui/Button";
import { getCreator } from "@/data/creators";
import { getFeaturedGuide, getGuide } from "@/data/guides";
import {
  comingNext,
  continueWatching,
  currentReview,
  discordHighlight,
  reviewSteps,
  weekInFc,
} from "@/data/memberDashboard";
import { getPlayer } from "@/data/players";
import { getSquad } from "@/data/squads";
import { currentBrief } from "@/data/tradingBrief";
import { cn } from "@/lib/cn";
import { categoryLabels, formatNumber } from "@/lib/format";
import { socialLinks } from "@/lib/site";
import { getViewer } from "@/lib/viewer";
import type { Guide } from "@/types";

// The layout's title template only applies to child pages, so this page sets its full title.
export const metadata: Metadata = { title: { absolute: "My Feed · My Lads+ | FC Lads" } };

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDay = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`));

/** Card in the "New from the Lads" row. The whole card is one link. */
function DropCard({
  kicker,
  title,
  href,
  authorSlug,
  external,
  highlight,
  children,
}: {
  kicker: string;
  title: string;
  href: string;
  authorSlug?: string;
  external?: boolean;
  highlight?: boolean;
  children?: ReactNode;
}) {
  const author = authorSlug ? getCreator(authorSlug) : undefined;
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5 transition-colors hover:border-primary/50",
        highlight ? "border-primary/40 shadow-[0_0_32px_rgb(43_217_139/0.08)]" : "border-white/8",
      )}
    >
      <p className="text-label text-mint">{kicker}</p>
      <h3 className="font-display text-lg leading-tight font-extrabold uppercase transition-colors group-hover:text-primary">
        <a
          href={href}
          className="after:absolute after:inset-0"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {title}
        </a>
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

const weekIcons = { patch: Zap, shooting: Crosshair, rules: CalendarClock };

export default async function MyFeedPage() {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  const guide = getFeaturedGuide();
  const target = currentBrief.opportunities[0];
  const targetPlayer = target && getPlayer(target.playerSlug);
  const squad = getSquad("100k-hybrid");
  const watching = continueWatching
    .map((item) => ({ ...item, guide: getGuide(item.guideSlug) }))
    .filter((item): item is typeof item & { guide: Guide } => !!item.guide);
  const stepIndex = reviewSteps.findIndex((step) => step.key === currentReview.step);
  const reviewer = getCreator("stefan");

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

      <section aria-labelledby="drops-heading" className="flex flex-col gap-4">
        <h2 id="drops-heading" className="font-display text-lg font-extrabold uppercase">
          New from the Lads
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {guide && (
            <DropCard
              kicker={`New ${guide.format === "video" ? "video" : "guide"} · ${categoryLabels[guide.category]}`}
              title={guide.title}
              href={`/guides/${guide.slug}`}
              authorSlug={guide.authorSlug}
              highlight
            >
              <p className="line-clamp-3 text-sm text-muted">{guide.excerpt}</p>
            </DropCard>
          )}

          <DropCard
            kicker={`Trading brief · week ${currentBrief.week}`}
            title={currentBrief.watching[0]?.title ?? "This week's market"}
            href="/dashboard/trading"
            authorSlug={currentBrief.authorSlug}
          >
            {targetPlayer && (
              <dl className="flex flex-col gap-1.5 rounded-lg bg-canvas/60 p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Buy</dt>
                  <dd className="font-semibold">{targetPlayer.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Now</dt>
                  <dd>{targetPlayer.price !== undefined && <CoinPrice value={targetPlayer.price} />}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Sell at</dt>
                  <dd className="tabular font-bold text-primary">{formatNumber(target.targetOut)}</dd>
                </div>
              </dl>
            )}
          </DropCard>

          {squad && (
            <DropCard
              kicker={`New squad · ${squad.budgetLabel}`}
              title={squad.name}
              href={`/squads/${squad.slug}`}
              authorSlug={squad.authorSlug}
            >
              <FormationPitch formation={squad.formation} />
              <p className="tabular mt-2 flex justify-between text-[11px] text-muted uppercase">
                <span>{squad.formation}</span>
                <span>{squad.chemistry}/33 chem</span>
              </p>
            </DropCard>
          )}

          <DropCard
            kicker={`Discord · #${discordHighlight.channel}`}
            title={discordHighlight.title}
            href={socialLinks.discord}
            authorSlug={discordHighlight.authorSlug}
            external
          >
            <blockquote className="border-l-2 border-primary pl-3 text-sm text-muted">
              &ldquo;{discordHighlight.quote}&rdquo;
            </blockquote>
          </DropCard>

          <article className="flex flex-col gap-4 rounded-2xl border border-dashed border-white/12 p-5 text-muted">
            <p className="text-label">Coming {comingNext.day}</p>
            <h3 className="font-display text-lg leading-tight font-extrabold text-white/70 uppercase">
              {comingNext.title}
            </h3>
            <span className="mt-auto flex items-center gap-2 text-xs">
              <Lock aria-hidden className="size-3.5" />
              Unlocks when it&apos;s published
            </span>
          </article>
        </div>
      </section>

      <DashPanel
        id="continue-heading"
        title="Continue watching"
        icon={<Play aria-hidden className="size-5 text-primary" />}
        action={<PanelLink href="/dashboard/gameplay">Video library</PanelLink>}
      >
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {watching.map(({ guide: item, watched }) => {
            const author = getCreator(item.authorSlug);
            const share = Math.round((watched / item.minutes) * 100);
            return (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-white/8 bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-label text-mint">{author?.name}</span>
                    <span className="tabular text-[11px] text-muted">{item.minutes} min</span>
                  </span>
                  <span className="font-display leading-tight font-extrabold uppercase group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="mt-auto flex flex-col gap-1.5">
                    <ProgressBar value={share} label={`${item.title}: ${share}% watched`} />
                    <span className="tabular flex justify-between text-[11px] text-muted">
                      <span>Watched {watched} min</span>
                      <span className="text-mint">{share}%</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </DashPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashPanel
          id="week-heading"
          title="This week in FC"
          icon={<Newspaper aria-hidden className="size-5 text-primary" />}
        >
          <ul className="flex flex-col gap-3">
            {weekInFc.map((item) => {
              const Icon = weekIcons[item.kind];
              return (
                <li key={item.label} className="flex gap-3 rounded-xl border border-white/8 bg-surface p-4">
                  <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                  <span>
                    <span className="text-label block text-gold">{item.label}</span>
                    <span className="mt-1 block text-sm">{item.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </DashPanel>

        <DashPanel
          id="next-review-heading"
          title="Your next review"
          icon={<Video aria-hidden className="size-5 text-primary" />}
          action={
            <span className="tabular rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold uppercase">
              Book before {fmtDay(currentReview.deadline)}
            </span>
          }
          className="border-primary/25"
        >
          <div className="flex flex-col gap-2">
            <p className="tabular flex justify-between text-xs text-muted">
              <span>{currentReview.month} review</span>
              <span className="text-mint">
                {stepIndex} / {reviewSteps.length} steps done
              </span>
            </p>
            <ol className="grid grid-cols-3 gap-2">
              {reviewSteps.map((step, index) => (
                <li key={step.key} className="flex flex-col gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 rounded-full",
                      index < stepIndex ? "bg-primary" : index === stepIndex ? "bg-primary/40" : "bg-surface-highest",
                    )}
                  />
                  <span className={cn("text-[11px]", index <= stepIndex ? "text-on-surface" : "text-muted")}>
                    {step.title}
                    <span className="sr-only">
                      {index < stepIndex ? " (done)" : index === stepIndex ? " (next)" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {currentReview.upload && (
            <p className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4 text-sm">
              <FileText aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold">{currentReview.upload.fileName} uploaded</span>
                <span className="text-muted">Next: pick a Lad and a time for your session.</span>
              </span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/dashboard/review" variant="primary">
              Book your session
              <ArrowRight aria-hidden className="size-4" />
            </Button>
            {reviewer && (
              <span className="text-xs text-muted">
                Last review with {reviewer.name}. You can pick anyone this month.
              </span>
            )}
          </div>
        </DashPanel>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <MessagesSquare aria-hidden className="size-3.5" />
        Something missing? Ask the Lads in{" "}
        <a href={socialLinks.discord} className="text-primary hover:text-white">
          #ask-the-lads
        </a>
      </p>
    </div>
  );
}
