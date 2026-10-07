import { getCreator, isVisibleCreator } from "@/data/creators";
import { categoryLabels } from "@/lib/format";
import type { Guide, GuideCategory } from "@/types";

// Mock data taken from the designs. Replace with API/CMS data in the backend phase.
// Sorted newest first.
const allGuides: Guide[] = [
  {
    slug: "hybrid-overload-custom-tactic",
    title: "The custom tactic every Lad is using this patch",
    excerpt:
      "A full breakdown of the 4-3-2-1 hybrid overload that creates easy passing triangles against 71-depth pressing. Includes player instructions and build-up sliders.",
    category: "tactics",
    format: "video",
    minutes: 12,
    access: "free",
    authorSlug: "tfv-gaming",
    publishedAt: "2025-10-15",
    isFeatured: true,
  },
  {
    slug: "beat-the-high-press",
    title: "Beat the high press",
    excerpt: "Use driven ground passes and targeted width to beat 71-depth pressing squads.",
    category: "tactics",
    format: "article",
    minutes: 8,
    access: "free",
    authorSlug: "stefan",
    publishedAt: "2025-10-14",
  },
  {
    slug: "5-skill-moves-that-still-work",
    title: "5 skill moves that still work",
    excerpt: "Consistent exits, the reverse elastico angle and heel-to-ball roll mechanics, step by step.",
    category: "skill-moves",
    format: "video",
    minutes: 14,
    access: "free",
    authorSlug: "tfv-gaming",
    publishedAt: "2025-10-13",
    isNew: true,
  },
  {
    slug: "defending-1v1-without-panicking",
    title: "Defending 1v1 without panicking",
    excerpt: "Manual jockey speed, tackle timing, and when to let the second-man press do the work.",
    category: "gameplay",
    format: "article",
    minutes: 10,
    access: "free",
    authorSlug: "hobs",
    publishedAt: "2025-10-12",
  },
  {
    slug: "fut-champs-your-first-10-games",
    title: "FUT Champs: your first 10 games",
    excerpt: "Pacing your games, staying calm after a bad loss, and game-management tactics for early leads.",
    category: "fut-champs",
    format: "video",
    minutes: 22,
    access: "plus",
    authorSlug: "hobs",
    publishedAt: "2025-10-11",
  },
  {
    slug: "everything-the-latest-patch-changed",
    title: "Everything the latest patch changed",
    excerpt: "Trivela nerfs, second-man press cooldowns and goalkeeper reactions, frame by frame.",
    category: "fc-updates",
    format: "article",
    minutes: 6,
    access: "free",
    authorSlug: "stefan",
    publishedAt: "2025-10-10",
    isNew: true,
  },
  {
    slug: "your-first-week-in-ultimate-team",
    title: "Your first week in Ultimate Team",
    excerpt: "Build a competitive 100K squad within 48 hours without spending real money on FC Points.",
    category: "beginner",
    format: "video",
    minutes: 15,
    access: "free",
    authorSlug: "wessam",
    publishedAt: "2025-10-09",
  },
  {
    slug: "best-100k-hybrid-squad",
    title: "Best 100K hybrid squad",
    excerpt: "Full 33 chemistry with 5-star skillers and rapid wingers for early Division Rivals.",
    category: "squad-building",
    format: "article",
    minutes: 9,
    access: "free",
    authorSlug: "tfv-gaming",
    publishedAt: "2025-10-08",
  },
  {
    slug: "finesse-shots-after-the-nerf",
    title: "Finesse shots after the nerf",
    excerpt: "Green-timed finishing windows and the body angles that still score from 25 yards.",
    category: "shooting",
    format: "video",
    minutes: 18,
    access: "plus",
    authorSlug: "tfv-gaming",
    publishedAt: "2025-10-07",
  },
  {
    slug: "corner-routines-that-score",
    title: "Corner routines that score",
    excerpt: "Two near-post corner routines with driven lofted crosses that beat a manually moved keeper.",
    category: "set-pieces",
    format: "video",
    minutes: 7,
    access: "free",
    authorSlug: "stefan",
    publishedAt: "2025-10-06",
  },
  {
    slug: "best-custom-tactics-this-patch",
    title: "Best custom tactics this patch",
    excerpt: "Exact instructions for 4-3-2-1 and 4-4-2 setups designed to crack defensive blocks.",
    category: "tactics",
    format: "video",
    minutes: 24,
    access: "free",
    authorSlug: "hobs",
    publishedAt: "2025-10-05",
  },
  {
    slug: "budget-meta-strikers-under-50k",
    title: "Budget meta strikers under 50K",
    excerpt: "Five cheap strikers that play like players ten times the price, tested in Champs.",
    category: "meta-players",
    format: "article",
    minutes: 7,
    access: "free",
    authorSlug: "hobs",
    publishedAt: "2025-10-04",
  },
  {
    slug: "second-man-press-masterclass",
    title: "Second-man press masterclass",
    excerpt: "When to call the second man, when to hold, and how to stop giving away cutbacks.",
    category: "gameplay",
    format: "video",
    minutes: 16,
    access: "plus",
    authorSlug: "stefan",
    publishedAt: "2025-10-03",
  },
  {
    slug: "skill-move-combos-vs-5-at-the-back",
    title: "Skill combos that crack a back five",
    excerpt: "Ball-roll drag cancels and flair nutmegs timed to beat auto-block inside the box.",
    category: "skill-moves",
    format: "video",
    minutes: 8,
    access: "plus",
    authorSlug: "tfv-gaming",
    publishedAt: "2025-10-02",
  },
  {
    slug: "closing-out-1-goal-leads",
    title: "Closing out 1-goal leads after minute 80",
    excerpt: "The shape, tactics and habits that stop late equalisers in Weekend League.",
    category: "fut-champs",
    format: "article",
    minutes: 9,
    access: "free",
    authorSlug: "hobs",
    publishedAt: "2025-10-01",
  },
  {
    slug: "best-chem-styles-explained",
    title: "Chemistry styles explained",
    excerpt: "Which chem style to put on which player, and the ones that are a waste of coins.",
    category: "beginner",
    format: "article",
    minutes: 6,
    access: "free",
    authorSlug: "wessam",
    publishedAt: "2025-09-30",
  },
];

