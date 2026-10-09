import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, Clock } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { DashboardHeading, MembersOnly, PanelLink } from "@/components/dashboard/DashboardBits";
import { VideoFacade } from "@/components/guide/VideoFacade";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/DataBits";
import { collections } from "@/data/collections";
import { getCreator } from "@/data/creators";
import { countByCategory, getFeaturedGuide, guides, isGuideCategory } from "@/data/guides";
import { CURRENT_PATCH } from "@/data/meta";
import { cn } from "@/lib/cn";
import { categoryLabels } from "@/lib/format";
import { getViewer } from "@/lib/viewer";
import type { GuideCategory } from "@/types";

export const metadata: Metadata = { title: "Gameplay" };

const categoryHref = (category?: GuideCategory) =>
  category ? `/dashboard/gameplay?category=${category}#library` : "/dashboard/gameplay#library";

export default async function DashboardGameplayPage({ searchParams }: PageProps<"/dashboard/gameplay">) {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;

  const { category: raw } = await searchParams;
  const category = isGuideCategory(raw) ? raw : undefined;
  // Feature the newest video (the player needs a video); fall back to the featured guide.
  const featured = guides.find((guide) => guide.format === "video") ?? getFeaturedGuide();
  const author = featured && getCreator(featured.authorSlug);
  const counts = countByCategory();
  const categories = (Object.keys(categoryLabels) as GuideCategory[]).filter((key) => counts[key]);
  const list = guides.filter((guide) => !category || guide.category === category);

  return (
    <div className="page-container flex flex-col gap-10 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Gameplay"
        title="Video library"
        description={`Every FC Lads+ guide and video, tested on patch ${CURRENT_PATCH}. Pick up where you left off or find something new.`}
        aside={
          <p className="tabular flex items-center gap-2 text-xs text-muted uppercase">
            <BookOpen aria-hidden className="size-4 text-primary" />
            {guides.length} guides & videos
          </p>
        }
      />

      {featured && (
        <section
          aria-labelledby="featured-heading"
          className="grid grid-cols-1 gap-6 rounded-2xl border border-primary/25 bg-[#0f141b] p-4 md:p-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <VideoFacade video={featured.video} title={featured.title} minutes={featured.minutes} />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:justify-center">
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone="mint">Featured</Badge>
              <Badge>{categoryLabels[featured.category]}</Badge>
              <span className="tabular flex items-center gap-1 text-[11px] text-muted">
                <Clock aria-hidden className="size-3" />
                {featured.minutes} min
              </span>
            </p>
            <h2
              id="featured-heading"
              className="font-display text-2xl leading-tight font-extrabold uppercase md:text-3xl"
            >
              {featured.title}
            </h2>
            <p className="text-muted">{featured.excerpt}</p>
            {author && (
              <p className="flex items-center gap-3">
                <Avatar initials={author.initials} tone="mint" />
                <span className="flex flex-col">
                  <span className="text-sm font-bold">{author.name}</span>
                  <span className="text-xs text-muted">{author.role}</span>
                </span>
              </p>
            )}
            <Link
              href={`/guides/${featured.slug}`}
              className="text-label flex items-center gap-2 text-primary transition-colors hover:text-white"
            >
              Open the full guide
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </section>
      )}

      <section id="library" aria-labelledby="library-heading" className="flex scroll-mt-28 flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="library-heading" className="font-display text-xl font-extrabold uppercase">
            {category ? categoryLabels[category] : "All guides"}
            <span className="tabular ml-2 text-sm text-muted">{list.length}</span>
          </h2>
        </div>
        <nav aria-label="Guide categories" className="scrollbar-none -mx-4 overflow-x-auto px-4">
          <ul className="flex w-max gap-2">
            {[undefined, ...categories].map((key) => {
              const current = key === category;
              return (
                <li key={key ?? "all"}>
                  <Link
                    href={categoryHref(key)}
                    scroll={false}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      current
                        ? "border-primary bg-primary text-on-primary"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-white",
                    )}
                  >
                    {key ? categoryLabels[key] : "All"}
                    <span className={cn("tabular text-[11px]", current ? "text-on-primary/70" : "text-muted/70")}>
                      {key ? counts[key] : guides.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((guide) => (
            <li key={guide.slug} className="flex">
              <GuideCard guide={guide} author={getCreator(guide.authorSlug)} unlocked className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="series-heading" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="series-heading" className="flex items-center gap-2 font-display text-xl font-extrabold uppercase">
            <Clapperboard aria-hidden className="size-5 text-primary" />
            Video collections
          </h2>
          <PanelLink href="/learn/collections">All collections</PanelLink>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 3).map((collection) => (
            <li key={collection.slug} className="flex">
              <CollectionCard collection={collection} className="w-full" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
