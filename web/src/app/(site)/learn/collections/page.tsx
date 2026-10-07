import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { LearningPath } from "@/components/collections/LearningPath";
import { LearnTabs } from "@/components/learn/LearnTabs";
import { Badge } from "@/components/ui/Badge";
import { collections, CURRENT_SEASON, getLearningPath } from "@/data/collections";

export const metadata: Metadata = {
  title: `${CURRENT_SEASON} video collections`,
  description: `Free ${CURRENT_SEASON} video series from FC Lads, in the order we recommend: fundamentals, defending, attacking, meta, tactics and squads.`,
  alternates: { canonical: "/learn/collections" },
};

export default function CollectionsPage() {
  const path = getLearningPath();

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]" />

      <header className="page-container relative flex flex-col gap-3 pt-10 pb-10 lg:pt-14">
        <p className="flex items-center gap-2">
          <Badge tone="solid">{CURRENT_SEASON}</Badge>
          <span className="tabular text-[11px] font-bold tracking-widest text-mint uppercase">
            {collections.length} collections
          </span>
        </p>
        <h1 className="text-hero">
          Learn <span className="text-primary">FC</span>
        </h1>
        <p className="max-w-2xl text-lg font-semibold text-primary">
          Free video series for {CURRENT_SEASON}, in the order we recommend.
        </p>
        <div className="pt-3">
          <LearnTabs active="collections" />
        </div>
      </header>

      <section aria-labelledby="path-heading" className="page-container relative pb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="path-heading" className="flex items-center gap-2 font-display text-xl font-extrabold uppercase">
              <Compass aria-hidden className="size-5 text-primary" />
              New to {CURRENT_SEASON}? Start here
            </h2>
            <p className="mt-1 text-sm text-muted">
              Follow these five in order. Fundamentals first, then the meta, not the other way around.
            </p>
          </div>
        </div>
        <LearningPath steps={path} />
      </section>

      <section aria-labelledby="all-heading" className="page-container relative pb-20">
        <h2 id="all-heading" className="mb-6 font-display text-xl font-extrabold uppercase">
          All {CURRENT_SEASON} collections
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} className="h-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
