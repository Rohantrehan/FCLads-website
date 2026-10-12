import { Camera, MonitorPlay, Music2, Radio } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Creator, SocialPlatform } from "@/types";

const platformMeta: Record<SocialPlatform, { label: string; unit: string; icon: ReactNode; color: string }> = {
  youtube: { label: "YouTube", unit: "subscribers", icon: <MonitorPlay className="size-5" />, color: "text-danger" },
  instagram: { label: "Instagram", unit: "followers", icon: <Camera className="size-5" />, color: "text-[#e879f9]" },
  tiktok: { label: "TikTok", unit: "followers", icon: <Music2 className="size-5" />, color: "text-mint" },
  x: {
    label: "X",
    unit: "followers",
    icon: <span className="font-mono text-base font-bold">𝕏</span>,
    color: "text-white",
  },
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
            <span
              aria-hidden
              className={cn("flex size-10 items-center justify-center rounded-lg bg-white/5", meta.color)}
            >
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
