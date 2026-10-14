"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { logOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/layout/Logo";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";
import { isActive, mainNav } from "@/lib/site";

/** `account` is set when someone is signed in (decided on the server by the layout). */
export function SiteHeader({ account }: { account?: { name: string; isMember: boolean; isCreator?: boolean } }) {
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
    <header className="sticky top-0 z-50 print:hidden border-b border-white/8 bg-canvas/80 backdrop-blur-xl">
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
          {account?.isCreator && (
            <Link
              href="/creator"
              aria-current={isActive(pathname, "/creator") ? "page" : undefined}
              className="hidden rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold transition-colors hover:border-gold/60 xl:block"
            >
              Creator hub
            </Link>
          )}
          {account ? (
            <Link
              href={account.isMember ? "/dashboard" : "/account"}
              aria-current={isActive(pathname, account.isMember ? "/dashboard" : "/account") ? "page" : undefined}
              className={cn(
                "hidden items-center gap-2 rounded-lg border py-1 pr-3 pl-1 text-sm font-semibold transition-colors xl:flex",
                account.isMember
                  ? "border-primary/30 bg-primary/10 text-mint hover:border-primary/60"
                  : "border-white/10 bg-white/5 text-white/90 hover:border-white/25",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-7 items-center justify-center rounded-md font-display text-xs font-extrabold",
                  account.isMember ? "bg-primary text-on-primary" : "bg-white/10 text-white",
                )}
              >
                {account.name.charAt(0).toUpperCase()}
              </span>
              {account.isMember ? "My Lads+" : "Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden px-3 py-1.5 text-sm font-semibold text-white/90 transition-colors hover:text-primary xl:block"
            >
              Log in
            </Link>
          )}
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
            {account ? (
              <>
                {account.isMember ? (
                  <Button href="/dashboard" size="lg">
                    My Lads+ dashboard
                  </Button>
                ) : (
                  <Button href="/lads-plus" size="lg">
                    Start {ladsPlus.trialDays}-day free trial
                  </Button>
                )}
                {account.isCreator && (
                  <Button href="/creator" variant="glass" size="lg">
                    Creator hub
                  </Button>
                )}
                <Button href="/account" variant="glass" size="lg">
                  {account.isMember ? "Account & billing" : "My account"}
                </Button>
                <form action={logOut} className="flex">
                  <Button type="submit" variant="danger" size="lg" className="w-full">
                    <LogOut aria-hidden className="size-4" />
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button href="/lads-plus" size="lg">
                  Join FC Lads+ · {ladsPlus.priceLabel}/mo
                </Button>
                <Button href="/login" variant="glass" size="lg">
                  Log in
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
