import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

/** ▲ +8.2% / ▼ -2.8% / — 0.0% in mono, coloured by direction. */
export function Trend({ value, className }: { value: number; className?: string }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 text-xs font-bold",
        value > 0 && "text-primary",
        value < 0 && "text-danger",
        value === 0 && "text-muted",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {formatPercent(value)}
    </span>
  );
}

/** Coin price in gold mono. `compact` renders 420000 as "420K". */
export function CoinPrice({ value, compact, className }: { value: number; compact?: boolean; className?: string }) {
  return (
    <span className={cn("tabular inline-flex items-center gap-1 font-semibold text-gold", className)}>
      <span aria-hidden className="inline-block size-2.5 rotate-45 rounded-[2px] border-2 border-gold" />
      {compact ? formatCompact(value) : formatNumber(value)}
      <span className="sr-only"> coins</span>
    </span>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

/** Thin 4px track with green fill, label left and mono value right. */
export function StatBar({ label, value, max = 99, className }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = value >= 85 ? "bg-primary" : value >= 70 ? "bg-secondary" : value >= 50 ? "bg-gold" : "bg-danger";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="tabular w-10 text-xs text-muted">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-1 flex-1 overflow-hidden rounded-full bg-canvas"
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular w-7 text-right text-sm font-bold">{value}</span>
    </div>
  );
}

/** Circle with initials, used for creators until real photos exist. */
export function Avatar({
  initials,
  size = "md",
  tone = "azure",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  tone?: "azure" | "mint";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "tabular inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-14 text-base",
        tone === "azure" ? "bg-azure/20 text-[#93c5fd]" : "bg-pitch-green text-mint ring-1 ring-primary/40",
        className,
      )}
    >
      {initials}
    </span>
  );
}
