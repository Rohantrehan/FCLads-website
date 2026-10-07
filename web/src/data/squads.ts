import { isVisibleCreator } from "@/data/creators";
import type { Squad } from "@/types";

// Mock squad blueprints. The full Squads page comes later; profiles show each creator's squads.
const allSquads: Squad[] = [
  {
    slug: "50k-weekend-league-starter",
    name: "50K Weekend League starter",
    tier: "Budget meta starter",
    budget: 48_500,
    formation: "4-2-3-1",
    chemistry: 33,
    width: 45,
    depth: 65,
    buildUp: "Balanced",
    keyPlaystyles: "Rapid & Relentless",
    authorSlug: "stefan",
    note: "Went 18-2 in Weekend League testing with this exact core. The double pivot covers cutbacks perfectly.",
  },
  {
    slug: "500k-elite-division",
    name: "500K Elite Division squad",
    tier: "Competitive squad",
    budget: 512_000,
    formation: "4-3-2-1",
    chemistry: 33,
    width: 40,
    depth: 71,
    buildUp: "Direct passing",
    keyPlaystyles: "Anticipate+ & Finesse",
    authorSlug: "stefan",
    note: "Built for fast transitions and recovery. The left CF drops in to make a 4-4-2 block without the ball.",
  },
  {
    slug: "100k-hybrid",
    name: "100K hybrid",
    tier: "Budget hybrid",
    budget: 98_400,
    formation: "4-3-2-1",
    chemistry: 33,
    width: 45,
    depth: 60,
    buildUp: "Balanced",
    keyPlaystyles: "Technical & Rapid",
    authorSlug: "hobs",
    note: "My go-to for the first weekend of a new promo. Cheap, fast, and very hard to break down.",
  },
  {
    slug: "250k-wl-meta",
    name: "250K Weekend League meta",
    tier: "Mid budget",
    budget: 245_000,
    formation: "4-2-2-2",
    chemistry: 33,
    width: 50,
    depth: 62,
    buildUp: "Fast build-up",
    keyPlaystyles: "Quick Step+ & Trivela",
    authorSlug: "tfv-gaming",
    note: "Two strikers who both drop short. Went 10-0 in Playoffs with this.",
  },
];

/** Squads shown on the site: squads by hidden creators are left out. */
export const squads = allSquads.filter((squad) => isVisibleCreator(squad.authorSlug));

export function getSquadsByAuthor(slug: string) {
  return squads.filter((squad) => squad.authorSlug === slug);
}
