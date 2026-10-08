"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FilterPills } from "@/components/ui/FilterPills";
import { formatCompact, formatNumber } from "@/lib/format";
import type { PricePoint } from "@/lib/priceHistory";

const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

const dayLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fmtDay = (iso: string) => dayLabel.format(new Date(`${iso}T00:00:00Z`));

/** Rounds the axis to tidy steps so gridline labels read well (e.g. 340K, 380K, 420K). */
function niceScale(min: number, max: number, ticks = 3) {
  const span = Math.max(max - min, max * 0.02);
  const raw = span / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const values: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) values.push(v);
  return { lo, hi, values };
}

interface PriceChartProps {
  points: PricePoint[];
  /** Range buttons in days. One range = no buttons. */
  ranges?: number[];
  /** "coins" for player prices, "index" for the FC Lads market index. */
  unit?: "coins" | "index";
  /** Notes on key days, shown as markers and in the tooltip. Keyed by ISO date. */
  notes?: Record<string, string>;
}

/**
 * Single-series line with a crosshair tooltip (pointer and arrow keys) and a table view
 * for screen readers. Used for player prices and the market index (mock data for now).
 */
export function PriceChart({ points, ranges = [7, 14, 30], unit = "coins", notes = {} }: PriceChartProps) {
  const [range, setRange] = useState(String(ranges[0]));
  const rangeOptions = ranges.map((days) => ({ value: String(days), label: `${days}D` }));
  const isIndex = unit === "index";
  const fmt = (value: number) => (isIndex ? value.toFixed(1) : formatNumber(value));
  const fmtAxis = (value: number) => (isIndex ? value.toFixed(0) : formatCompact(value));
  const noun = isIndex ? "Index" : "Price";
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();
  // Draw at the real pixel width so text and lines keep their size on every screen.
  const frame = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => points.slice(-Number(range)), [points, range]);
  const { lo, hi, values } = useMemo(
    () => niceScale(Math.min(...data.map((p) => p.price)), Math.max(...data.map((p) => p.price))),
    [data],
  );

  if (data.length < 2) return null;

  const x = (index: number) => PAD.left + (index / (data.length - 1)) * (W - PAD.left - PAD.right);
  const y = (price: number) => PAD.top + (1 - (price - lo) / (hi - lo || 1)) * (H - PAD.top - PAD.bottom);
  const line = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(W / 110)));
  const last = data.length - 1;
  const shown = active ?? last;
  const change = data[last].price - data[0].price;

  const onPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const index = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * last);
    setActive(Math.max(0, Math.min(last, index)));
  };

  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const step = event.key === "ArrowLeft" ? -1 : 1;
      setActive((current) => Math.max(0, Math.min(last, (current ?? last) + step)));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : last);
    } else if (event.key === "Escape") {
      setActive(null);
    }
  };

  const tipLeft = (x(shown) / W) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="tabular text-xs text-muted">
          {range}-day change:{" "}
          <span className={change > 0 ? "font-bold text-primary" : change < 0 ? "font-bold text-danger" : "font-bold"}>
            {change > 0 ? "+" : ""}
            {fmt(change)}
          </span>
        </p>
        {rangeOptions.length > 1 && (
          <FilterPills
            label={`${noun} history range`}
            options={rangeOptions}
            value={range}
            onChange={(value) => {
              setRange(value);
              setActive(null);
            }}
          />
        )}
      </div>

      <div ref={frame} className="relative" style={{ minHeight: H }}>
        {W > 0 && (
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="block max-w-full touch-pan-y overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-mint/60 rounded-lg"
            role="img"
            aria-label={`${noun} over the last ${range} days, from ${fmt(data[0].price)} to ${fmt(data[last].price)}${isIndex ? "" : " coins"}. Use the arrow keys to read each day.`}
            tabIndex={0}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2bd98b" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2bd98b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {values.map((value) => (
              <g key={value}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(value)} y2={y(value)} stroke="rgb(255 255 255 / 0.06)" />
                <text
                  x={PAD.left - 10}
                  y={y(value)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted font-mono text-[11px]"
                >
                  {fmtAxis(value)}
                </text>
              </g>
            ))}

            {data.map((point, index) =>
              index === last || (index % labelEvery === 0 && last - index >= labelEvery * 0.6) ? (
                <text
                  key={point.date}
                  x={x(index)}
                  y={H - 6}
                  textAnchor={index === 0 ? "start" : index === last ? "end" : "middle"}
                  className="fill-muted font-mono text-[11px]"
                >
                  {fmtDay(point.date)}
                </text>
              ) : null,
            )}

            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} fill="none" stroke="#2bd98b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

            {active !== null && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="rgb(255 255 255 / 0.35)"
                strokeDasharray="3 3"
              />
            )}
            {data.map((point, index) =>
              notes[point.date] ? (
                <circle
                  key={point.date}
                  cx={x(index)}
                  cy={y(point.price)}
                  r="4"
                  fill="#0f141b"
                  stroke="#d8b25a"
                  strokeWidth="2"
                />
              ) : null,
            )}
            <circle cx={x(shown)} cy={y(data[shown].price)} r="5" fill="#2bd98b" stroke="#0f141b" strokeWidth="2" />
          </svg>
        )}

        {W > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 w-max max-w-[13rem] rounded-lg border border-white/10 bg-canvas/95 px-3 py-2 shadow-lg backdrop-blur-md"
            style={{
              left: `${tipLeft}%`,
              transform: `translateX(${tipLeft > 70 ? "-105%" : tipLeft < 20 ? "5%" : "-50%"})`,
            }}
          >
            <p className="tabular text-sm font-bold text-white">{fmt(data[shown].price)}</p>
            <p className="tabular text-[11px] whitespace-nowrap text-muted">
              {fmtDay(data[shown].date)}
              {active === null && " · today"}
            </p>
            {notes[data[shown].date] && <p className="text-[11px] font-bold text-gold">{notes[data[shown].date]}</p>}
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>
          {noun} by day, last {range} days
        </caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{isIndex ? "Index" : "Price (coins)"}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <th scope="row">{fmtDay(point.date)}</th>
              <td>
                {fmt(point.price)}
                {notes[point.date] && ` (${notes[point.date]})`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
