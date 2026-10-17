import { FeedPreview } from "@/components/home/FeedPreview";
import { HardTruth } from "@/components/home/HardTruth";
import { Hero } from "@/components/home/Hero";
import { LadsPlusTeaser } from "@/components/home/LadsPlusTeaser";
import { LearnSection } from "@/components/home/LearnSection";
import { MeetTheLads } from "@/components/home/MeetTheLads";
import { MembershipCta } from "@/components/home/MembershipCta";
import { getContent } from "@/lib/content";

export default async function HomePage() {
  const content = await getContent();
  const { creators } = content;

  return (
    <>
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
