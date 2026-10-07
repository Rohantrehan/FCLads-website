import type { Creator } from "@/types";

// Mock data taken from the designs. Replace with API/CMS data in the backend phase.
// Set `hidden: true` to switch a creator off everywhere without deleting their data.
const allCreators: Creator[] = [
  {
    slug: "tfv-gaming",
    hidden: true, // Switched off for now (client request, Oct 2026). Remove this line to bring TFV back.
    name: "TFV Gaming",
    initials: "TF",
    role: "Gameplay Coach",
    tagline: "Founding creator // Pro circuit",
    country: "United Kingdom",
    countryCode: "GBR",
    ovr: 99,
    cardPosition: "ST / CREATOR",
    ratings: { gam: 98, tac: 96, trd: 88, meta: 99 },
    badge: "Founding",
    rankLabel: "GLOBAL #01",
    highlight: { label: "Peak rank", value: "Top 100" },
    bio: "Competing at the highest division levels since 2017, TFV breaks pro animation cancels, skill moves and in-game mechanics down into simple, actionable steps.",
    socials: { youtube: "#", x: "#", instagram: "#", tiktok: "#" },
    audience: [
      { platform: "youtube", count: "520K" },
      { platform: "x", count: "140K" },
      { platform: "tiktok", count: "210K" },
    ],
    since: 2017,
    picks: [
      { playerSlug: "kai-vanderbilt", verdict: "Unstoppable on the turn. The best striker in the game right now." },
      { playerSlug: "rafael-san", verdict: "Recovery pace that makes high lines look silly." },
    ],
  },
  {
    slug: "stefan",
    name: "Stefan",
    initials: "ST",
    role: "Tactics Analyst",
    tagline: "Gameplay expert // Tactical",
    country: "Germany",
    countryCode: "GER",
    ovr: 96,
    cardPosition: "CAM / EXPERT",
    ratings: { gam: 94, tac: 99, trd: 82, meta: 95 },
    rankLabel: "TACTICAL #02",
    highlight: { label: "Specialty", value: "71-depth ctrl" },
    bio: "Elite division tactician and Top 100 competitive player specialising in press counters and bespoke custom tactics.",
    socials: { youtube: "#", x: "#", instagram: "#" },
    audience: [
      { platform: "youtube", count: "240K" },
      { platform: "instagram", count: "115K" },
      { platform: "tiktok", count: "180K" },
    ],
    since: 2018,
    picks: [
      { playerSlug: "marco-velardi", verdict: "The most responsive left-stick exit angle in the game. Undervalued." },
      { playerSlug: "leo-silva", verdict: "Incredible dribbling. Ideal budget CAM for early Weekend League." },
      { playerSlug: "antoine-valere", verdict: "Finesse Shot+ is close to automatic from 25 yards after the patch." },
      { playerSlug: "darius-okonkwo", verdict: "Reads through balls early and wins everything in the air." },
    ],
  },
  {
    slug: "hobs",
    name: "Hobs",
    initials: "HB",
    role: "Pro Competitor",
    tagline: "Community // 20-0 Rank 1",
    country: "United Kingdom",
    countryCode: "UK",
    ovr: 95,
    cardPosition: "RW / RANK 1",
    ratings: { gam: 99, tac: 92, trd: 79, meta: 97 },
    rankLabel: "FINISHER #03",
    highlight: { label: "WL record", value: "20-0 Rank 1" },
    bio: "Rank 1 Weekend League finisher who focuses on game management, mentality and squads that win when it matters.",
    socials: { youtube: "#", x: "#", twitch: "#" },
    audience: [
      { platform: "youtube", count: "95K" },
      { platform: "twitch", count: "60K" },
    ],
    since: 2019,
    picks: [
      { playerSlug: "matteo-bianchi", verdict: "The best value CDM in the game. Sits and cuts everything out." },
      { playerSlug: "leo-silva", verdict: "Plays like a 300K card for the price of a pack." },
    ],
  },
  {
    slug: "wessam",
    name: "Wessam",
    initials: "WS",
    role: "Market Strategist",
    tagline: "Market lead & economist",
    country: "Middle East",
    countryCode: "ME",
    ovr: 94,
    cardPosition: "CM / TRADER",
    ratings: { gam: 88, tac: 86, trd: 99, meta: 93 },
    rankLabel: "ECONOMY #04",
    highlight: { label: "Portfolio", value: "50M+ coins" },
    bio: "Market lead behind the weekly Trading Brief. Wessam tracks prices, promos and SBCs so you can build coins without living on the market.",
    socials: { youtube: "#", x: "#" },
    audience: [
      { platform: "youtube", count: "70K" },
      { platform: "x", count: "45K" },
    ],
    since: 2019,
    picks: [
      { playerSlug: "darius-okonkwo", verdict: "Holds his value every week. Safe coins and a great CB." },
    ],
  },
];

/** Creators shown on the site (hidden ones removed). */
export const creators = allCreators.filter((creator) => !creator.hidden);

export function getCreator(slug: string) {
  return creators.find((creator) => creator.slug === slug);
}

/** True when the creator exists and is not hidden. Used to filter their guides and squads. */
export function isVisibleCreator(slug: string) {
  return creators.some((creator) => creator.slug === slug);
}
