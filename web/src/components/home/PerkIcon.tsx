import { BookOpen, LineChart, MessagesSquare, MonitorPlay, Video } from "lucide-react";
import type { PerkKey } from "@/data/ladsPlus";

const icons = {
  guides: BookOpen,
  discord: MessagesSquare,
  creators: MonitorPlay,
  trading: LineChart,
  review: Video,
} satisfies Record<PerkKey, unknown>;

export function PerkIcon({ perk, className }: { perk: PerkKey; className?: string }) {
  const Icon = icons[perk];
  return <Icon aria-hidden className={className} />;
}
