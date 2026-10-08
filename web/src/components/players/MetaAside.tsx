import Link from "next/link";
import { BadgeCheck, Flame, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar, CoinPrice, Trend } from "@/components/ui/DataBits";
import type { Creator, Player } from "@/types";

/** Analyst note on how the latest patch moved the meta. */
export function PatchImpactCard({ patch, title, text }: { patch: string; title: string; text: string }) {
  return (
    <aside className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
      <p className="text-label flex items-center gap-2 text-gold">
        <Flame aria-hidden className="size-4" />
        Patch {patch} impact
      </p>
      <h2 className="font-display text-lg leading-snug font-extrabold uppercase">{title}</h2>
      <p className="text-sm text-muted">{text}</p>
    </aside>
  );
}

/** The Lads' pick of the week, with the creator's quote and the player's mini card. */
export function ProPickCard({
  creator,
  player,
  quote,
  week,
}: {
  creator: Creator;
  player: Player;
  quote: string;
  week: number;
}) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
      <div className="flex items-center justify-between">
        <p className="text-label flex items-center gap-2 text-mint">
          <BadgeCheck aria-hidden className="size-4" />
          Pro pick of the week
        </p>
        <span className="tabular text-[11px] text-muted">WEEK {week}</span>
      </div>
      <Link href={`/creators/${creator.slug}`} className="flex items-center gap-3 hover:text-mint">
        <Avatar initials={creator.initials} tone="mint" />
        <span className="flex flex-col">
          <span className="font-bold">{creator.name}</span>
          <span className="tabular text-[11px] text-primary">{creator.highlight?.value ?? creator.role}</span>
        </span>
      </Link>
      <blockquote className="rounded-xl bg-surface-container p-4 text-sm text-white/85 italic">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <Link
        href={`/players/${player.slug}`}
        className="flex items-center gap-3 rounded-xl border border-white/8 bg-surface p-3 transition-colors hover:border-primary/40"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-highest font-display text-lg font-extrabold text-mint">
          {player.ovr}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">{player.name}</span>
          <span className="tabular text-[11px] text-muted">
            {player.position} · {player.stats.pac} PAC · {player.stats.dri} DRI
          </span>
          {player.price !== undefined && <CoinPrice value={player.price} compact className="text-xs" />}
        </span>
      </Link>
    </aside>
  );
}

/** Players who got worse with the latest patch. */
export function NerfsCard({
  patch,
  nerfs,
  analyst,
}: {
  patch: string;
  nerfs: { player: Player; note: string }[];
  analyst?: Creator;
}) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label flex items-center gap-2 text-danger-soft">
          <TriangleAlert aria-hidden className="size-4" />
          Just patched: nerfs
        </p>
        <Badge tone="danger">{patch}</Badge>
      </div>
      <p className="text-sm text-muted">
        These meta players got worse with the latest patch. Price change is over the last week.
      </p>
      <ul className="flex flex-col gap-2">
        {nerfs.map(({ player, note }) => (
          <li key={player.slug}>
            <Link
              href={`/players/${player.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-white/8 bg-surface p-3 transition-colors hover:border-danger/40"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {player.name}{" "}
                  <span className="tabular text-xs font-normal text-muted">
                    ({player.ovr} {player.position})
                  </span>
                </span>
                {player.trend !== undefined && <Trend value={player.trend} className="text-[11px]" />}
              </span>
              <span className="text-xs text-muted">{note}</span>
            </Link>
          </li>
        ))}
      </ul>
      {analyst && (
        <p className="tabular border-t border-white/8 pt-3 text-[11px] text-muted">
          Analyst:{" "}
          <Link href={`/creators/${analyst.slug}`} className="text-white/80 hover:text-mint">
            {analyst.name}
          </Link>
        </p>
      )}
    </aside>
  );
}
