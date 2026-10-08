import type { Position } from "@/types";

/** Position groups used by the meta rankings (Home carousel, /players sidebar). */
export const positionGroups = {
  strikers: { label: "Strikers", short: "ST", positions: ["ST", "CF"] },
  wingers: {
    label: "Wingers",
    short: "W",
    positions: ["LW", "RW", "LM", "RM"],
  },
  cam: { label: "Attacking mids", short: "CAM", positions: ["CAM"] },
  cm: { label: "Central mids", short: "CM", positions: ["CM"] },
  cdm: { label: "Defensive mids", short: "CDM", positions: ["CDM"] },
  cb: { label: "Centre-backs", short: "CB", positions: ["CB"] },
  fullbacks: { label: "Full-backs", short: "FB", positions: ["LB", "RB"] },
  gk: { label: "Goalkeepers", short: "GK", positions: ["GK"] },
} satisfies Record<string, { label: string; short: string; positions: Position[] }>;

export type PositionGroup = keyof typeof positionGroups;

export const positionGroupKeys = Object.keys(positionGroups) as PositionGroup[];

export function isPositionGroup(value: unknown): value is PositionGroup {
  return typeof value === "string" && value in positionGroups;
}

export function groupOf(position: Position): PositionGroup {
  return (
    positionGroupKeys.find((key) => (positionGroups[key].positions as Position[]).includes(position)) ?? "strikers"
  );
}

const outfieldLabels = { pac: "PAC", sho: "SHO", pas: "PAS", dri: "DRI", def: "DEF", phy: "PHY" } as const;
const keeperLabels = { pac: "DIV", sho: "HAN", pas: "KIC", dri: "REF", def: "SPD", phy: "POS" } as const;
const outfieldNames = {
  pac: "Pace",
  sho: "Shooting",
  pas: "Passing",
  dri: "Dribbling",
  def: "Defending",
  phy: "Physicality",
} as const;
const keeperNames = {
  pac: "Diving",
  sho: "Handling",
  pas: "Kicking",
  dri: "Reflexes",
  def: "Speed",
  phy: "Positioning",
} as const;

/** Short face-stat labels. Goalkeepers use DIV/HAN/KIC/REF/SPD/POS in the same six slots. */
export function statLabels(position: Position) {
  return position === "GK" ? keeperLabels : outfieldLabels;
}

/** Full face-stat names, e.g. "Pace" or, for goalkeepers, "Diving". */
export function statNames(position: Position) {
  return position === "GK" ? keeperNames : outfieldNames;
}
