import type { Metadata } from "next";
import { Headset } from "lucide-react";
import { AccountNav } from "@/components/account/AccountNav";
import { LEGAL_EMAIL } from "@/data/legal";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { default: "Account | FC Lads", template: "%s · Account | FC Lads" },
  robots: { index: false },
};

// Shell for the account pages: side menu + support card.
// Each page checks the viewer itself (layouts don't re-run on every navigation).
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return <div className="page-container py-16">{children}</div>;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.75),transparent)]"
      />
      <div className="page-container relative grid grid-cols-1 gap-8 pt-10 pb-20 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-3">
          <div className="lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-4">
            <AccountNav active={viewer.isMember} />
            <section
              aria-labelledby="support-heading"
              className="mt-4 hidden flex-col gap-2 rounded-2xl border border-white/8 bg-[#0f141b] p-5 text-sm lg:mt-0 lg:flex"
            >
              <h2 id="support-heading" className="text-label flex items-center gap-2 text-mint">
                <Headset aria-hidden className="size-4" />
                Member support
              </h2>
              <p className="text-muted">
                Questions about your plan or a payment? Ask in <span className="text-white">#help</span> on Discord or
                email{" "}
                <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary hover:text-white">
                  {LEGAL_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
