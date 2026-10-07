import Link from "next/link";
import { LayoutGrid, ListVideo } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { key: "guides", label: "Guides", href: "/learn", icon: LayoutGrid },
  { key: "collections", label: "Collections", href: "/learn/collections", icon: ListVideo },
] as const;

/** Switch between the two views of the Learn section: single guides and video collections. */
export function LearnTabs({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <nav aria-label="Learn sections" className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {tabs.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-4 font-display text-xs font-extrabold tracking-wider uppercase transition-colors",
              isActive ? "bg-primary text-on-primary shadow-[0_0_18px_rgb(43_217_139/0.35)]" : "text-muted hover:text-white",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
