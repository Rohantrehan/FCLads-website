import "server-only";

// The signed-in member's own dashboard data. Server only, and only read for FC Lads+ members.
// Mock values shaped like future tables (watch_progress, reviews, review_slots, discord_links).

export const DASHBOARD_TODAY = "2026-10-09";

/** Videos the member started and didn't finish. `watched` is in minutes. */
export const continueWatching = [
  { guideSlug: "second-man-press-masterclass", watched: 10 },
  { guideSlug: "corner-routines-that-score", watched: 2 },
  { guideSlug: "best-custom-tactics-this-patch", watched: 20 },
];

/** "This week in FC": short notes on what changed in the game. */
export const weekInFc = [
  {
    kind: "patch" as const,
    label: "Patch 1.08",
    text: "Sprinting drains stamina faster when you press high. Expect tired defenders after 60 minutes.",
  },
  {
    kind: "shooting" as const,
    label: "Shooting",
    text: "Trivela shots from outside the box are less accurate. Green timing now matters more.",
  },
  {
    kind: "rules" as const,
    label: "Weekend League",
    text: "Qualification for this week's Weekend League closes on Thursday at 18:00 UK time.",
  },
];

/** The latest Discord message highlighted on My Feed. */
export const discordHighlight = {
  authorSlug: "hobs",
  channel: "tactics-room",
  postedAt: "2026-10-09T10:20:00Z",
  title: "Slider fix for cutbacks",
  quote: "Drop your defensive depth to 58 when you lose the ball. Your centre-backs stop freezing on cutback passes.",
};

/** What's coming next (shown locked until it is published). */
export const comingNext = { title: "Near-post corner routine (and how to stop it)", day: "Friday" };

// ---------- Monthly gameplay review ----------

export type ReviewStep = "upload" | "book" | "plan";

export const reviewSteps: { key: ReviewStep; title: string }[] = [
  { key: "upload", title: "Upload gameplay" },
  { key: "book", title: "Book your session" },
  { key: "plan", title: "Get your plan" },
];

export interface CurrentReview {
  month: string;
  /** Book before this day (end of the billing month). */
  deadline: string;
  credits: { used: number; total: number };
  step: ReviewStep;
  upload?: { fileName: string; sizeMb: number; duration: string; focus: string };
}

export const currentReview: CurrentReview = {
  month: "October",
  deadline: "2026-10-31",
  credits: { used: 0, total: 1 },
  step: "book",
  upload: {
    fileName: "Weekend League - Game 7.mp4",
    sizeMb: 284,
    duration: "18:42",
    focus: "Getting caught on cutbacks against 4-3-2-1 and losing the ball in transition.",
  },
};

/** Lads who do gameplay reviews, with their open slots (UK time). */
export const reviewers: { creatorSlug: string; specialty: string; slots: Record<string, string[]> }[] = [
  {
    creatorSlug: "stefan",
    specialty: "Tactics & build-up",
    slots: {
      "2026-10-13": ["18:00", "20:00"],
      "2026-10-15": ["19:00", "20:00", "21:00"],
      "2026-10-20": ["18:00", "19:00"],
      "2026-10-22": ["18:00", "20:00"],
      "2026-10-24": ["11:00", "12:00", "19:00"],
      "2026-10-27": ["18:00"],
      "2026-10-29": ["19:00", "20:00"],
    },
  },
  {
    creatorSlug: "hobs",
    specialty: "Game management & defending",
    slots: {
      "2026-10-12": ["20:00", "21:00"],
      "2026-10-14": ["19:00"],
      "2026-10-19": ["20:00", "21:00"],
      "2026-10-21": ["19:00", "20:00"],
      "2026-10-26": ["20:00"],
      "2026-10-28": ["19:00", "21:00"],
    },
  },
  {
    creatorSlug: "wessam",
    specialty: "Squad building on a budget",
    slots: {
      "2026-10-16": ["17:00", "18:00"],
      "2026-10-23": ["17:00", "18:00", "19:00"],
      "2026-10-30": ["17:00"],
    },
  },
];

export const pastReviews = [
  {
    id: "rv-2026-09",
    creatorSlug: "stefan",
    date: "2026-09-21",
    tag: "Division 1 qualifiers",
    minutes: 31,
    actions: [
      "Bring your CDM across with R1 when the ball goes wide, so the cutback lane is covered.",
      "Drop defensive depth from 71 to 58 against balanced teams to stop balls over the top.",
      "Play driven ground passes into your CAM instead of lofted chips.",
    ],
  },
  {
    id: "rv-2026-08",
    creatorSlug: "hobs",
    date: "2026-08-24",
    tag: "Champs playoffs",
    minutes: 28,
    actions: [
      "Stop sprint-dribbling in the final third. You keep stamina and take fewer heavy touches.",
      "Use the ball roll to open angles in the half-spaces against teams that sit deep.",
      "Switch to 4-2-3-1 with both CDMs on Stay Back when leading after the 70th minute.",
    ],
  },
];

// ---------- Discord ----------

export const discordAccount = { connected: true, username: "arjun_fc" };

export const discordChannels = [
  {
    name: "tactics-room",
    label: "Tactics",
    description: "Formations, custom tactics and how to beat the press. Ask before you change your setup.",
    pinned: "Patch 1.08: 4-3-2-1 setup and slider codes",
  },
  {
    name: "show-your-squad",
    label: "Squads",
    description: "Post your team for feedback on chemistry, upgrades and where to spend coins next.",
    pinned: "How to share your squad link",
  },
  {
    name: "ask-the-lads",
    label: "Creator Q&A",
    description: "Questions for Stefan, Hobs, Wessam and Lizzy. The Lads answer every day.",
    pinned: "Read this before you ask: what to include",
  },
  {
    name: "market-talk",
    label: "Trading",
    description: "Price alerts, SBC investments and quick trading questions for Wessam.",
    pinned: "This week: fodder before Friday's SBC",
  },
  {
    name: "help",
    label: "Support",
    description: "Problems with your account, Discord role or billing. The team replies within a day.",
  },
];

export const discordRules = [
  "Be respectful. No abuse, hate speech or harassment.",
  "No selling or buying coins, accounts or boosting.",
  "Don't share FC Lads+ guides, videos or the trading brief outside the server.",
  "Keep posts in the right channel.",
];
