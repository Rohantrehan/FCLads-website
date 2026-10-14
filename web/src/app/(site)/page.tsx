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
      {/* The first three creators in the roster order, front card first. */}
      <Hero cards={creators.slice(0, 3)} patch={content.settings.currentPatch} />
      <HardTruth
        creators={creators.map(({ slug, name, initials, role }) => ({ slug, name, initials, role }))}
      />
      <LearnSection guides={content.guides.filter((guide) => !guide.isFeatured).slice(0, 4)} creators={creators} />
      <LadsPlusTeaser />
      <MeetTheLads creators={creators} />
      <FeedPreview />
      <MembershipCta />
    </>
  );
}
