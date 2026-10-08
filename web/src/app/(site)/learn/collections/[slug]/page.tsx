import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, ListVideo, LogIn, Play } from "lucide-react";
import { badgeInfo, CollectionCard, PlaylistThumb } from "@/components/collections/CollectionCard";
import { CollectionPlayer } from "@/components/collections/CollectionPlayer";
import { LearningPath } from "@/components/collections/LearningPath";
import { GuideCard } from "@/components/cards/GuideCard";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Paywall } from "@/components/ui/Paywall";
import { collections, getCollection, getLearningPath } from "@/data/collections";
import { getCreator } from "@/data/creators";
import { guides } from "@/data/guides";
import { ladsPlus } from "@/data/ladsPlus";
import { getCollectionView } from "@/lib/collectionAccess";
import { categoryLabels } from "@/lib/format";
import { getViewer } from "@/lib/viewer";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const collection = getCollection((await params).slug);
  if (!collection) return {};
  return {
    title: `${collection.title} (${collection.season})`,
    description: collection.description,
    alternates: { canonical: `/learn/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();

  const path = getLearningPath();
  const stepIndex = path.findIndex((step) => step.slug === collection.slug);
  const next = stepIndex >= 0 ? path[stepIndex + 1] : undefined;
  const badge = collection.badge ? badgeInfo[collection.badge] : undefined;

  // Video links are only included for members (decided on the server).
  const view = getCollectionView(collection, await getViewer());
  const remaining = Math.max(collection.videoCount - view.episodes.length, 0);

  const related = collection.category
    ? guides.filter((guide) => guide.category === collection.category).slice(0, 3)
    : [];
  const more = collections
    .filter((other) => other.slug !== collection.slug && other.pathStep === undefined)
    .slice(0, 4);

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_70%_60%_at_25%_0%,rgb(14_42_34/0.8),transparent)]" />

      <header className="page-container relative flex flex-col gap-8 pt-8 pb-12">
        <nav aria-label="Breadcrumb">
          <ol className="tabular flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <li>
              <Link href="/learn" className="hover:text-white">
                Learn
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link href="/learn/collections" className="hover:text-white">
                Collections
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="max-w-[16rem] truncate text-white/80">
              {collection.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <PlaylistThumb count={collection.videoCount} className="lg:col-span-5" />

          <div className="flex flex-col gap-4 lg:col-span-7">
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone="solid">{collection.season}</Badge>
              {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
              {collection.pathStep && (
                <Badge tone="azure">
                  Step {collection.pathStep} of {path.length}
                </Badge>
              )}
            </p>
            <h1 className="font-display text-3xl leading-tight font-extrabold uppercase md:text-5xl">{collection.title}</h1>
            <p className="max-w-2xl text-lg text-muted">{collection.description}</p>
            <p className="tabular flex flex-wrap items-center gap-4 text-xs text-muted uppercase">
              <span className="flex items-center gap-1.5">
                <ListVideo aria-hidden className="size-4 text-primary" />
                {collection.videoCount} {collection.videoCount === 1 ? "video" : "videos"}
              </span>
              {collection.category && (
                <Link href={`/learn?category=${collection.category}`} className="hover:text-white">
                  {categoryLabels[collection.category]}
                </Link>
              )}
              <TierBadge tier="plus" />
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {view.isLocked ? (
                <>
                  <Button href={JOIN_HREF} variant="primary">
                    Join FC Lads+ to watch
                    <span className="tabular text-xs opacity-80">{ladsPlus.priceLabel}/mo</span>
                  </Button>
                  <Button href="/login" variant="glass">
                    <LogIn aria-hidden className="size-4" />
                    Log in
                  </Button>
                </>
              ) : (
                <Button href="#watch" variant="primary">
                  <Play aria-hidden className="size-4 fill-current" />
                  Start watching
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {stepIndex >= 0 && (
        <section aria-labelledby="path-heading" className="page-container pb-12">
          <h2 id="path-heading" className="text-label mb-4 text-muted">
            Start here path
          </h2>
          <LearningPath steps={path} current={collection.slug} />
        </section>
      )}

      <section id="watch" aria-labelledby="videos-heading" className="page-container scroll-mt-24 pb-16">
        <h2 id="videos-heading" className="mb-5 font-display text-xl font-extrabold uppercase">
          Watch the series
        </h2>
        <CollectionPlayer
          episodes={view.episodes}
          isLocked={view.isLocked}
          remaining={remaining}
          inOrder={collection.badge === "in-order"}
        />

        {view.isLocked && (
          <div id="members-only" className="mt-10 scroll-mt-28">
            <Paywall
              eyebrow="FC Lads+ video series"
              title="This collection is for FC Lads+ members"
              description="Our free videos stay on YouTube. Every collection here is members-only: watch the full series in order, right on FC Lads, with the guides that go with it."
            />
          </div>
        )}

        {next && (
          <Link
            href={`/learn/collections/${next.slug}`}
            className="group mt-8 flex items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-pitch-green p-5 transition-colors hover:border-primary"
          >
            <span className="flex flex-col">
              <span className="text-label text-mint">Next in the path · Step {next.pathStep}</span>
              <span className="mt-1 font-display text-lg font-extrabold uppercase">{next.title}</span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </section>

      {related.length > 0 && collection.category && (
        <section aria-labelledby="related-heading" className="border-t border-white/6 bg-surface py-14">
          <div className="page-container flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="related-heading" className="font-display text-xl font-extrabold uppercase">
                Related {categoryLabels[collection.category].toLowerCase()} guides
              </h2>
              <Link
                href={`/learn?category=${collection.category}`}
                className="text-label flex items-center gap-1.5 text-primary hover:text-white"
              >
                All {categoryLabels[collection.category].toLowerCase()} guides
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} author={getCreator(guide.authorSlug)} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="more-heading" className="page-container py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="more-heading" className="font-display text-xl font-extrabold uppercase">
            More collections
          </h2>
          <Link href="/learn/collections" className="text-label flex items-center gap-1.5 text-primary hover:text-white">
            All collections
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((other) => (
            <CollectionCard key={other.slug} collection={other} className="h-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
