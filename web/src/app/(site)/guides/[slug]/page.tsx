import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronRight, Clock, FileText } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { CopyCode } from "@/components/guide/CopyCode";
import { GuideBlocks } from "@/components/guide/GuideBlocks";
import { TableOfContents } from "@/components/guide/TableOfContents";
import { VideoFacade } from "@/components/guide/VideoFacade";
import { ShareButton } from "@/components/learn/ShareButton";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/DataBits";
import { Paywall } from "@/components/ui/Paywall";
import { getContent, getGuideContent, type Content } from "@/lib/content";
import { categoryLabels } from "@/lib/format";
import { absoluteUrl, breadcrumbs, jsonLd, organization, pageMeta } from "@/lib/seo";
import { getGuideView } from "@/lib/guideAccess";
import { getViewer } from "@/lib/viewer";
import type { Guide } from "@/types";

type Params = Promise<{ slug: string }>;

// Pre-built at deploy; guides published later on the posting board are built on their first visit.
// Unknown slugs show the 404 page.
export async function generateStaticParams() {
  return (await getContent()).guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = (await getContent()).getGuide((await params).slug);
  if (!guide) return {};
  return pageMeta({ title: guide.title, description: guide.excerpt, path: `/guides/${guide.slug}`, type: "article", publishedTime: guide.publishedAt, ownImage: true });
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Colours the `highlight` words of the title green. */
function Title({ title, highlight }: { title: string; highlight?: string }) {
  const start = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (!highlight || start < 0) return <>{title}</>;
  const end = start + highlight.length;
  return (
    <>
      {title.slice(0, start)}
      <span className="text-primary">{title.slice(start, end)}</span>
      {title.slice(end)}
    </>
  );
}

function relatedGuides(guides: Content["guides"], guide: Guide, count = 3) {
  const others = guides.filter((other) => other.slug !== guide.slug);
  const sameCategory = others.filter((other) => other.category === guide.category);
  const rest = others.filter((other) => other.category !== guide.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export default async function GuidePage({ params }: { params: Params }) {
  const site = await getContent();
  const { guides, getCreator } = site;
  const guide = site.getGuide((await params).slug);
  if (!guide) notFound();

  const content = await getGuideContent(guide.slug);
  const viewer = await getViewer();
  const view = getGuideView(guide, content, viewer);
  const author = getCreator(guide.authorSlug);
  const hasVideo = guide.format === "video" || !!guide.video;
  const published = dateFormat.format(new Date(guide.publishedAt));

  // The members-only part is marked (Google's paywalled-content markup) so the free part can be indexed
  // without it looking like cloaking.
  const path = `/guides/${guide.slug}`;
  const structuredData = jsonLd(
    {
      "@type": "Article",
      headline: guide.title,
      description: guide.excerpt,
      url: absoluteUrl(path),
      mainEntityOfPage: absoluteUrl(path),
      image: guide.image ?? absoluteUrl("/opengraph-image"),
      datePublished: guide.publishedAt,
      articleSection: categoryLabels[guide.category],
      inLanguage: "en",
      author: author ? { "@type": "Person", name: author.name, url: absoluteUrl(`/creators/${author.slug}`) } : undefined,
      publisher: organization,
      isAccessibleForFree: !view.isLocked,
      ...(view.isLocked ? { hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: ".members-only" } } : {}),
    },
    breadcrumbs([
      ["Learn", "/learn"],
      [categoryLabels[guide.category], `/learn?category=${guide.category}`],
      [guide.title, path],
    ]),
  );

  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredData} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,color-mix(in_oklab,var(--color-pitch-green)_80%,transparent),transparent)]"
      />

      <article className="relative">
        <header className="page-container flex flex-col gap-5 pt-8 pb-8">
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
                <Link href={`/learn?category=${guide.category}`} className="hover:text-white">
                  {categoryLabels[guide.category]}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="max-w-[16rem] truncate text-white/80">
                {guide.title}
              </li>
            </ol>
          </nav>

          <p className="flex flex-wrap items-center gap-2">
            <Badge tone="solid">{categoryLabels[guide.category]}</Badge>
            {content?.patch && <Badge tone="azure">Patch {content.patch} verified</Badge>}
            <TierBadge tier={guide.access} />
          </p>

          <h1 className="max-w-5xl font-display text-4xl leading-[1.05] font-extrabold tracking-wide uppercase md:text-5xl lg:text-6xl">
            <Title title={guide.title} highlight={content?.highlight} />
          </h1>
          <p className="max-w-3xl text-lg text-muted">{guide.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-5">
            {author && (
              <Link href={`/creators/${author.slug}`} className="group flex items-center gap-3">
                <Avatar initials={author.initials} tone="mint" size="lg" />
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 font-bold group-hover:text-mint">
                    {author.name}
                    <Badge tone="mint">Pro creator</Badge>
                  </span>
                  <span className="text-sm text-muted">{author.role}</span>
                </span>
              </Link>
            )}
            <div className="tabular flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                {guide.format === "video" ? (
                  <Clock aria-hidden className="size-4" />
                ) : (
                  <FileText aria-hidden className="size-4" />
                )}
                {guide.minutes} min {guide.format === "video" ? "video" : "read"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4" />
                <time dateTime={guide.publishedAt}>{published}</time>
              </span>
              <ShareButton path={`/guides/${guide.slug}`} title={guide.title} />
            </div>
          </div>
        </header>

        {hasVideo && (
          <div className="page-container pb-10">
            <VideoFacade video={view.video} locked={view.isLocked} title={guide.title} minutes={guide.minutes} />
          </div>
        )}

        <div className="page-container grid grid-cols-1 gap-10 pb-20 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            {content?.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-lg leading-relaxed text-on-surface first:text-xl">
                {paragraph}
              </p>
            ))}

            <GuideBlocks blocks={view.blocks} />

            {!content && (
              <p className="rounded-xl border border-dashed border-white/15 p-6 text-muted">
                The full written breakdown for this guide is coming soon.
                {hasVideo && " Watch the video above in the meantime."}
              </p>
            )}

            {view.isLocked && (
              <div id="members-only" className="members-only relative mt-4 scroll-mt-28">
                {view.teaser && (
                  <p
                    aria-hidden
                    className="pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)] pb-10 text-[17px] leading-relaxed text-muted blur-[2px] select-none"
                  >
                    {view.teaser}
                  </p>
                )}
                <Paywall
                  eyebrow="FC Lads+ exclusive deep dive"
                  title={
                    guide.access === "plus"
                      ? "This guide is for FC Lads+ members"
                      : "This guide continues for FC Lads+ members"
                  }
                  description="Every guide and video series on FC Lads is part of FC Lads+. Unlock the full step-by-step breakdown, custom slider codes, the video and the private Discord coaching channels."
                  className={view.teaser ? "-mt-16" : undefined}
                />
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              {view.toc.length > 0 && <TableOfContents items={view.toc} />}

              {content?.presetCode && !view.isLocked && (
                <section
                  aria-labelledby="preset-heading"
                  className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface p-5"
                >
                  <h2 id="preset-heading" className="font-display text-sm font-extrabold uppercase">
                    Custom tactic code
                  </h2>
                  <CopyCode code={content.presetCode} />
                  <p className="text-xs text-muted">Paste it into Custom Tactics in-game to import this setup.</p>
                </section>
              )}
            </div>
          </aside>
        </div>
      </article>

      <section aria-labelledby="related-heading" className="border-t border-white/6 bg-surface py-16">
        <div className="page-container flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tabular text-[11px] font-bold tracking-widest text-mint uppercase">
                Continue your training
              </p>
              <h2 id="related-heading" className="text-headline mt-1">
                Keep learning
              </h2>
            </div>
            <Link
              href="/learn"
              className="text-label flex items-center gap-1.5 text-primary transition-colors hover:text-white"
            >
              Browse all {guides.length} guides
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGuides(guides, guide).map((related) => (
              <GuideCard
                key={related.slug}
                guide={related}
                author={getCreator(related.authorSlug)}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
