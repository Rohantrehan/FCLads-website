import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";

// Root-level 404: used for any URL that doesn't match a route. Includes the site shell so users can navigate on.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page-container flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-24">
          <span className="tabular text-xs font-bold tracking-widest text-mint uppercase">
            Error 404 // Off the pitch
          </span>
          <h1 className="text-hero">This page isn&apos;t built yet.</h1>
          <p className="max-w-xl text-lg text-muted">
            We&apos;re building FC Lads one page at a time. This one is coming
            soon.
          </p>
          <Button href="/" size="lg">
            Back to home
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
