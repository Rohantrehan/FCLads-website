import { ArrowRight } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Panel";
import { getCreator } from "@/data/creators";
import type { Guide } from "@/types";

export function LearnSection({ guides }: { guides: Guide[] }) {
  return (
    <section aria-labelledby="learn-heading" className="page-container py-20 lg:py-24">
      <SectionHeading
        eyebrow="Free curriculum"
        title={<span id="learn-heading">Learn FC</span>}
        description="Free guides. You don't need to pay us to get better."
        action={
          <Button href="/learn" variant="glass" size="sm">
            Explore free guides
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      />
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} author={getCreator(guide.authorSlug)} />
        ))}
      </div>
    </section>
  );
}
