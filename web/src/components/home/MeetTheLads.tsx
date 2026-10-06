import { ArrowRight } from "lucide-react";
import { CreatorTile, OpenSlotTile } from "@/components/cards/CreatorTile";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Panel";
import type { Creator } from "@/types";

export function MeetTheLads({ creators }: { creators: Creator[] }) {
  return (
    <section aria-labelledby="lads-heading" className="page-container py-20">
      <SectionHeading
        eyebrow="Verified competitors"
        title={<span id="lads-heading">Meet the Lads</span>}
        action={
          <Button href="/creators" variant="ghost" size="sm" className="px-0">
            Meet the whole crew
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
        {creators.map((creator) => (
          <CreatorTile key={creator.slug} creator={creator} />
        ))}
        <OpenSlotTile className="col-span-2 min-h-48 lg:col-span-1" />
      </div>
    </section>
  );
}
