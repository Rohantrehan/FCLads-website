import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Video } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { currentReview } from "@/data/memberDashboard";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { default: "My Lads+ | FC Lads", template: "%s · My Lads+ | FC Lads" },
  robots: { index: false },
};

// Shell for the member dashboard: tab bar + membership status.
// Each page checks membership itself (layouts don't re-run on every navigation).
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const viewer = await getViewer();
  const reviewsLeft = currentReview.credits.total - currentReview.credits.used;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.75),transparent)]"
      />
      <div className="relative border-b border-white/8">
        <div className="page-container flex flex-col gap-2 pt-6 lg:flex-row lg:items-end lg:justify-between">
          <DashboardNav />
          {viewer.isMember && (
            <div className="flex flex-wrap items-center gap-2 pb-3">
              <span className="tabular flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-mint uppercase">
                <ShieldCheck aria-hidden className="size-3.5" />
                Lads+ active
              </span>
              <Link
                href="/dashboard/review"
                className="tabular flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold text-muted uppercase transition-colors hover:border-primary/40 hover:text-white"
              >
                <Video aria-hidden className="size-3.5" />
                Review: {reviewsLeft} left
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
