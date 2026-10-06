"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { isActive, mainNav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Close the phone menu whenever the route changes (React "adjust state on prop change" pattern).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape closes the menu; lock page scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-canvas/80 backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only rounded bg-mint px-3 py-2 font-semibold text-canvas focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <div className="page-container flex h-16 items-center justify-between gap-6 lg:h-20">
        <div className="flex items-center gap-6">
          <Logo />
          <span aria-hidden className="hidden h-6 w-px bg-white/10 xl:block" />
          <nav aria-label="Main" className="hidden items-center gap-1 text-sm xl:flex">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors hover:bg-white/5",
                    item.highlight
                      ? "font-semibold text-mint hover:text-primary"
                      : active
                        ? "bg-white/5 text-white"
                        : "text-muted hover:text-white",
                  )}
                >
                  {item.label}
                  {item.highlight && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-mint" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex" aria-hidden>
            <TierBadge tier="free" />
            <TierBadge tier="plus" />
          </div>
          <Link
            href="/login"
            className="hidden px-3 py-1.5 text-sm font-semibold text-white/90 transition-colors hover:text-primary xl:block"
          >
            Log in
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-on-surface transition-colors hover:border-mint/50 xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phone / tablet menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-white/8 bg-canvas/95 backdrop-blur-xl lg:top-20 xl:hidden"
      >
        <nav aria-label="Main mobile" className="page-container flex flex-col gap-1 py-6">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-4 font-display text-lg font-extrabold uppercase tracking-wide transition-colors",
                  active ? "bg-white/5 text-white" : "text-muted hover:bg-white/5 hover:text-white",
                  item.highlight && "text-mint",
                )}
              >
                {item.label}
                {active && <span aria-hidden className="size-2 rounded-full bg-mint" />}
              </Link>
            );
          })}
          <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-6">
            <Button href="/lads-plus" size="lg">
              Join FC Lads+ · $29/mo
            </Button>
            <Button href="/login" variant="glass" size="lg">
              Log in
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
