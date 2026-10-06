import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { AccessTier } from "@/types";

type Tone = "neutral" | "mint" | "azure" | "gold" | "danger" | "solid";

const tones: Record<Tone, string> = {
  neutral: "bg-white/5 text-muted border-white/10",
  mint: "bg-pitch-green text-mint border-primary-bright/40",
  azure: "bg-azure/15 text-[#93c5fd] border-azure/40",
  gold: "bg-gold/10 text-gold border-gold/40",
  danger: "bg-danger/10 text-danger-soft border-danger/40",
  solid: "bg-primary text-on-primary border-transparent",
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

/** Small mono uppercase label: "META S+", "NEW", "PATCH 1.08". */
export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** FREE / LADS+ access tag used on every guide, video and feed item. */
export function TierBadge({ tier, className }: { tier: AccessTier; className?: string }) {
  if (tier === "plus") {
    return (
      <Badge tone="mint" className={cn("shadow-[0_0_12px_rgb(56_225_146/0.25)]", className)}>
        <ShieldCheck aria-hidden className="size-3" />
        Lads+
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className={className}>
      Free
    </Badge>
  );
}

/** Solid tag pinned to the top-right corner of a media thumbnail. */
export function CornerTag({ tier, className }: { tier: AccessTier; className?: string }) {
  return (
    <span
      className={cn(
        "absolute top-0 right-0 rounded-bl-lg px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider shadow-md",
        tier === "plus" ? "bg-primary text-on-primary" : "bg-azure text-white",
        className,
      )}
    >
      {tier === "plus" ? "Lads+" : "Free"}
    </span>
  );
}

/** Parallelogram section tag (skewX -12deg) for "forward momentum" labels. */
export function SkewTag({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "skew-tag inline-block bg-gradient-to-r from-[#007a5a] to-primary px-3 py-1 shadow-[0_0_15px_rgb(0_122_90/0.5)]",
        className,
      )}
    >
      <span className="unskew text-label inline-block text-white">{children}</span>
    </span>
  );
}
