import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BoardNav } from "@/components/board/BoardNav";
import { requireBoardPage } from "@/lib/board/access";

export const metadata: Metadata = {
  title: { default: "Posting board", template: "%s · Posting board | FC Lads" },
  robots: { index: false, follow: false },
};

/**
 * The hidden posting board, where creators and admins write everything on the site.
 * Served only at /<BOARD_PATH> (src/proxy.ts rewrites it here); anyone who isn't a creator or admin gets the normal 404.
 */
export default async function BoardLayout({ children }: LayoutProps<"/posting-board">) {
  const { staff, base } = await requireBoardPage();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-white/8 bg-[#0b0f15]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href={base} className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-extrabold text-on-primary">
              FC
            </span>
            <span className="font-display text-sm font-extrabold uppercase">
              FC Lads <span className="text-mint">Posting board</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">
              {staff.name} · <span className="text-on-surface">{staff.isAdmin ? "Admin" : "Creator"}</span>
            </span>
            <Link href="/" className="text-label flex items-center gap-1 text-primary hover:text-white">
              View site
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <aside className="lg:sticky lg:top-10 lg:w-56 lg:shrink-0 lg:self-start">
          <BoardNav base={base} isAdmin={staff.isAdmin} />
        </aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
