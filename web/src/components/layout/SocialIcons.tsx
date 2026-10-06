import { Camera, MessagesSquare, Music2, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/cn";
import { socialLinks } from "@/lib/site";

// Generic icons, matching the designs (lucide has no brand logos). Swap for official brand SVGs later if wanted.
const items = [
  { key: "youtube", label: "YouTube", icon: <MonitorPlay className="size-5" /> },
  { key: "instagram", label: "Instagram", icon: <Camera className="size-5" /> },
  { key: "x", label: "X", icon: <span className="font-mono text-sm font-bold">𝕏</span> },
  { key: "tiktok", label: "TikTok", icon: <Music2 className="size-5" /> },
  { key: "discord", label: "Discord", icon: <MessagesSquare className="size-5" /> },
] as const;

export function SocialIcons({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-1 text-muted", className)}>
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={socialLinks[item.key]}
            aria-label={`FC Lads on ${item.label}`}
            className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-white/5 hover:text-mint"
          >
            <span aria-hidden className="flex">
              {item.icon}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
