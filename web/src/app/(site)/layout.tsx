import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPlus } from "@/lib/content";
import { canRunReviews, getViewer } from "@/lib/viewer";

// Shared shell for all public pages: header + main + footer.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [viewer, plus] = await Promise.all([getViewer(), getPlus()]);
  return (
    <>
      <SiteHeader
        account={
          viewer.isSignedIn
            ? { name: viewer.name ?? "Lad", isMember: viewer.isMember, isCreator: canRunReviews(viewer) }
            : undefined
        }
        plus={plus}
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
