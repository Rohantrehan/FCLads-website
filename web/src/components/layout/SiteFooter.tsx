import Link from "next/link";
import { ShieldMark } from "@/components/layout/Logo";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { cn } from "@/lib/cn";
import { footerNav } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-canvas py-14">
      <div className="page-container flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3" aria-label="FC Lads home">
            <ShieldMark className="size-10" />
            <span className="flex flex-col">
              <span className="font-logo text-[17px] leading-none font-black tracking-wider text-white uppercase">
                FC Lads
              </span>
              <span className="mt-1 text-xs font-medium tracking-wide text-muted">Play Better. Together.</span>
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-white",
                      item.highlight ? "font-medium text-mint" : "text-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <SocialIcons className="-ml-2.5 md:ml-0" />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FC Lads. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            FC Lads is an independent community and is not affiliated with or endorsed by Electronic Arts Inc. or EA
            SPORTS FC.
          </p>
        </div>
      </div>
    </footer>
  );
}
