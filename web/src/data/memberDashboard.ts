import "server-only";

// The signed-in member's own dashboard data. Server only, and only read for FC Lads+ members.
// Sample values until these are built: watch progress, Discord. (Reviews are real: lib/reviews.ts.)

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
  "Don't share FC Lads+ guides, videos or trading posts outside the server.",
  "Keep posts in the right channel.",
];
