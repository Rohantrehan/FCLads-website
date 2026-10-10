"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { NotYetButton } from "./NotYetButton";

const items = [
  { label: "Membership", href: "/account/membership", icon: ShieldCheck },
  { label: "Billing", href: "/account/billing", icon: CreditCard },
];

/** Side menu for the account pages. Sideways tabs on phones, a column from lg up. */
export function AccountNav({ active }: { active?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#0f141b] p-3">
      <ul className="grid grid-cols-2 gap-1 lg:grid-cols-1">
        {items.map(({ label, href, icon: Icon }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 font-semibold transition-colors",
                  current
                    ? "border-primary/40 bg-primary/10 text-white"
                    : "border-transparent text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon aria-hidden className={cn("size-5 shrink-0", current && "text-primary")} />
                {label}
                {label === "Membership" && active && (
                  <span className="text-label ml-auto hidden rounded bg-primary px-1.5 py-0.5 text-on-primary sm:inline">
                    Active
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-1 border-t border-white/8 pt-2 sm:flex-row lg:flex-col">
        <Link
          href="/dashboard"
          className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft aria-hidden className="size-4" />
          My Lads+ dashboard
        </Link>
        <NotYetButton
          note="Log out arrives with accounts"
          className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-danger-soft transition-colors hover:bg-danger/10"
          icon="logout"
        >
          Log out
        </NotYetButton>
      </div>
    </nav>
  );
}
