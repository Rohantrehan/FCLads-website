import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Lock, Star } from "lucide-react";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";
import { statLabels, statNames } from "@/lib/positions";
import type { ChemistryStyle, Creator, DetailedAttributes, FaceStats, Player, PlayerReview, Position } from "@/types";

const barTone = (value: number) =>
  value >= 85 ? "bg-primary" : value >= 70 ? "bg-mint/60" : value >= 50 ? "bg-gold" : "bg-danger";

/** Labelled bar used for face stats and detailed attributes. */
export function AttributeBar({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-32 shrink-0 text-sm", strong ? "font-bold uppercase" : "text-white/80")}>{label}</span>
      <span
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={99}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas"
      >
        <span
          className={cn("block h-full rounded-full", barTone(value))}
          style={{ width: `${Math.min(value, 99) / 0.99}%` }}
        />
      </span>
      <span className={cn("tabular w-7 text-right text-sm font-bold", value >= 85 ? "text-mint" : "text-white/70")}>
        {value}
      </span>
    </div>
  );
}

export function FaceStatBars({ stats, position }: { stats: FaceStats; position: Position }) {
  const names = statNames(position);
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
      {(Object.keys(names) as (keyof FaceStats)[]).map((key) => (
        <AttributeBar key={key} label={names[key]} value={stats[key]} strong />
      ))}
    </div>
  );
}

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${label}: ${value} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn("size-3.5", index < value ? "fill-mint text-mint" : "text-white/20")}
        />
      ))}
      <span aria-hidden className="tabular ml-1 text-xs text-muted">
        {value}★
      </span>
    </span>
  );
}

/** Weak foot, skill moves, height, foot, body type, AcceleRATE: only the ones we know. */
export function PlayerFacts({ player }: { player: Player }) {
  const facts = [
    player.weakFoot && {
      label: "Weak foot",
      value: <Stars value={player.weakFoot} label="Weak foot" />,
    },
    player.skillMoves && {
      label: "Skill moves",
      value: <Stars value={player.skillMoves} label="Skill moves" />,
    },
    player.height && { label: "Height", value: player.height },
    player.preferredFoot && {
      label: "Preferred foot",
      value: player.preferredFoot,
    },
    player.bodyType && { label: "Body type", value: player.bodyType },
    player.acceleRate && { label: "AcceleRATE", value: player.acceleRate },
  ].filter(Boolean) as { label: string; value: ReactNode }[];
  if (facts.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/8 pt-5 sm:grid-cols-3">
      {facts.map((fact) => (
        <li key={fact.label} className="flex flex-col gap-1">
          <span className="text-label text-muted">{fact.label}</span>
          <span className="text-sm font-semibold">{fact.value}</span>
        </li>
      ))}
    </ul>
  );
}

const attributeGroups: {
  key: keyof DetailedAttributes;
  label: string;
  stat: keyof FaceStats;
  names: Record<string, string>;
}[] = [
  {
    key: "pace",
    label: "Pace",
    stat: "pac",
    names: { acceleration: "Acceleration", sprintSpeed: "Sprint speed" },
  },
  {
    key: "shooting",
    label: "Shooting",
    stat: "sho",
    names: {
      positioning: "Positioning",
      finishing: "Finishing",
      shotPower: "Shot power",
      longShots: "Long shots",
      volleys: "Volleys",
      penalties: "Penalties",
    },
  },
  {
    key: "passing",
    label: "Passing",
    stat: "pas",
    names: {
      vision: "Vision",
      crossing: "Crossing",
      shortPassing: "Short passing",
      longPassing: "Long passing",
    },
  },
  {
    key: "dribbling",
    label: "Dribbling",
    stat: "dri",
    names: {
      agility: "Agility",
      balance: "Balance",
      reactions: "Reactions",
      ballControl: "Ball control",
      dribbling: "Dribbling",
      composure: "Composure",
    },
  },
  {
    key: "defending",
    label: "Defending",
    stat: "def",
    names: {
      interceptions: "Interceptions",
      defAwareness: "Def. awareness",
      standingTackle: "Standing tackle",
      slidingTackle: "Sliding tackle",
    },
  },
  {
    key: "physical",
    label: "Physicality",
    stat: "phy",
    names: {
      jumping: "Jumping",
      stamina: "Stamina",
      strength: "Strength",
      aggression: "Aggression",
    },
  },
];

/** All in-game attributes, grouped under their face stat. */
export function AttributeGroups({ attributes, stats }: { attributes: DetailedAttributes; stats: FaceStats }) {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {attributeGroups.map((group) => (
        <section key={group.key} aria-labelledby={`attr-${group.key}`} className="flex flex-col gap-2.5">
          <h3
            id={`attr-${group.key}`}
            className="tabular flex items-center justify-between text-xs font-bold text-mint uppercase"
          >
            {group.label}
            <span className="rounded bg-primary/10 px-1.5 py-0.5">{stats[group.stat]}</span>
          </h3>
          {Object.entries(attributes[group.key]).map(([name, value]) => (
            <AttributeBar key={name} label={group.names[name] ?? name} value={value} />
          ))}
        </section>
      ))}
    </div>
  );
}