/** Guides shown on the site: guides by hidden creators are left out. */
export const guides = allGuides.filter((guide) => isVisibleCreator(guide.authorSlug));

export const PAGE_SIZE = 9;

export interface GuideQuery {
  category?: GuideCategory;
  /** Free-text search over title, excerpt, category and author. */
  q?: string;
  limit?: number;
}

/** Mimics the future `GET /guides` API: filter, search, then paginate. */
export function queryGuides({ category, q, limit = PAGE_SIZE }: GuideQuery) {
  const needle = q?.trim().toLowerCase();
  const matches = guides.filter((guide) => {
    if (category && guide.category !== category) return false;
    if (!needle) return true;
    const author = getCreator(guide.authorSlug)?.name ?? "";
    return [guide.title, guide.excerpt, categoryLabels[guide.category], author]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  return { items: matches.slice(0, limit), total: matches.length };
}

/** The featured guide, or the newest free guide if the featured one is hidden. */
export function getFeaturedGuide() {
  return guides.find((guide) => guide.isFeatured) ?? guides.find((guide) => guide.access === "free");
}

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

/** Number of guides per category, for the sidebar. */
export function countByCategory() {
  const counts = {} as Partial<Record<GuideCategory, number>>;
  for (const guide of guides) counts[guide.category] = (counts[guide.category] ?? 0) + 1;
  return counts;
}

export function isGuideCategory(value: unknown): value is GuideCategory {
  return typeof value === "string" && value in categoryLabels;
}

/** All guides by one creator, newest first. */
export function getGuidesByAuthor(slug: string) {
  return guides.filter((guide) => guide.authorSlug === slug);
}
