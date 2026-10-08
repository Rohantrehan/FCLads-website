import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, Eye, Lock, MonitorPlay, Quote, ThumbsUp, TrendingUp, Wrench } from "lucide-react";
import { FormationPitch } from "@/components/cards/SquadCard";
import { VideoFacade } from "@/components/guide/VideoFacade";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { TierBadge } from "@/components/ui/Badge";
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { FEED_NOW, feedTopics } from "@/data/feed";
import { getGuide } from "@/data/guides";
import { getPlayer } from "@/data/players";
import { getSquad } from "@/data/squads";
import { cn } from "@/lib/cn";
import { formatCompact, formatNumber } from "@/lib/format";
import type { FeedItem } from "@/lib/feedAccess";
import { statLabels } from "@/lib/positions";
import { socialLinks } from "@/lib/site";
import { squadCosts, squadRating } from "@/lib/squadStats";

/** "45m ago", "3h ago", "2d ago" relative to the mock FEED_NOW. */
function timeAgo(iso: string) {
  const minutes = Math.max(1, Math.round((new Date(FEED_NOW).getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

/** Shared frame: author row, topic label, body. */
function PostFrame({ post, icon, children }: { post: FeedItem; icon: ReactNode; children: ReactNode }) {
  const author = getCreator(post.authorSlug);
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5",
        post.access === "plus" ? "border-gold/25" : "border-white/8",
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {author && <Avatar initials={author.initials} tone="mint" size="sm" />}
          <div className="min-w-0">
            <p className="truncate text-sm">
              {author ? (
                <Link href={`/creators/${author.slug}`} className="font-bold hover:text-mint">
                  {author.name}
                </Link>
              ) : (
                <span className="font-bold">FC Lads</span>
              )}
              {author?.highlight && (
                <span className="tabular ml-1.5 text-[10px] text-primary">{author.highlight.value}</span>
              )}
            </p>
            <p className="tabular text-[11px] text-muted">
              <time dateTime={post.postedAt}>{timeAgo(post.postedAt)}</time>
            </p>
          </div>
        </div>
        <TierBadge tier={post.access} />
      </header>
      <p className="tabular flex items-center gap-1.5 text-[11px] font-bold text-mint uppercase">
        <span aria-hidden className="text-primary">
          {icon}
        </span>
        {feedTopics[post.topic]}
      </p>
      {children}
    </article>
  );
}

const icon = "size-3.5";

/** Videos and polls take the full width of the feed. */
export const isWidePost = (post: FeedItem) => post.type === "video" || post.type === "poll";

export function FeedPostCard({ post }: { post: FeedItem }) {
  switch (post.type) {
    case "video": {
      const guide = post.guideSlug ? getGuide(post.guideSlug) : undefined;
      return (
        <PostFrame post={post} icon={<MonitorPlay className={icon} />}>
          <VideoFacade
            video={post.youtubeId ? { provider: "youtube", id: post.youtubeId } : undefined}
            title={post.title}
            minutes={post.minutes}
          />
          <div>
            <h2 className="font-display text-xl leading-snug font-extrabold md:text-2xl">{post.title}</h2>
            <p className="mt-2 text-muted">{post.excerpt}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <p className="tabular flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Eye aria-hidden className="size-4" />
                {formatCompact(post.views)} views
              </span>
              <span className="flex items-center gap-1.5">
                <ThumbsUp aria-hidden className="size-4" />
                {post.approval}% liked
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-4">
              {guide && (
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-label flex items-center gap-1.5 text-gold hover:text-white"
                >
                  <Lock aria-hidden className="size-3.5" />
                  Full breakdown (Lads+)
                </Link>
              )}
              <a
                href={socialLinks.youtube}
                className="text-label flex items-center gap-1.5 text-primary hover:text-white"
              >
                Watch on YouTube
                <ArrowRight aria-hidden className="size-3.5" />
              </a>
            </p>
          </div>
        </PostFrame>
      );
    }

    case "player": {
      const player = getPlayer(post.playerSlug);
      if (!player) return null;
      const labels = statLabels(player.position);
      return (
        <PostFrame post={post} icon={<TrendingUp className={icon} />}>
          <div className="flex gap-4">
            <Link
              href={`/players/${player.slug}`}
              className="flex w-24 shrink-0 flex-col items-center gap-1 rounded-xl border border-primary/30 bg-gradient-to-b from-pitch-green to-canvas p-3 text-center transition-colors hover:border-primary"
            >
              <span className="font-display text-3xl leading-none font-extrabold text-mint">{player.ovr}</span>
              <span className="tabular text-[10px] font-bold">{player.position}</span>
              <span className="mt-1 text-xs leading-tight font-bold uppercase">{player.cardName ?? player.name}</span>
            </Link>
            <blockquote className="font-display text-base leading-snug font-bold">
              &ldquo;{post.quote}&rdquo;
            </blockquote>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-white/8 rounded-lg bg-canvas/60 py-2 text-center">
            {(["pac", "sho", "dri"] as const).map((key) => (
              <div key={key} className="flex flex-col-reverse">
                <dt className="tabular text-[10px] text-muted">{labels[key]}</dt>
                <dd className="tabular text-sm font-bold">{player.stats[key]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-3">
            {player.price !== undefined && <CoinPrice value={player.price} compact />}
            <Link
              href={`/players/${player.slug}`}
              className="text-label flex items-center gap-1.5 text-primary hover:text-white"
            >
              Player page
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </PostFrame>
      );
    }

    case "update":
      return (
        <PostFrame post={post} icon={<Wrench className={icon} />}>
          <h2 className="font-display text-lg leading-snug font-extrabold">{post.title}</h2>
          <ul className="flex flex-col gap-2.5">
            {post.points.map((point) => (
              <li key={point} className="flex gap-2.5 text-sm text-muted">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </PostFrame>
      );

    case "trading":
      return (
        <PostFrame post={post} icon={<TrendingUp className={icon} />}>
          <h2 className="font-display text-lg leading-snug font-extrabold">{post.title}</h2>
          <ul className="flex flex-col gap-2">
            {post.targets.map((target) => {
              const player = getPlayer(target.playerSlug);
              if (!player) return null;
              return (
                <li key={target.playerSlug}>
                  <Link
                    href={`/players/${player.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-surface p-2.5 transition-colors hover:border-primary/40"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded bg-surface-highest font-display text-sm font-extrabold text-mint">
                      {player.ovr}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{player.name}</span>
                    <span className="tabular text-[11px] text-muted">
                      Buy under <span className="font-bold text-gold">{formatNumber(target.buyBelow)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {(post.lockedCount ?? 0) > 0 && (
              <li className="flex items-center gap-3 rounded-lg border border-dashed border-gold/30 p-2.5 text-sm text-gold">
                <Lock aria-hidden className="size-4" />
                {post.lockedCount} more {post.lockedCount === 1 ? "target" : "targets"} for FC Lads+ members
              </li>
            )}
          </ul>
          {(post.lockedCount ?? 0) > 0 && (
            <Link href={JOIN_HREF} className="text-label mt-auto flex items-center gap-1.5 text-gold hover:text-white">
              Unlock all targets and sell prices
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          )}
        </PostFrame>
      );

    case "squad": {
      const squad = getSquad(post.squadSlug);
      if (!squad) return null;
      return (
        <PostFrame post={post} icon={<BarChart3 className={icon} />}>
          <h2 className="font-display text-lg leading-snug font-extrabold">
            <Link href={`/squads/${squad.slug}`} className="hover:text-mint">
              {squad.name}
            </Link>
          </h2>
          {squad.record && <p className="tabular -mt-2 text-xs text-mint">{squad.record}</p>}
          <FormationPitch formation={squad.formation} />
          <p className="tabular flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
            <span>{squad.formation}</span>
            <span>Rating {squadRating(squad)}</span>
            <span>{squad.chemistry}/33 chem</span>
            <CoinPrice value={squadCosts(squad).total} compact />
          </p>
          <Link
            href={`/squads/${squad.slug}`}
            className="text-label mt-auto flex items-center gap-1.5 text-primary hover:text-white"
          >
            Open the squad
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </PostFrame>
      );
    }

    case "tip":
      return (
        <PostFrame post={post} icon={<Quote className={icon} />}>
          <blockquote className="font-display text-lg leading-snug font-bold italic">
            &ldquo;{post.text}&rdquo;
          </blockquote>
          <p className="tabular mt-auto text-[11px] text-primary uppercase">{post.label}</p>
        </PostFrame>
      );

    case "poll": {
      const total = post.options.reduce((sum, option) => sum + option.votes, 0);
      const top = Math.max(...post.options.map((option) => option.votes));
      return (
        <PostFrame post={post} icon={<BarChart3 className={icon} />}>
          <h2 className="font-display text-lg leading-snug font-extrabold md:text-xl">{post.question}</h2>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
            {post.options.map((option) => {
              const share = total ? Math.round((option.votes / total) * 100) : 0;
              return (
                <li key={option.label} className="flex flex-col gap-1.5">
                  <span className="flex justify-between gap-3 text-sm">
                    <span className={option.votes === top ? "font-bold" : undefined}>{option.label}</span>
                    <span className="tabular font-bold text-mint">{share}%</span>
                  </span>
                  <span
                    role="meter"
                    aria-label={option.label}
                    aria-valuenow={share}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 overflow-hidden rounded-full bg-canvas"
                  >
                    <span
                      className={cn("block h-full rounded-full", option.votes === top ? "bg-primary" : "bg-white/25")}
                      style={{ width: `${share}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="tabular text-[11px] text-muted">
            {formatNumber(total)} votes · Voting opens to everyone when accounts are switched on.
          </p>
        </PostFrame>
      );
    }
  }
}
