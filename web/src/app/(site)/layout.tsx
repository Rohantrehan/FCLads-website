import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getViewer } from "@/lib/viewer";

// Shared shell for all public pages: header + main + footer.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  return (
    <>
      <SiteHeader
        account={viewer.isSignedIn ? { name: viewer.name ?? "Lad", isMember: viewer.isMember } : undefined}
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
