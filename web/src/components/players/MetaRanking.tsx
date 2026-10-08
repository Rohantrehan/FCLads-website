import Link from "next/link";
import { ArrowRight, Crown, Lock } from "lucide-react";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoinPrice, Trend } from "@/components/ui/DataBits";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import type { Player } from "@/types";

/**
 * One of the top three cards: rank, OVR, full name, three key stats, a short verdict and the price.
 * `place` 1 gets the green glow. The whole card is one link (stretched from the name).
 */
export function PodiumCard({
  player,
  place,
  showRank,
  className,
}: {
  player: Player;
  place: number;
  showRank: boolean;
  className?: string;
}) {
  const first = place === 1;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1",
        first
          ? "border border-primary/60 bg-gradient-to-b from-pitch-green to-[#0f141b] shadow-[0_0_36px_rgb(43_217_139/0.22)]"
          : "border border-white/8 bg-[#0f141b] hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "tabular flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap uppercase",
            first ? "text-mint" : "text-muted",
          )}
        >
          {first && <Crown aria-hidden className="size-3.5" />}
          {showRank ? `#${place} pick` : `#${place}`}
        </span>
        {player.trend !== undefined && <Trend value={player.trend} className="text-[11px]" />}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            "flex size-16 flex-col items-center justify-center rounded-2xl leading-none",
            first ? "bg-primary text-on-primary shadow-[0_0_24px_rgb(43_217_139/0.45)]" : "bg-surface-highest text-mint",
          )}
        >
          <span className="font-display text-3xl font-extrabold">{player.ovr}</span>
          <span className={cn("tabular text-[10px] font-bold", first ? "text-on-primary/80" : "text-muted")}>
            {player.position}
          </span>
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base leading-tight font-extrabold uppercase transition-colors group-hover:text-mint">
            <Link href={`/players/${player.slug}`} className="after:absolute after:inset-0">
              {player.name}
            </Link>
          </h3>
          <p className="tabular mt-1 text-[11px] text-muted uppercase">
            {player.nation} · {player.club}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-white/8 rounded-lg bg-canvas/60 py-2 text-center">
        {(["pac", "sho", "dri"] as const).map((key) => (
          <div key={key} className="flex flex-col-reverse">
            <dt className="tabular text-[10px] text-muted uppercase">{key}</dt>
            <dd className="tabular text-sm font-bold text-white">{player.stats[key]}</dd>
          </div>
        ))}
      </dl>

      {player.verdict && <p className="line-clamp-2 text-center text-sm text-muted">{player.verdict}</p>}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-3">
        {player.price !== undefined && <CoinPrice value={player.price} compact className="text-base" />}
        <span className="text-label flex items-center gap-1 text-muted group-hover:text-mint">
          View
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/**
 * The ranking below the podium. A table from `md` up, a stacked list on phones.
 * `startRank` is the rank of the first row. Locked rows are placeholders: no player data.
 */
