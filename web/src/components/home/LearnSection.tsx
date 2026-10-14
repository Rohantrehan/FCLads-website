import { ArrowRight } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Panel";
import type { Creator, Guide } from "@/types";

export function LearnSection({ guides, creators }: { guides: Guide[]; creators: Creator[] }) {
  return (
    <section aria-labelledby="learn-heading" className="page-container py-20 lg:py-24">
      <SectionHeading
        eyebrow="FC Lads+ curriculum"
        title={<span id="learn-heading">Learn FC</span>}
        description="Our free videos are on YouTube. The full guides and video series live here, for FC Lads+ members."
        action={
          <Button href="/learn" variant="glass" size="sm">
            Explore the guides
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      />
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} author={creators.find((creator) => creator.slug === guide.authorSlug)} />
        ))}
      </div>
    </section>
  );
}
