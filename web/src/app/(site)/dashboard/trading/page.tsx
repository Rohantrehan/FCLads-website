import type { Metadata } from "next";
import { DashboardHeading, MembersOnly } from "@/components/dashboard/DashboardBits";
import { MemberBrief } from "@/components/trading/MemberBrief";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Trading" };

export default async function DashboardTradingPage() {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  return (
    <>
      <div className="page-container pt-10 pb-8">
        <DashboardHeading
          eyebrow="Trading"
          title="This week's market"
          description="The full weekly trading brief: what we're watching, buy and sell targets, events and the market index."
        />
      </div>
      <MemberBrief />
    </>
  );
}
