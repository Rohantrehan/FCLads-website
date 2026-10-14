import type { Metadata } from "next";
import { DashboardHeading, MembersOnly } from "@/components/dashboard/DashboardBits";
import { TaxCalculator } from "@/components/trading/TaxCalculator";
import { TradingDisclaimer } from "@/components/trading/TradingDisclaimer";
import { TradingFeed } from "@/components/trading/TradingFeed";
import { getContent } from "@/lib/content";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Trading" };

export default async function DashboardTradingPage({ searchParams }: PageProps<"/dashboard/trading">) {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Trading"
        title="Trading posts"
        description="Every market call from the Lads, members-only posts included."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <TradingFeed
            content={await getContent()}
            viewer={viewer}
            basePath="/dashboard/trading"
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
