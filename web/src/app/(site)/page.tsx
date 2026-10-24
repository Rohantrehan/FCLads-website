import { FeedPreview } from "@/components/home/FeedPreview";
import { HardTruth } from "@/components/home/HardTruth";
import { Hero } from "@/components/home/Hero";
import { LadsPlusTeaser } from "@/components/home/LadsPlusTeaser";
import { LearnSection } from "@/components/home/LearnSection";
import { MeetTheLads } from "@/components/home/MeetTheLads";
import { MembershipCta } from "@/components/home/MembershipCta";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { SITE_NAME, SITE_URL, absoluteUrl, jsonLd, organization, pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const season = (await getContent()).settings.currentSeason;
  const meta = pageMeta({
    title: `FC Lads — ${season} Ultimate Team guides, trading tips & meta tactics`,
    description: `Get better at EA SPORTS ${season} Ultimate Team with pro FC creators: meta tactics, trading tips, Weekend League advice and monthly gameplay reviews. Football (soccer) players from the UK, US, Canada and beyond.`,
    path: "/",
  });
  return { ...meta, title: { absolute: meta.title as string } };
}

export default async function HomePage() {
  const content = await getContent();
  const { creators } = content;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(organization, {
          "@type": "WebSite",
          "@id": absoluteUrl("/#website"),
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "en",
          publisher: { "@id": organization["@id"] },
        })}
      />
      {/* Card pictures from the posting board (Cards); an empty slot shows the creator in that roster spot. */}
      <Hero creators={creators.slice(0, 3)} pictures={content.settings.cards.home} patch={content.settings.currentPatch} />
      {content.settings.hardTruth.length > 0 && (
        <HardTruth
          items={content.settings.hardTruth}
          creators={creators.map(({ slug, name, initials, role }) => ({ slug, name, initials, role }))}
        />
      )}
      <LearnSection guides={content.guides.filter((guide) => !guide.isFeatured).slice(0, 4)} creators={creators} />
      <LadsPlusTeaser />
      <MeetTheLads creators={creators} />
      <FeedPreview />
      <MembershipCta />
    </>
  );
}
