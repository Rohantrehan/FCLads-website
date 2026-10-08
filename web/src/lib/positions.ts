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
