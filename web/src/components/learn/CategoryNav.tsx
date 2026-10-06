import Link from "next/link";
import {
  BookOpen,
  Crosshair,
  Flag,
  Gamepad2,
  GraduationCap,
  LayoutGrid,
  Network,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryLabels } from "@/lib/format";
import type { GuideCategory } from "@/types";
import { learnHref } from "./learnHref";

const icons: Record<GuideCategory, LucideIcon> = {
  gameplay: Gamepad2,
  "skill-moves": Sparkles,
  tactics: Waypoints,
  "meta-players": Star,
  "fut-champs": Trophy,
  "fc-updates": RefreshCw,
  beginner: GraduationCap,
  "squad-building": Network,
  "set-pieces": Flag,
  shooting: Crosshair,
};

interface CategoryNavProps {
  active?: GuideCategory;
  counts: Partial<Record<GuideCategory, number>>;
  total: number;
  q?: string;
}

/**
 * Category filter. Desktop: vertical sidebar list. Phone/tablet: horizontal scrolling pills.
 * Categories with no guides are hidden. Search text is kept when switching category.
 */
export function CategoryNav({ active, counts, total, q }: CategoryNavProps) {
  const entries = (Object.keys(categoryLabels) as GuideCategory[]).filter((key) => counts[key]);
  const items = [
    { key: undefined, label: "All guides", count: total, Icon: LayoutGrid },
    ...entries.map((key) => ({ key, label: categoryLabels[key], count: counts[key] ?? 0, Icon: icons[key] })),
  ];

  return (
    <nav aria-label="Guide categories">
      <p className="mb-3 hidden items-center justify-between lg:flex">
        <span className="text-label flex items-center gap-2 text-muted">
          <BookOpen aria-hidden className="size-4 text-mint" />
          Categories
        </span>
      </p>
      <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {items.map(({ key, label, count, Icon }) => {
          const isActive = key === active;
          return (
            <li key={label} className="shrink-0">
              <Link
                href={learnHref({ category: key, q })}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors lg:justify-between lg:py-2.5",
                  isActive
                    ? "border-primary/50 bg-primary/15 font-semibold text-mint"
                    : "border-white/8 bg-white/[0.03] text-muted hover:border-white/15 hover:text-white lg:border-transparent lg:bg-transparent",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {label}
                </span>
                <span
                  className={cn(
                    "tabular rounded px-1.5 text-[11px]",
                    isActive ? "bg-primary/20 text-mint" : "bg-white/5 text-muted",
                  )}
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
