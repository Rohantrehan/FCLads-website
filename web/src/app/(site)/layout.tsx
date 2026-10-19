import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPlus } from "@/lib/content";

// Shared shell for all public pages: header + main + footer. It doesn't read the login (the header asks
// from the browser), so pages that don't lock anything are built ahead and served from the CDN.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const plus = await getPlus();
  return (
    <>
      <SiteHeader plus={plus} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