export function PlaystyleChips({ plus = [], regular = [] }: { plus?: string[]; regular?: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {plus.map((name) => (
        <li
          key={name}
          className="tabular rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-on-primary uppercase shadow-[0_0_16px_rgb(43_217_139/0.35)]"
        >
          {name}
        </li>
      ))}
      {regular.map((name) => (
        <li
          key={name}
          className="tabular rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/80 uppercase"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

export function ChemistryCards({ styles }: { styles: ChemistryStyle[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {styles.map((style) => (
        <li
          key={style.name}
          className={cn(
            "flex flex-col gap-3 rounded-2xl p-5",
            style.recommended
              ? "border-2 border-primary/70 bg-gradient-to-b from-pitch-green to-[#0f141b] shadow-[0_0_30px_rgb(43_217_139/0.2)]"
              : "border border-white/8 bg-[#0f141b]",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-extrabold uppercase">{style.name}</h3>
            {style.recommended && <Badge tone="solid">Lads&apos; choice</Badge>}
          </div>
          <p className="text-sm text-muted">{style.note}</p>
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {style.boosts.map((boost) => (
              <li key={boost} className="tabular rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                {boost}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Cheaper player with a similar profile. */
export function AlternativeCard({ player }: { player: Player }) {
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-3xl leading-none font-extrabold text-mint">{player.ovr}</p>
        {player.price !== undefined && <CoinPrice value={player.price} compact className="text-sm" />}
      </div>
      <div>
        <h3 className="font-display font-extrabold group-hover:text-mint">
          <Link href={`/players/${player.slug}`} className="after:absolute after:inset-0">
            {player.name}
          </Link>
        </h3>
        <p className="tabular text-[11px] text-muted uppercase">
          {player.position} · {player.league ?? player.club}
        </p>
      </div>
      {player.verdict && <p className="line-clamp-3 text-sm text-muted">{player.verdict}</p>}
      <p className="tabular mt-auto flex gap-3 border-t border-white/8 pt-3 text-[11px] font-bold text-white/80">
        <span>
          {player.stats.pac} {statLabels(player.position).pac}
        </span>
        <span>
          {player.stats.sho} {statLabels(player.position).sho}
        </span>
        <span>
          {player.stats.dri} {statLabels(player.position).dri}
        </span>
      </p>
    </article>
  );
}

/**
 * The Lads' verdict: public one-line picks from creators, plus the in-depth review for members.
 * For non-members `review` is undefined (dropped on the server) and a lock card is shown.
 */
export function ProReviewSection({
  picks,
  review,
  reviewAuthor,
  hasReview,
  playerName,
}: {
  picks: { creator: Creator; verdict: string }[];
  review?: PlayerReview;
  reviewAuthor?: Creator;
  hasReview: boolean;
  playerName: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {picks.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {picks.map(({ creator, verdict }) => (
            <li
              key={creator.slug}
              className="flex items-start gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
            >
              <Avatar initials={creator.initials} tone="mint" />
              <div className="flex flex-col gap-1.5">
                <Link href={`/creators/${creator.slug}`} className="flex items-center gap-2 font-bold hover:text-mint">
                  {creator.name}
                  <BadgeCheck aria-hidden className="size-4 text-primary" />
                </Link>
                <p className="text-white/85 italic">&ldquo;{verdict}&rdquo;</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {review && reviewAuthor ? (
        <article className="flex flex-col gap-5 rounded-2xl border border-primary/40 bg-gradient-to-b from-pitch-green/60 to-[#0f141b] p-6">
          <div className="flex items-center gap-3">
            <Avatar initials={reviewAuthor.initials} tone="mint" size="lg" />
            <div>
              <p className="flex items-center gap-2 font-bold">
                {reviewAuthor.name}
                <Badge tone="mint">In-depth review</Badge>
              </p>
              <p className="text-sm text-muted">{reviewAuthor.role}</p>
            </div>
          </div>
          <blockquote className="text-lg leading-relaxed text-white/90">&ldquo;{review.quote}&rdquo;</blockquote>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {review.insights.map((insight) => (
              <li key={insight.title} className="rounded-xl border border-white/8 bg-canvas/50 p-4">
                <p className="text-label text-mint">{insight.title}</p>
                <p className="mt-1.5 text-sm text-muted">{insight.text}</p>
              </li>
            ))}
          </ul>
        </article>
      ) : (
        hasReview && (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-[#1a1508] to-[#0f141b] p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Lock aria-hidden className="size-6" />
              </span>
              <div>
                <p className="text-label text-gold">FC Lads+ review</p>
                <h3 className="mt-1 font-display text-lg leading-snug font-extrabold">
                  The Lads&apos; in-depth review of {playerName}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  How to use him, the moves that work, his weak spots and when to buy or sell.
                </p>
              </div>
            </div>
            <Button href={JOIN_HREF} variant="primary" size="sm" className="shrink-0">
              Unlock with FC Lads+ ({ladsPlus.priceLabel}/mo)
            </Button>
          </div>
        )
      )}
    </div>
  );
}
