// Shared domain types. Shaped like the future database tables (see FC_LADS_PROJECT_REPORT.md §6)
// so mock data in src/data can be swapped for API responses later without touching components.

/**
 * Content access level: free for everyone, or FC Lads+ members only.
 * Every guide and collection on the site is "plus" (the free videos live on YouTube).
 */
export type AccessTier = "free" | "plus";

/**
 * A members-only video. Most are Loom videos, some are unlisted YouTube videos.
 * `id` is the Loom share ID (loom.com/share/<id>) or the YouTube video ID.
 * Never sent to a non-member's browser (see lib/collectionAccess.ts and lib/guideAccess.ts).
 */
export interface VideoSource {
  provider: "loom" | "youtube";
  id: string;
}

export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "CF"
  | "ST";

export interface FaceStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

/** The 20 in-game attributes behind the six face stats (only filled for some players). */
export interface DetailedAttributes {
  pace: { acceleration: number; sprintSpeed: number };
  shooting: { positioning: number; finishing: number; shotPower: number; longShots: number; volleys: number; penalties: number };
  passing: { vision: number; crossing: number; shortPassing: number; longPassing: number };
  dribbling: { agility: number; balance: number; reactions: number; ballControl: number; dribbling: number; composure: number };
  defending: { interceptions: number; defAwareness: number; standingTackle: number; slidingTackle: number };
  physical: { jumping: number; stamina: number; strength: number; aggression: number };
}

export interface ChemistryStyle {
  name: string;
  /** e.g. ["+8 PAC", "+8 SHO"] */
  boosts: string[];
  note: string;
  /** The Lads' recommended style for this player. */
  recommended?: boolean;
}

/** In-depth Lads review. FC Lads+ only, stored in data/playerReviews.ts (server only). */
export interface PlayerReview {
  authorSlug: string;
  quote: string;
  insights: { title: string; text: string }[];
}

export interface Player {
  slug: string;
  name: string;
  /** Short name shown on cards, e.g. "M. Silva". Falls back to `name`. */
  cardName?: string;
  ovr: number;
  position: Position;
  altPositions?: Position[];
  /** ISO 3166 alpha-3 style code shown on cards, e.g. "NED". */
  nation: string;
  /** Full country name, e.g. "Netherlands". */
  country?: string;
  club: string;
  league?: string;
  stats: FaceStats;
  /** Approximate transfer market price in coins. */
  price?: number;
  /** Price change over the last week, in percent (e.g. 18.4 or -2.8). */
  trend?: number;
  /** The Lads' "how broken is it" score, 0-100. Drives the meta ranking. */
  metaScore?: number;
  metaRank?: number;
  /** Short label such as "META S+" or "S-TIER". */
  metaTag?: string;
  playstyles?: string[];
  /** PlayStyles+ (the gold ones), shown highlighted. */
  playstylesPlus?: string[];
  verdict?: string;
  /** Competitive matches the card appeared in this week. */
  matches?: number;
  goalsPerGame?: number;
  /** FUT Champs win rate with the card, in percent. */
  winRate?: number;
  weakFoot?: number;
  skillMoves?: number;
  height?: string;
  preferredFoot?: "Right" | "Left";
  bodyType?: string;
  acceleRate?: "Explosive" | "Mostly explosive" | "Controlled" | "Mostly lengthy" | "Lengthy";
  attributes?: DetailedAttributes;
  chemistryStyles?: ChemistryStyle[];
  image?: string;
}

export interface CreatorSocials {
  youtube?: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
  twitch?: string;
}

export type SocialPlatform = "youtube" | "x" | "instagram" | "tiktok" | "twitch";

export interface Creator {
  slug: string;
  /** Temporarily switched off: hidden everywhere (profile, roster, their guides and squads). */
  hidden?: boolean;
  name: string;
  /** 2-letter monogram used when there is no photo, e.g. "TF". */
  initials: string;
  role: string;
  /** Second line under the name, e.g. "Founding creator // Pro circuit". */
  tagline: string;
  country: string;
  countryCode: string;
  /** Card-style rating shown as OVR. */
  ovr: number;
  cardPosition: string;
  ratings: { gam: number; tac: number; trd: number; meta: number };
  badge?: string;
  rankLabel?: string;
  /** One headline stat shown on compact tiles, e.g. { label: "WL record", value: "20-0 Rank 1" }. */
  highlight?: { label: string; value: string };
  bio?: string;
  socials: CreatorSocials;
  /** Follower counts per platform, e.g. { platform: "youtube", count: "240K" }. */
  audience?: { platform: SocialPlatform; count: string }[];
  /** Year they started competing / making FC content. */
  since?: number;
  /** Players this creator endorses, with their one-line verdict. */
  picks?: { playerSlug: string; verdict: string }[];
  image?: string;
}

