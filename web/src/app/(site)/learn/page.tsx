import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { ChevronDown, SearchX } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { CategoryNav } from "@/components/learn/CategoryNav";
import { FeaturedGuide } from "@/components/learn/FeaturedGuide";
import { DiscordRequest, PlusBanner } from "@/components/learn/LearnAside";
import { learnHref } from "@/components/learn/learnHref";
import { LearnSearch } from "@/components/learn/LearnSearch";
import { Button } from "@/components/ui/Button";
import { getCreator } from "@/data/creators";
import { countByCategory, getFeaturedGuide, guides, isGuideCategory, PAGE_SIZE, queryGuides } from "@/data/guides";
import { categoryLabels } from "@/lib/format";

const CURRENT_PATCH = "1.08"; // mock; will come from the patches table
const BANNER_AFTER = 6; // upsell banner position in the grid

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Read and validate URL params. Unknown values are ignored rather than erroring. */
async function readParams(searchParams: SearchParams) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const category = first(params.category);
  const q = first(params.q)?.slice(0, 100);
  const limit = Number.parseInt(first(params.limit) ?? "", 10);
  return {
    category: isGuideCategory(category) ? category : undefined,
    q: q?.trim() || undefined,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : PAGE_SIZE,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category } = await readParams(searchParams);
  const title = category ? `${categoryLabels[category]} guides` : "Learn FC: free guides";
  return {
    title,
    description: "Free EA SPORTS FC guides from the FC Lads: tactics, skill moves, meta players, FUT Champs and more.",
    alternates: { canonical: category ? `/learn?category=${category}` : "/learn" },
  };
}

export default async function LearnPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, q, limit } = await readParams(searchParams);
  const { items, total } = queryGuides({ category, q, limit });
  const featured = getFeaturedGuide();
  const showFeatured = !category && !q && featured;
  // Don't repeat the featured guide in the grid below it.
  const gridItems = showFeatured ? items.filter((guide) => guide.slug !== featured.slug) : items;
  const remaining = total - items.length;

  const heading = q ? `Results for “${q}”` : category ? `${categoryLabels[category]} guides` : "Core curriculum";

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]" />

      <header className="page-container relative flex flex-col gap-8 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
        <div className="flex flex-col gap-3">
          <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            Patch {CURRENT_PATCH} verified
          </p>
          <h1 className="text-hero">
            Learn <span className="text-primary">FC</span>
          </h1>
          <p className="text-lg font-semibold text-primary">Free guides. You don&apos;t need to pay us to get better.</p>
        </div>
        <LearnSearch q={q} category={category} />
      </header>

      <div className="page-container relative grid grid-cols-1 gap-8 pb-20 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-6">
            <div className="lg:rounded-2xl lg:border lg:border-white/8 lg:bg-[#0f141b] lg:p-4">
              <CategoryNav active={category} counts={countByCategory()} total={guides.length} q={q} />
            </div>
            <div className="hidden lg:block">
              <DiscordRequest />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:col-span-9">
          {showFeatured && <FeaturedGuide guide={featured} author={getCreator(featured.authorSlug)} />}

          <section aria-labelledby="curriculum-heading" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="curriculum-heading" className="font-display text-xl font-extrabold uppercase lg:text-2xl">
                {heading}
              </h2>
              <p id="guide-count" className="tabular text-xs text-muted uppercase" aria-live="polite">
                Showing {items.length} of {total}
              </p>
            </div>

            {gridItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
                <SearchX aria-hidden className="size-10 text-white/30" />
                <p className="font-display text-lg font-extrabold uppercase">No guides found</p>
                <p className="max-w-sm text-sm text-muted">
                  Try a different word, or ask the Lads to make a guide about it on Discord.
                </p>
                <Button href="/learn" variant="glass" size="sm" className="mt-2">
                  Show all guides
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gridItems.map((guide, index) => (
                  <Fragment key={guide.slug}>
                    {index === BANNER_AFTER && (
                      <div className="sm:col-span-2 xl:col-span-3">
                        <PlusBanner />
                      </div>
                    )}
                    <GuideCard guide={guide} author={getCreator(guide.authorSlug)} className="h-full" />
                  </Fragment>
                ))}
              </div>
            )}

            {remaining > 0 && (
              <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-8">
                <Link
                  href={learnHref({ category, q, limit: limit + PAGE_SIZE })}
                  scroll={false}
                  className="tabular flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-bold uppercase transition-colors hover:border-mint/50 hover:text-mint"
                >
                  Load more guides ({remaining} remaining)
                  <ChevronDown aria-hidden className="size-4" />
                </Link>
              </div>
            )}
          </section>

          <div className="lg:hidden">
            <DiscordRequest />
          </div>
        </div>
      </div>
    </div>
  );
}
