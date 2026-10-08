import { FeedPreview } from "@/components/home/FeedPreview";
import { HardTruth } from "@/components/home/HardTruth";
import { Hero } from "@/components/home/Hero";
import { LadsPlusTeaser } from "@/components/home/LadsPlusTeaser";
import { LearnSection } from "@/components/home/LearnSection";
import { MeetTheLads } from "@/components/home/MeetTheLads";
import { MembershipCta } from "@/components/home/MembershipCta";
import { MetaPlayersSection } from "@/components/home/MetaPlayersSection";
import { creators } from "@/data/creators";
import { guides } from "@/data/guides";
import { getPlayer, players } from "@/data/players";
import type { Player } from "@/types";

// Mock "current state" values. These will come from the backend (patches, meta_rankings tables).
const CURRENT_PATCH = "1.08";
const CURRENT_WEEK = 28;

export default function HomePage() {
  const heroCards = ["kai-vanderbilt", "darius-okonkwo", "mateo-silva"].map((slug) => getPlayer(slug)) as [
    Player,
    Player,
    Player,
  ];

  return (
    <>
      <Hero cards={heroCards} patch={CURRENT_PATCH} />
      <MetaPlayersSection players={players} week={CURRENT_WEEK} />
      <HardTruth />
      <LearnSection guides={guides.filter((guide) => !guide.isFeatured).slice(0, 4)} />
      <LadsPlusTeaser />
      <MeetTheLads creators={creators} />
      <FeedPreview />
      <MembershipCta />
    </>
  );
}
