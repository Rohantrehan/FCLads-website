"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Cog, Home, LineChart, MessageSquare, PlayCircle, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const postItems = [
  { href: "", label: "Home", icon: Home },
  { href: "/trading", label: "Trading posts", icon: LineChart },
  { href: "/feed", label: "Feed posts", icon: MessageSquare },
  { href: "/guides", label: "Guides", icon: BookOpen },
];

const adminItems = [
  { href: "/collections", label: "Video collections", icon: PlayCircle },
  { href: "/creators", label: "Creators", icon: UserRound },
  { href: "/settings", label: "Site settings", icon: Cog },
  { href: "/team", label: "Team", icon: Users },
];

/** Side menu on desktop, a scrolling row on phones. */
export function BoardNav({ base, isAdmin }: { base: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href ? pathname.startsWith(base + href) : pathname === base);

  const link = (item: (typeof postItems)[number]) => (
    <li key={item.href} className="shrink-0">
      <Link
        href={base + item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
          isActive(item.href) ? "bg-primary/12 text-mint" : "text-muted hover:bg-white/5 hover:text-on-surface",
        )}
      >
        <item.icon aria-hidden className="size-4" />
        {item.label}
      </Link>
    </li>
  );

  return (
    <nav aria-label="Posting board" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">{postItems.map(link)}</ul>
      {isAdmin && (
        <div className="flex gap-1 lg:flex-col">
          <p className="text-label hidden px-3 pb-1 text-muted/70 lg:block">Admin</p>
          <ul className="flex gap-1 lg:flex-col">{adminItems.map(link)}</ul>
        </div>
      )}
    </nav>
  );
}
