import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { canRunReviews, getViewer } from "@/lib/viewer";

// Shared shell for all public pages: header + main + footer.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  return (
    <>
      <SiteHeader
        account={
          viewer.isSignedIn
            ? { name: viewer.name ?? "Lad", isMember: viewer.isMember, isCreator: canRunReviews(viewer) }
            : undefined
        }
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
