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
import { Avatar, CoinPrice } from "@/components/ui/DataBits";
import { Paywall } from "@/components/ui/Paywall";
import { getCreator } from "@/data/creators";
import { getGuideContent } from "@/data/guideContent";
import { getGuide, guides } from "@/data/guides";
import { getPlayer } from "@/data/players";
import { categoryLabels } from "@/lib/format";
import { getGuideView } from "@/lib/guideAccess";
import { getViewer } from "@/lib/viewer";
import type { Guide, Player } from "@/types";

type Params = Promise<{ slug: string }>;

// Pre-build every guide at build time. Unknown slugs show the 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.excerpt, publishedTime: guide.publishedAt },
  };
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

function relatedGuides(guide: Guide, count = 3) {
  const others = guides.filter((other) => other.slug !== guide.slug);
  const sameCategory = others.filter((other) => other.category === guide.category);
  const rest = others.filter((other) => other.category !== guide.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export default async function GuidePage({ params }: { params: Params }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const content = getGuideContent(guide.slug);
  const viewer = await getViewer();
  const view = getGuideView(guide, content, viewer);
  const author = getCreator(guide.authorSlug);
  const players = (content?.playerSlugs ?? []).map(getPlayer).filter((player): player is Player => !!player);
  const hasVideo = guide.format === "video" || !!guide.video;
  const published = dateFormat.format(new Date(guide.publishedAt));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.publishedAt,
    author: author ? { "@type": "Person", name: author.name } : undefined,
    publisher: { "@type": "Organization", name: "FC Lads" },
    isAccessibleForFree: guide.access === "free" && !view.isLocked,
  };

  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgb(14_42_34/0.8),transparent)]" />

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
              <div id="members-only" className="relative mt-4 scroll-mt-28">
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
                    guide.access === "plus" ? "This guide is for FC Lads+ members" : "This guide continues for FC Lads+ members"
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

              {players.length > 0 && (
                <section aria-labelledby="players-heading" className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface p-5">
                  <h2 id="players-heading" className="font-display text-sm font-extrabold uppercase">
                    Players in this guide
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {players.map((player) => (
                      <li key={player.slug}>
                        <Link
                          href={`/players/${player.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-surface-container p-3 transition-colors hover:bg-surface-high"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg bg-surface-highest font-display font-extrabold text-mint">
                              {player.ovr}
                            </span>
                            <span>
                              <span className="block text-sm font-bold">{player.cardName ?? player.name}</span>
                              <span className="tabular text-[11px] text-muted">
                                {player.position}
                                {player.playstyles?.[0] && <span className="text-primary"> · {player.playstyles[0]}</span>}
                              </span>
                            </span>
                          </span>
                          {player.price !== undefined && <CoinPrice value={player.price} compact className="text-sm" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {content?.presetCode && !view.isLocked && (
                <section aria-labelledby="preset-heading" className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface p-5">
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
              <p className="tabular text-[11px] font-bold tracking-widest text-mint uppercase">Continue your training</p>
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
            {relatedGuides(guide).map((related) => (
              <GuideCard key={related.slug} guide={related} author={getCreator(related.authorSlug)} className="h-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
