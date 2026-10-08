"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CoinPrice, Trend } from "@/components/ui/DataBits";
import { cn } from "@/lib/cn";
import { statLabels } from "@/lib/positions";
import type { FaceStats, Player } from "@/types";

export interface PitchSlot {
  label: string;
  x: number;
  y: number;
  player: Player;
  chem?: string;
}

const HOVER_INTENT_MS = 120;

const surname = (player: Player) => {
  const name = player.cardName ?? player.name;
  return name.includes(". ") ? name.split(". ").slice(1).join(" ") : name.split(" ").slice(-1)[0];
};

/**
 * Vertical pitch with the starting XI, plus the "selected player" panel.
 * Hover-and-stay: resting the cursor on a player shows them in the panel and they stay selected
 * after the cursor leaves. Tap and keyboard focus select too. Renders two grid children, so the
 * parent page places the pitch and the panel in its own grid.
 */
export function SquadPitch({
  slots,
  formation,
  initial = 0,
}: {
  slots: PitchSlot[];
  formation: string;
  initial?: number;
}) {
  const [selected, setSelected] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = slots[selected];

  const intend = (index: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSelected(index), HOVER_INTENT_MS);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <>
      <div className="order-first min-w-0 lg:order-none lg:col-span-6">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-[#0d2a1f] via-[#0a2119] to-[#08180f] shadow-[inset_0_0_80px_rgb(0_0_0/0.5)]">
          <svg aria-hidden viewBox="0 0 300 400" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <g fill="none" stroke="#8FF0C9" strokeOpacity="0.18" strokeWidth="1.2">
              <rect x="12" y="12" width="276" height="376" />
              <line x1="12" y1="200" x2="288" y2="200" />
              <circle cx="150" cy="200" r="38" />
              <rect x="80" y="12" width="140" height="56" />
              <rect x="80" y="332" width="140" height="56" />
              <rect x="118" y="12" width="64" height="20" />
              <rect x="118" y="368" width="64" height="20" />
            </g>
            {Array.from({ length: 8 }, (_, index) => (
              <rect
                key={index}
                x="12"
                y={12 + index * 47}
                width="276"
                height="23.5"
                fill="#ffffff"
                fillOpacity="0.015"
              />
            ))}
          </svg>
          <span
            aria-hidden
            className="tabular absolute top-3 left-4 font-display text-3xl font-extrabold text-white/5 sm:text-5xl"
          >
            {formation}
          </span>

          <ul aria-label={`Starting XI in a ${formation}`}>
            {slots.map((slot, index) => {
              const active = index === selected;
              return (
                <li
                  key={`${slot.label}-${index}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, zIndex: active ? 2 : 1 }}
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${slot.label}: ${slot.player.name}, ${slot.player.ovr} rated`}
                    onPointerEnter={(event) => event.pointerType === "mouse" && intend(index)}
                    onPointerLeave={cancel}
                    onFocus={() => setSelected(index)}
                    onClick={() => setSelected(index)}
                    className={cn(
                      "flex w-14 flex-col items-center gap-0.5 rounded-lg border px-1 py-1 transition-all sm:w-[4.5rem] sm:py-1.5",
                      active
                        ? "scale-110 border-mint bg-pitch-green shadow-[0_0_20px_rgb(43_217_139/0.55)]"
                        : "border-white/15 bg-canvas/80 backdrop-blur-sm hover:border-mint/60",
                    )}
                  >
                    <span className="flex w-full items-center justify-between px-0.5">
                      <span
                        className={cn(
                          "font-display text-sm leading-none font-extrabold sm:text-base",
                          active ? "text-mint" : "text-white",
                        )}
                      >
                        {slot.player.ovr}
                      </span>
                      <span className="tabular text-[8px] text-muted sm:text-[9px]">{slot.label}</span>
                    </span>
                    <span className="w-full truncate text-center text-[9px] font-bold uppercase sm:text-[10px]">
                      {surname(slot.player)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="tabular mt-3 text-center text-[11px] text-muted">
          Point at or tap a player to see their details.
        </p>
      </div>

      <aside aria-labelledby="dossier-heading" className="min-w-0 lg:col-span-3">
        {current && <PlayerDossier slot={current} />}
      </aside>
    </>
  );
}

function PlayerDossier({ slot }: { slot: PitchSlot }) {
  const { player } = slot;
  const labels = statLabels(player.position);
  const chemStyle = slot.chem ? player.chemistryStyles?.find((style) => style.name === slot.chem) : undefined;
  const styles = [...(player.playstylesPlus ?? []), ...(player.playstyles ?? [])].slice(0, 4);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5 lg:sticky lg:top-28">
      <p className="text-label flex items-center justify-between text-mint">
        Selected player
        <span className="tabular text-muted">{slot.label}</span>
      </p>
      <div className="flex items-center gap-3">
        <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary leading-none text-on-primary">
          <span className="font-display text-2xl font-extrabold">{player.ovr}</span>
          <span className="tabular text-[10px] font-bold opacity-80">{player.position}</span>
        </span>
        <div className="min-w-0">
          <h3 id="dossier-heading" className="font-display text-lg leading-tight font-extrabold uppercase">
            {player.name}
          </h3>
          <p className="tabular text-[11px] text-muted uppercase">
            {player.nation} · {player.league ?? player.club}
          </p>
        </div>
      </div>
      {player.price !== undefined && (
        <p className="flex items-center gap-3">
          <CoinPrice value={player.price} />
          {player.trend !== undefined && <Trend value={player.trend} />}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {(Object.keys(labels) as (keyof FaceStats)[]).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <dt className="tabular w-8 text-[10px] text-muted">{labels[key]}</dt>
            <dd className="flex flex-1 items-center gap-2">
              <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-canvas">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    player.stats[key] >= 85 ? "bg-primary" : player.stats[key] >= 70 ? "bg-mint/50" : "bg-gold/70",
                  )}
                  style={{ width: `${Math.min(player.stats[key], 99) / 0.99}%` }}
                />
              </span>
              <span className="tabular w-6 text-right text-xs font-bold">{player.stats[key]}</span>
            </dd>
          </div>
        ))}
      </dl>

      {styles.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="PlayStyles">
          {styles.map((name) => (
            <li
              key={name}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-bold",
                name.endsWith("+") ? "bg-primary/90 text-on-primary" : "bg-white/8 text-white/80",
              )}
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {slot.chem && (
        <div className="rounded-xl border border-primary/25 bg-pitch-green/40 p-3">
          <p className="text-label flex items-center justify-between gap-2 text-mint">
            <span className="flex items-center gap-1.5">
              <FlaskConical aria-hidden className="size-3.5" />
              Chem style
            </span>
            <Badge tone="solid">{slot.chem}</Badge>
          </p>
          {chemStyle && (
            <p className="mt-2 text-xs text-muted">
              <span className="font-bold text-mint">{chemStyle.boosts.join(", ")}</span> — {chemStyle.note}
            </p>
          )}
        </div>
      )}

      {player.verdict && <p className="text-sm text-muted">{player.verdict}</p>}

      <Link
        href={`/players/${player.slug}`}
        className="text-label mt-auto flex items-center gap-1.5 text-primary hover:text-white"
      >
        Open player page
        <ArrowRight aria-hidden className="size-3.5" />
      </Link>
    </div>
  );
}
