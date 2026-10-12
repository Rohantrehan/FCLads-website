import { isVisibleCreator } from "@/data/creators";
import type { FeedPost, FeedTopic } from "@/types";

// Mock feed posts, newest first. Will come from the CMS (posts table) in the backend phase.
// Time labels ("2h ago") are worked out against FEED_NOW so the mock stays readable.
export const FEED_NOW = "2026-10-08T12:00:00Z";

export const feedTopics: Record<FeedTopic, string> = {
  gameplay: "Gameplay",
  trading: "Trading",
  updates: "Updates",
  "fut-champs": "FUT Champs",
};

export const FEED_PAGE_SIZE = 8;

const allPosts: FeedPost[] = [
  {
    id: "beat-the-press-clip",
    type: "video",
    topic: "gameplay",
    authorSlug: "stefan",
    postedAt: "2026-10-08T11:15:00Z",
    access: "free",
    title: "How to beat the high press in patch 1.08 without hoofing it long",
    excerpt:
      "Use your full-backs to pull the press wide, then play the third-man pass through the middle. Clip from today's stream.",
    minutes: 14,
    views: 18_400,
    approval: 94,
    guideSlug: "beat-the-high-press",
  },
  {
    id: "patch-108-deep-dive",
    type: "update",
    topic: "updates",
    authorSlug: "hobs",
    postedAt: "2026-10-08T09:00:00Z",
    access: "free",
    title: "What patch 1.08 actually changed (and what the notes didn't say)",
    points: [
      "Second-man press recovers more slowly, so auto-traps are much weaker.",
      "Trivela shots from outside the box curve less. Fewer long-range screamers.",
      "Lengthy AcceleRATE players get a bigger burst once they're in full sprint.",
    ],
  },
  {
    id: "fodder-before-friday",
    type: "trading",
    topic: "trading",
    authorSlug: "wessam",
    postedAt: "2026-10-08T08:00:00Z",
    access: "plus",
    title: "3 cheap fodder targets to stock up on before Friday's content drop",
    targets: [
      { card: "84 rated Serie A fodder", buyBelow: 2_300 },
      { card: "85 rated LaLiga fodder", buyBelow: 3_300 },
      { card: "86 rated Premier League fodder", buyBelow: 3_900 },
    ],
    freeTargets: 2,
  },
  {
    id: "dont-press-early",
    type: "tip",
    topic: "fut-champs",
    authorSlug: "hobs",
    postedAt: "2026-10-08T06:00:00Z",
    access: "free",
    text: "Conceded in the first 10 minutes? Don't switch to team press. Most comebacks happen between minute 55 and 75 by keeping your shape.",
    label: "Weekend League rule #4",
  },
  {
    id: "low-block-poll",
    type: "poll",
    topic: "gameplay",
    authorSlug: "wessam",
    postedAt: "2026-10-08T05:00:00Z",
    access: "free",
    question: "Which skill move breaks a five-at-the-back low block most reliably for you?",
    options: [
      { label: "Ball roll drag back", votes: 1_773 },
      { label: "Step-over sprint", votes: 989 },
      { label: "Flair nutmeg cancel", votes: 409 },
      { label: "Elastico", votes: 239 },
    ],
  },
  {
    id: "tu-three-changes",
    type: "update",
    topic: "updates",
    authorSlug: "stefan",
    postedAt: "2026-10-07T18:00:00Z",
    access: "free",
    title: "Title update: the 3 changes that matter for Champs",
    points: [
      "Through balls are slightly less accurate under pressure.",
      "Goalkeepers react faster to near-post finesse shots.",
      "Stamina drains faster when you sprint for long spells.",
    ],
  },
  {
    id: "sell-before-totw",
    type: "video",
    topic: "trading",
    authorSlug: "wessam",
    postedAt: "2026-10-07T15:00:00Z",
    access: "free",
    title: "When to sell before Team of the Week drops",
    excerpt:
      "Prices dip every Wednesday evening. Here's the window where I list my squad players and how much I keep in reserve.",
    minutes: 9,
    views: 11_200,
    approval: 91,
  },
  {
    id: "thursday-rule",
    type: "tip",
    topic: "trading",
    authorSlug: "wessam",
    postedAt: "2026-10-07T09:00:00Z",
    access: "free",
    text: "Never panic-buy on a Thursday night. Everyone's building for Weekend League, so prices are at their highest.",
    label: "Market rule #1",
  },
  {
    id: "1v1-defending-clip",
    type: "video",
    topic: "fut-champs",
    authorSlug: "hobs",
    postedAt: "2026-10-07T06:00:00Z",
    access: "free",
    title: "Stop diving in: 1v1 defending that works in Elite",
    excerpt:
      "Jockey, wait for the heavy touch, then tackle. Three clips from my last 20-0 showing exactly when to commit.",
    minutes: 11,
    views: 9_800,
    approval: 96,
    guideSlug: "defending-1v1-without-panicking",
  },
];

/** Posts shown on the site (posts by hidden creators are left out). */
export const feedPosts = allPosts.filter((post) => isVisibleCreator(post.authorSlug));

export function isFeedTopic(value: unknown): value is FeedTopic {
  return typeof value === "string" && value in feedTopics;
}

export function countByTopic() {
  const counts = Object.fromEntries(Object.keys(feedTopics).map((key) => [key, 0])) as Record<FeedTopic, number>;
  for (const post of feedPosts) counts[post.topic] += 1;
  return counts;
}

/** Posts from the last 24 hours before FEED_NOW. */
export function postsToday() {
  const now = new Date(FEED_NOW).getTime();
  return feedPosts.filter((post) => now - new Date(post.postedAt).getTime() < 24 * 3_600_000).length;
}

/** "Trending this week" sidebar. Mock view counts. */
export const trending = [
  { title: "Beat the high press", href: "/guides/beat-the-high-press", authorSlug: "stefan", views: 42_000 },
  {
    title: "Best custom tactics this patch",
    href: "/guides/best-custom-tactics-this-patch",
    authorSlug: "hobs",
    views: 38_000,
  },
  { title: "Patch 1.08 hidden changes", href: "/feed?topic=updates", authorSlug: "hobs", views: 29_000 },
  {
    title: "Stop diving in: 1v1 defending",
    href: "/guides/defending-1v1-without-panicking",
    authorSlug: "hobs",
    views: 24_000,
  },
  { title: "Fodder before Friday", href: "/feed?topic=trading", authorSlug: "wessam", views: 19_000 },
];
