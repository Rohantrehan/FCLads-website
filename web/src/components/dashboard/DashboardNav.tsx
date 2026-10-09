"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LayoutGrid, MessagesSquare, TrendingUp, Users, Video } from "lucide-react";
import { cn } from "@/lib/cn";

export const dashboardTabs = [
  { label: "My Feed", href: "/dashboard", icon: LayoutGrid },
  { label: "Trading", href: "/dashboard/trading", icon: TrendingUp },
  { label: "Gameplay", href: "/dashboard/gameplay", icon: Gamepad2 },
  { label: "My Review", href: "/dashboard/review", icon: Video },
  { label: "Discord", href: "/dashboard/discord", icon: MessagesSquare },
  { label: "Creators", href: "/dashboard/creators", icon: Users },
];

/** Tab bar for the member dashboard. Scrolls sideways on phones. */
export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="scrollbar-none -mx-4 overflow-x-auto px-4">
      <ul className="flex w-max gap-1">
        {dashboardTabs.map(({ label, href, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-t-lg px-4 py-3 font-display text-sm font-bold uppercase tracking-wide transition-colors",
                  active ? "text-white" : "text-muted hover:text-white",
                )}
              >
                <Icon aria-hidden className={cn("size-4", active && "text-primary")} />
                {label}
                {active && <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
