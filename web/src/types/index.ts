// Shared domain types. Shaped like the future database tables (see FC_LADS_PROJECT_REPORT.md §6)
// so mock data in src/data can be swapped for API responses later without touching components.

/** Content access level: free for everyone, or FC Lads+ members only. */
export type AccessTier = "free" | "plus";

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

export interface Player {
  slug: string;
  name: string;
  /** Short name shown on cards, e.g. "M. Silva". Falls back to `name`. */
  cardName?: string;
  ovr: number;
  position: Position;
  /** ISO 3166 alpha-3 style code shown on cards, e.g. "NED". */
  nation: string;
  club: string;
  stats: FaceStats;
  /** Approximate transfer market price in coins. */
  price?: number;
  /** Price change over the last week, in percent (e.g. 18.4 or -2.8). */
  trend?: number;
  metaRank?: number;
  /** Short label such as "META S+" or "S-TIER". */
  metaTag?: string;
  playstyles?: string[];
  verdict?: string;
  matchUsage?: string;
  image?: string;
}

export interface CreatorSocials {
  youtube?: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
  twitch?: string;
}

export interface Creator {
  slug: string;
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
  bio?: string;
  socials: CreatorSocials;
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
  youtubeId?: string;
  image?: string;
}
