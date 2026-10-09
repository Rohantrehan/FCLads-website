import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getViewer } from "@/lib/viewer";

// Shared shell for all public pages: header + main + footer.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  return (
    <>
      <SiteHeader member={viewer.isMember ? { name: viewer.name ?? "Member" } : undefined} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
