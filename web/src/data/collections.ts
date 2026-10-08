import type { Collection, VideoSource } from "@/types";

// FC 27 video collections, in the order shown on /learn/collections. All are FC Lads+ (members only).
// Names and descriptions are our own. `videoCount` and episode lists are placeholders until the
// real videos are added. Each episode's video is a Loom video (most of them) or an unlisted
// YouTube video: add it with `video: loom("<share id>")` or `video: youtube("<video id>")`.
// Episodes with a `guideSlug` also link to that guide page.

/** Loom share ID, the part after loom.com/share/ */
export const loom = (id: string): VideoSource => ({ provider: "loom", id });
/** Unlisted YouTube video ID, the part after youtube.com/watch?v= */
export const youtube = (id: string): VideoSource => ({ provider: "youtube", id });

export const CURRENT_SEASON = "FC 27";

export const collections: Collection[] = [
  {
    slug: "start-here",
    title: "Start Here: FC 27 Academy",
    description:
      "Your first stop for FC 27. Work through this path in order, then explore any other collection you like.",
    season: CURRENT_SEASON,
    videoCount: 18,
    badge: "start",
    pathStep: 1,
    category: "beginner",
    episodes: [
      { title: "Welcome to the FC 27 Academy", minutes: 6 },
      { title: "Your first week in Ultimate Team", minutes: 15, guideSlug: "your-first-week-in-ultimate-team" },
      { title: "Controller settings every player should change", minutes: 9 },
      { title: "Chemistry styles explained", minutes: 6, guideSlug: "best-chem-styles-explained" },
      { title: "How to practise without wasting hours", minutes: 11 },
      { title: "Reading the radar like a pro", minutes: 8 },
    ],
  },
  {
    slug: "how-to-use-the-academy",
    title: "How to Use the Academy",
    description: "A quick guide to what to watch first, and in what order, so every video builds on the last.",
    season: CURRENT_SEASON,
    videoCount: 1,
    badge: "start",
    episodes: [{ title: "The Academy roadmap: what to watch and when", minutes: 7 }],
  },
  {
    slug: "core-skills",
    title: "Core Skills That Never Change",
    description:
      "Passing, first touch, movement and positioning. The basics behind every good player — even Elite players pick something up here.",
    season: CURRENT_SEASON,
    videoCount: 12,
    badge: "in-order",
    pathStep: 2,
    category: "gameplay",
    episodes: [
      { title: "Passing types and when to use each one", minutes: 12 },
      { title: "First touch: setting up your next action", minutes: 9 },
      { title: "Off-the-ball runs you can control", minutes: 10 },
      { title: "Shielding and turning under pressure", minutes: 8 },
      { title: "Shooting technique basics", minutes: 11 },
    ],
  },
  {
    slug: "academy-defending",
    title: "Academy: Defending",
    description: "Learn to defend first. Jockeying, tackle timing and pressing — watch this before the attacking series.",
    season: CURRENT_SEASON,
    videoCount: 8,
    badge: "in-order",
    pathStep: 3,
    category: "gameplay",
    episodes: [
      { title: "Defending 1v1 without panicking", minutes: 10, guideSlug: "defending-1v1-without-panicking" },
      { title: "Beat the high press", minutes: 8, guideSlug: "beat-the-high-press" },
      { title: "Second-man press masterclass", minutes: 16, guideSlug: "second-man-press-masterclass" },
      { title: "Stopping cutbacks", minutes: 9 },
      { title: "Defensive shape when you're winning", minutes: 9, guideSlug: "closing-out-1-goal-leads" },
    ],
  },
  {
    slug: "academy-attacking",
    title: "Academy: Attacking",
    description: "Once you've finished the defending series: build-up play, chance creation and finishing.",
    season: CURRENT_SEASON,
    videoCount: 3,
    badge: "in-order",
    pathStep: 4,
    category: "gameplay",
    episodes: [
      { title: "Building attacks from the back", minutes: 12 },
      { title: "Creating chances in the half-spaces", minutes: 11 },
      { title: "Corner routines that score", minutes: 7, guideSlug: "corner-routines-that-score" },
    ],
  },
  {
    slug: "whats-working-now",
    title: "What's Working Right Now",
    description:
      "The mechanics and players dominating FC 27 at the moment. Use these after the fundamentals, not instead of them.",
    season: CURRENT_SEASON,
    videoCount: 15,
    badge: "meta",
    pathStep: 5,
    category: "meta-players",
    episodes: [
      { title: "Everything the latest patch changed", minutes: 6, guideSlug: "everything-the-latest-patch-changed" },
      { title: "Budget meta strikers under 50K", minutes: 7, guideSlug: "budget-meta-strikers-under-50k" },
      { title: "The skill moves still worth learning", minutes: 9 },
      { title: "Meta shooting: what scores this patch", minutes: 10 },
    ],
  },
  {
    slug: "ultimate-team-starter-kit",
    title: "Ultimate Team Starter Kit",
    description: "Early-season prep: trading basics, building your first team, and what to do with the first content drops.",
    season: CURRENT_SEASON,
    videoCount: 10,
    category: "beginner",
    episodes: [
      { title: "Your first week in Ultimate Team", minutes: 15, guideSlug: "your-first-week-in-ultimate-team" },
      { title: "Trading basics for beginners", minutes: 12 },
      { title: "Which objectives to do first", minutes: 8 },
      { title: "Packs, SBCs and when to save", minutes: 10 },
    ],
  },
  {
    slug: "squad-builder-series",
    title: "Squad Builder Series: FC 27",
    description: "Starter teams for every league that grow with you. Double-check prices — the market moves fast early on.",
    season: CURRENT_SEASON,
    videoCount: 12,
    category: "squad-building",
    episodes: [
      { title: "How this series works", minutes: 5 },
      { title: "Premier League starter team", minutes: 11 },
      { title: "LaLiga starter team", minutes: 10 },
      { title: "Hybrid starter team", minutes: 12 },
    ],
  },
  {
    slug: "before-launch",
    title: "Before Launch: FC 27",
    description: "Which edition to buy, how early access works, and everything revealed before release.",
    season: CURRENT_SEASON,
    videoCount: 12,
    episodes: [
      { title: "Which FC 27 edition should you buy?", minutes: 9 },
      { title: "Early access explained", minutes: 7 },
      { title: "Every gameplay change announced so far", minutes: 14 },
    ],
  },
  {
    slug: "tactics-lab",
    title: "Formations, Roles & Tactics Lab",
    description: "Every player role and focus, plus the formations and custom tactics we actually use in Champs.",
    season: CURRENT_SEASON,
    videoCount: 27,
    category: "tactics",
    episodes: [
      { title: "Player roles explained", minutes: 13 },
      { title: "Best custom tactics this patch", minutes: 24, guideSlug: "best-custom-tactics-this-patch" },
      { title: "Beat the high press", minutes: 8, guideSlug: "beat-the-high-press" },
      { title: "4-3-2-1 vs 4-2-3-1: which suits you?", minutes: 11 },
      { title: "Game management after minute 80", minutes: 9, guideSlug: "closing-out-1-goal-leads" },
    ],
  },
  {
    slug: "quick-tips",
    title: "Quick Tips & Clip Breakdowns",
    description: "Short clips and pro analysis. One idea per video, ready to use in your next game.",
    season: CURRENT_SEASON,
    videoCount: 83,
    episodes: [
      { title: "One setting that fixes your passing", minutes: 2 },
      { title: "Why you keep conceding on the counter", minutes: 3 },
      { title: "The free kick trick that still works", minutes: 2 },
      { title: "Pro clip breakdown: Elite Division comeback", minutes: 4 },
    ],
  },
  {
    slug: "real-football-lessons",
    title: "Real Football, Real Lessons",
    description: "Real matches showing the same mistakes and good habits we see in FC. The fundamentals are the same.",
    season: CURRENT_SEASON,
    videoCount: 18,
    episodes: [
      { title: "Why real defenders don't dive in", minutes: 8 },
      { title: "Third-man runs in real football and FC", minutes: 9 },
      { title: "Pressing traps: pitch vs console", minutes: 10 },
    ],
  },
  {
    slug: "inside-the-pros",
    title: "Inside the Pros",
    description: "Interviews with top competitive players: how they think, how they practise, and what they'd tell you.",
    season: CURRENT_SEASON,
    videoCount: 2,
    episodes: [
      { title: "Pro interview: preparing for a Champs weekend", minutes: 24 },
      { title: "Pro interview: your questions answered", minutes: 31 },
    ],
  },
  {
    slug: "full-archive",
    title: "FC 27 Full Archive",
    description: "Every FC 27 video in one place, newest first. For the recommended order, use the Start Here path.",
    season: CURRENT_SEASON,
    videoCount: 73,
    badge: "archive",
    episodes: [
      { title: "Everything the latest patch changed", minutes: 6, guideSlug: "everything-the-latest-patch-changed" },
      { title: "Beat the high press", minutes: 8, guideSlug: "beat-the-high-press" },
      { title: "Defending 1v1 without panicking", minutes: 10, guideSlug: "defending-1v1-without-panicking" },
      { title: "Best custom tactics this patch", minutes: 24, guideSlug: "best-custom-tactics-this-patch" },
    ],
  },
];

export function getCollection(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

/** The numbered "Start here" path, in step order. */
export function getLearningPath() {
  return collections
    .filter((collection) => collection.pathStep !== undefined)
    .sort((a, b) => (a.pathStep ?? 0) - (b.pathStep ?? 0));
}
