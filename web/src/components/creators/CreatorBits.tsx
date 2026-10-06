import Link from "next/link";
import { Camera, MonitorPlay, Music2, Quote, Radio } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Creator, Player, SocialPlatform } from "@/types";

const platformMeta: Record<SocialPlatform, { label: string; unit: string; icon: ReactNode; color: string }> = {
  youtube: { label: "YouTube", unit: "subscribers", icon: <MonitorPlay className="size-5" />, color: "text-danger" },
  instagram: { label: "Instagram", unit: "followers", icon: <Camera className="size-5" />, color: "text-[#e879f9]" },
  tiktok: { label: "TikTok", unit: "followers", icon: <Music2 className="size-5" />, color: "text-mint" },
  x: { label: "X", unit: "followers", icon: <span className="font-mono text-base font-bold">𝕏</span>, color: "text-white" },
  twitch: { label: "Twitch", unit: "followers", icon: <Radio className="size-5" />, color: "text-[#a78bfa]" },
};

/** Row of follower counts per platform. */
export function AudienceStats({ audience, className }: { audience: Creator["audience"]; className?: string }) {
  if (!audience?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-8 gap-y-4", className)}>
      {audience.map(({ platform, count }) => {
        const meta = platformMeta[platform];
        return (
          <li key={platform} className="flex items-center gap-3">
            <span aria-hidden className={cn("flex size-10 items-center justify-center rounded-lg bg-white/5", meta.color)}>
              {meta.icon}
            </span>
            <p className="flex flex-col">
              <span className="tabular text-lg leading-none font-bold">{count}</span>
              <span className="mt-1 text-[11px] text-muted uppercase">
                {meta.label} {meta.unit}
              </span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** A player the creator endorses, with their verdict. */
export function PickCard({ player, verdict, creatorName }: { player: Player; verdict: string; creatorName: string }) {
  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-gradient-to-b from-surface-high to-[#0f141b] p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-4xl leading-none font-extrabold">{player.ovr}</p>
          <p className="tabular mt-1 text-xs font-bold text-mint">{player.position}</p>
        </div>
        <span className="tabular rounded bg-white/5 px-2 py-0.5 text-[10px] text-muted">{player.nation}</span>
      </div>
      <div className="flex flex-col items-center gap-2 py-2">
        <span
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-b from-pitch-green to-transparent font-display text-2xl font-extrabold text-mint/80"
        >
          {player.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <h3 className="font-display font-extrabold uppercase">
          <Link href={`/players/${player.slug}`} className="after:absolute after:inset-0 group-hover:text-mint">
            {player.name}
          </Link>
        </h3>
      </div>
      <blockquote className="rounded-lg bg-canvas/60 p-3">
        <p className="text-label flex items-center gap-1.5 text-primary">
          <Quote aria-hidden className="size-3" />
          {creatorName}&apos;s verdict
        </p>
        <p className="mt-1.5 text-sm text-on-surface/90 italic">&ldquo;{verdict}&rdquo;</p>
      </blockquote>
    </article>
  );
}
