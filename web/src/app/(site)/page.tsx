import { FeedPreview } from "@/components/home/FeedPreview";
import { HardTruth } from "@/components/home/HardTruth";
import { Hero } from "@/components/home/Hero";
import { LadsPlusTeaser } from "@/components/home/LadsPlusTeaser";
import { LearnSection } from "@/components/home/LearnSection";
import { MeetTheLads } from "@/components/home/MeetTheLads";
import { MembershipCta } from "@/components/home/MembershipCta";
import { creators, getCreator } from "@/data/creators";
import { guides } from "@/data/guides";
import { CURRENT_PATCH } from "@/data/meta";
import type { Creator } from "@/types";

export default function HomePage() {
  const heroCards = ["stefan", "hobs", "wessam"].map((slug) => getCreator(slug)) as [Creator, Creator, Creator];

  return (
    <>
      <Hero cards={heroCards} patch={CURRENT_PATCH} />
      <HardTruth />
      <LearnSection guides={guides.filter((guide) => !guide.isFeatured).slice(0, 4)} />
      <LadsPlusTeaser />
      <MeetTheLads creators={creators} />
      <FeedPreview />
      <MembershipCta />
    </>
  );
}
