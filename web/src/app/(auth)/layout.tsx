import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

// Focused shell for log in / sign up: logo and a way back, no full navigation.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgb(14_42_34/0.9),transparent)]" />
        <div className="absolute -top-20 left-1/4 h-[1100px] w-px rotate-[30deg] bg-gradient-to-b from-transparent via-mint/20 to-transparent" />
        <div className="absolute -top-20 right-1/4 h-[1100px] w-px -rotate-[30deg] bg-gradient-to-b from-transparent via-azure/15 to-transparent" />
      </div>
      <header className="page-container relative flex h-16 items-center justify-between lg:h-20">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to site
        </Link>
      </header>
      <main id="main" className="page-container relative flex flex-1 items-start justify-center py-8 sm:items-center">
        {children}
      </main>
    </div>
  );
}