export function RankingTable({
  players,
  startRank,
  lockedCount,
  caption,
}: {
  players: Player[];
  startRank: number;
  lockedCount: number;
  caption: string;
}) {
  const ghostRows = Math.min(lockedCount, 3);
  return (
    <div className="flex flex-col gap-4">
      {players.length > 0 && (
        <>
          {/* Table: tablet and up */}
          <table className="hidden w-full text-left text-sm md:table">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="text-label border-b border-white/8 text-muted">
                <th scope="col" className="py-3 pr-3 font-normal">
                  #
                </th>
                <th scope="col" className="py-3 pr-3 font-normal">
                  Player
                </th>
                <th scope="col" className="py-3 pr-3 font-normal">
                  OVR
                </th>
                <th scope="col" className="py-3 pr-3 font-normal">
                  PAC / SHO / DRI
                </th>
                <th scope="col" className="hidden py-3 pr-3 font-normal xl:table-cell">
                  Matches
                </th>
                <th scope="col" className="py-3 pr-3 font-normal">
                  Trend
                </th>
                <th scope="col" className="py-3 text-right font-normal">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.slug}
                  className="group relative border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="tabular py-3.5 pr-3 text-muted">#{String(startRank + index).padStart(2, "0")}</td>
                  <th scope="row" className="py-3.5 pr-3 font-semibold">
                    <Link
                      href={`/players/${player.slug}`}
                      className="flex items-center gap-2 after:absolute after:inset-0 group-hover:text-mint"
                    >
                      {player.name}
                      <span className="tabular rounded bg-white/8 px-1.5 text-[10px] font-normal text-muted">
                        {player.nation}
                      </span>
                      {player.metaTag === "PRO PICK" && <Badge tone="mint">Pro pick</Badge>}
                    </Link>
                  </th>
                  <td className="tabular py-3.5 pr-3 font-bold text-mint">
                    {player.ovr} <span className="text-xs font-normal text-muted">{player.position}</span>
                  </td>
                  <td className="tabular py-3.5 pr-3 text-white/80">
                    {player.stats.pac} / {player.stats.sho} / {player.stats.dri}
                  </td>
                  <td className="tabular hidden py-3.5 pr-3 text-white/80 xl:table-cell">
                    {player.matches ? formatCompact(player.matches) : "—"}
                  </td>
                  <td className="py-3.5 pr-3">{player.trend !== undefined && <Trend value={player.trend} />}</td>
                  <td className="py-3.5 text-right">
                    {player.price !== undefined && <CoinPrice value={player.price} compact />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* List: phones */}
          <ol className="flex flex-col gap-2 md:hidden" aria-label={caption}>
            {players.map((player, index) => (
              <li key={player.slug}>
                <Link
                  href={`/players/${player.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-primary/40"
                >
                  <span className="tabular w-8 shrink-0 text-xs text-muted">
                    #{String(startRank + index).padStart(2, "0")}
                  </span>
                  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-highest leading-none">
                    <span className="font-display font-extrabold text-mint">{player.ovr}</span>
                    <span className="tabular text-[9px] text-muted">{player.position}</span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">{player.name}</span>
                    <span className="tabular text-[11px] text-muted">
                      {player.stats.pac} PAC · {player.stats.sho} SHO · {player.stats.dri} DRI
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    {player.price !== undefined && <CoinPrice value={player.price} compact className="text-sm" />}
                    {player.trend !== undefined && <Trend value={player.trend} className="text-[11px]" />}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}

      {lockedCount > 0 && (
        <div className="relative">
          <ul
            aria-hidden
            className="flex flex-col gap-2 opacity-60 blur-[3px] select-none [mask-image:linear-gradient(to_bottom,black,transparent)]"
          >
            {Array.from({ length: ghostRows }, (_, index) => (
              <li key={index} className="flex items-center gap-4 rounded-xl border border-white/5 p-3.5">
                <span className="tabular w-8 text-xs text-muted">
                  #{String(startRank + players.length + index).padStart(2, "0")}
                </span>
                <span className="h-3 w-40 rounded bg-white/15" />
                <span className="ml-auto h-3 w-16 rounded bg-gold/30" />
              </li>
            ))}
          </ul>
          <div className="relative -mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-surface-container/95 p-6 text-center backdrop-blur-xl">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock aria-hidden className="size-5" />
            </span>
            <h3 className="font-display text-lg font-extrabold uppercase md:text-xl">
              {lockedCount} more ranked {lockedCount === 1 ? "player" : "players"} in FC Lads+
            </h3>
            <p className="max-w-md text-sm text-muted">
              Members see the full ranking, the Lads&apos; in-depth review of every player and the best chemistry style
              for each card.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button href={JOIN_HREF} variant="primary" size="sm">
                Join FC Lads+ ({ladsPlus.priceLabel}/mo)
              </Button>
              <Link href="/login" className="text-sm text-primary hover:text-white">
                Already a member? Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
