import type { Metadata } from "next";
import { TaxCalculator } from "@/components/trading/TaxCalculator";
import { TradingDisclaimer } from "@/components/trading/TradingDisclaimer";
import { TradingFeed } from "@/components/trading/TradingFeed";
import { getContent } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const season = (await getContent()).settings.currentSeason;
  return pageMeta({
    title: `${season} trading tips: Ultimate Team market picks & coin making`,
    description: `Daily ${season} Ultimate Team trading posts from the FC Lads creators: players to invest in, when to sell, promo and TOTW market moves, plus a free EA tax calculator.`,
    path: "/trading",
  });
}

export default async function TradingPage({ searchParams }: PageProps<"/trading">) {
  const viewer = await getViewer();

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,color-mix(in_oklab,var(--color-pitch-green)_80%,transparent),transparent)]"
      />

      <header className="page-container relative flex flex-col gap-3 pt-10 pb-8 lg:pt-14">
        <h1 className="text-hero">Trading</h1>
        <p className="text-lg font-semibold text-primary">Market calls from the Lads, as they happen.</p>
      </header>

      <div className="page-container relative grid grid-cols-1 gap-8 pb-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <TradingFeed
            content={await getContent()}
            viewer={viewer}
            basePath="/trading"
            searchParams={await searchParams}
          />
        </div>
        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <TaxCalculator />
            <TradingDisclaimer />
          </div>
        </aside>
      </div>
    </div>
  );
}