export type GuideCategory =
  | "tactics"
  | "gameplay"
  | "skill-moves"
  | "meta-players"
  | "fut-champs"
  | "fc-updates"
  | "beginner"
  | "squad-building"
  | "set-pieces"
  | "shooting";

export type GuideFormat = "article" | "video";

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  category: GuideCategory;
  format: GuideFormat;
  /** Read time or video length in minutes. */
  minutes: number;
  access: AccessTier;
  authorSlug: string;
  publishedAt: string;
  isNew?: boolean;
  isFeatured?: boolean;
  video?: VideoSource;
  image?: string;
}

/** One block of guide body content. Mirrors what a CMS (e.g. Payload "blocks") will return. */
export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "section"; id: string; title: string }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "tip"; label?: string; title: string; text: string }
  | {
      type: "controls";
      title: string;
      /** Button presses in order, e.g. ["L1", "R1", "Through ball"]. */
      inputs: string[];
      result: string;
      note?: string;
      successRate?: string;
    }
  | { type: "player"; slug: string; note: string };

export interface GuideContent {
  slug: string;
  /** Words of the title to colour green, e.g. "high press". */
  highlight?: string;
  patch?: string;
  /** Lead paragraphs shown above the body. */
  intro: string[];
  blocks: GuideBlock[];
  /**
   * Index in `blocks` where FC Lads+ content starts. Everything from here is only sent
   * to members. Ignored for FC Lads+ guides, which are locked from the start.
   */
  lockedFrom?: number;
  /** Custom tactic share code shown in the sidebar. */
  presetCode?: string;
  /** Players mentioned, shown in the sidebar. */
  playerSlugs?: string[];
}

export interface SquadSlot {
  playerSlug: string;
  /** Chemistry style the Lads use on this player in this squad. */
  chem?: string;
}

export interface Squad {
  slug: string;
  name: string;
  /** Short tier label, e.g. "Budget meta starter". */
  tier: string;
  /** Budget tab label, e.g. "50K" or "1.5M". */
  budgetLabel: string;
  /** Total coins for the starting XI plus bench (worked out from player prices). */
  budget: number;
  formation: string;
  chemistry: number;
  width: number;
  depth: number;
  buildUp: string;
  defensiveStyle: string;
  chanceCreation: string;
  keyPlaystyles: string;
  authorSlug: string;
  /** Creator's note on why it works / their record with it. */
  note: string;
  /** e.g. "18-2 in Weekend League testing". */
  record?: string;
  /** Starting XI in the formation's slot order (see lib/formations.ts). */
  lineup: SquadSlot[];
  bench: { playerSlug: string; role: string }[];
  /** The player shown first in the pitch dossier. */
  keyPlayerSlug: string;
  reasons: { title: string; text: string }[];
  upgrades: { fromSlug: string; toSlug: string; gain: string }[];
  /** Custom tactic share code for the in-game Tactics menu. */
  tacticCode?: string;
  /** Guide that breaks this squad down (FC Lads+). */
  guideSlug?: string;
}

export type CollectionBadge = "start" | "in-order" | "meta" | "archive";

export interface CollectionEpisode {
  title: string;
  minutes: number;
  /** Links to the guide page when the episode is also a guide on the site. */
  guideSlug?: string;
  /** Members-only video (Loom or unlisted YouTube), once uploaded. */
  video?: VideoSource;
}

/** A members-only video series in the Learn section, watched in order. Part of FC Lads+. */
export interface Collection {
  slug: string;
  title: string;
  description: string;
  season: string;
  /** Total videos in the series (placeholder until the real list is added). */
  videoCount: number;
  badge?: CollectionBadge;
  /** Step number in the "Start here" learning path. */
  pathStep?: number;
  /** Matching guide category, used to link to related guides. */
  category?: GuideCategory;
  /** Videos in watch order. */
  episodes: CollectionEpisode[];
}
