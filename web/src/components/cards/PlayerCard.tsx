import Link from "next/link";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CoinPrice, Trend } from "@/components/ui/DataBits";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import type { FaceStats, Player } from "@/types";

const statKeys: (keyof FaceStats)[] = ["pac", "sho", "pas", "dri", "def", "phy"];

/** 2×3 grid of PAC/SHO/PAS/DRI/DEF/PHY. Low values are dimmed. */
function StatGrid({ stats, highlight = "text-mint" }: { stats: FaceStats; highlight?: string }) {
  return (
    <dl className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
      {statKeys.map((key) => (
        <div key={key} className="flex flex-col-reverse">
          <dt className="tabular text-[10px] uppercase text-muted">{key}</dt>
          <dd className={cn("tabular text-sm font-bold", stats[key] < 60 ? "text-white/60" : highlight)}>
            {stats[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type CollectibleTier = "hero" | "gold" | "special";

const tierFrames: Record<CollectibleTier, string> = {
  hero: "from-mint via-primary-bright to-azure shadow-[0_0_40px_rgb(143_240_201/0.35)]",
  gold: "from-gold via-[#8a6d2c] to-gold/40",
  special: "from-azure via-[#4f46e5] to-mint/60",
};

/**
 * FUT-style collectible card (hero section of the Home page).
 * Gradient 2px frame, OVR + position + nation top-left, player art middle, stat grid bottom.
 */
export function CollectibleCard({
  player,
  tier = "hero",
  link = true,
  className,
}: {
  player: Player;
  tier?: CollectibleTier;
  /** false on the player's own page, where linking to itself makes no sense. */
  link?: boolean;
  className?: string;
}) {
  const highlight = tier === "gold" ? "text-gold" : "text-mint";
  const frameClass = cn(
    "block h-[390px] w-64 rounded-2xl bg-gradient-to-b p-[2px] transition-transform duration-300",
    link && "hover:scale-105",
    tierFrames[tier],
    className,
  );
  const content = (
    <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] bg-canvas p-4">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-transparent via-mint/10 to-transparent" />
      <div aria-hidden className="absolute -top-16 -left-16 size-32 rounded-full bg-mint/20 blur-2xl" />

      <header className="relative flex items-start justify-between">
        <div>
          <p className={cn("font-display text-4xl leading-none font-extrabold tracking-tighter", highlight)}>
            {player.ovr}
          </p>
          <p className="font-display text-sm font-extrabold tracking-widest">{player.position}</p>
          <p className="tabular mt-1 text-[10px] text-muted">{player.nation}</p>
        </div>
        {player.metaTag && <Badge tone={tier === "gold" ? "gold" : "mint"}>{player.metaTag}</Badge>}
      </header>

      <div className="relative flex flex-col items-center text-center">
        <div className="flex size-28 items-center justify-center rounded-full border border-primary-bright/30 bg-gradient-to-b from-pitch-green to-transparent">
          {/* Player art placeholder until licensed images are decided (report §2.4 #7). */}
          <span className="font-display text-3xl font-extrabold text-mint/80">
            {(player.cardName ?? player.name)
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
        </div>
        <h3 className="mt-2 font-display text-sm font-extrabold tracking-widest uppercase">
          {player.cardName ?? player.name}
        </h3>
        <p className="tabular text-[11px] text-mint">{player.club}</p>
      </div>

      <div className="relative">
        <StatGrid stats={player.stats} highlight={highlight} />
      </div>
    </article>
  );
  return link ? (
    <Link href={`/players/${player.slug}`} className={frameClass}>
      {content}
    </Link>
  ) : (
    <div className={frameClass}>{content}</div>
  );
}

/**
 * Tall glass card for meta rankings ("This week's most broken players").
 * `active` adds the mint focus ring used for the selected card.
 */
export function MetaPlayerCard({
  player,
  active,
  className,
}: {
  player: Player;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/players/${player.slug}`}
      className={cn(
        "flex w-[290px] shrink-0 snap-start flex-col justify-between rounded-2xl bg-[#0f141b] p-5 transition-all duration-200 hover:-translate-y-1",
        active ? "shadow-glow" : "border border-white/8 hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Badge tone={active ? "mint" : "neutral"}>
          {active && <Flame aria-hidden className="size-3" />}
          {player.metaRank ? `Rank #${player.metaRank} meta` : (player.metaTag ?? "Meta pick")}
        </Badge>
        {player.trend !== undefined && <Trend value={player.trend} />}
      </div>

      <div className="my-5 flex flex-col items-center text-center">
        <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-surface-high to-canvas shadow-lg">
          <span className="font-display text-3xl font-extrabold text-mint">{player.ovr}</span>
          <span className="tabular absolute right-2 bottom-1 text-[10px] text-white/60">{player.position}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-extrabold uppercase">{player.name}</h3>
        <p className="text-xs text-muted">
          {player.nation} · {player.club}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-surface-container/90 p-3.5">
        {player.verdict && <p className="text-xs font-medium text-white/90 italic">&ldquo;{player.verdict}&rdquo;</p>}
        <div className="tabular flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-muted">
          {player.matches ? (
            <>
              <span>MATCH USAGE</span>
              <span className="font-bold text-on-surface">{formatCompact(player.matches)} matches</span>
            </>
          ) : (
            player.price !== undefined && (
              <>
                <span>PRICE</span>
                <CoinPrice value={player.price} compact />
              </>
            )
          )}
        </div>
      </div>
    </Link>
  );
}
