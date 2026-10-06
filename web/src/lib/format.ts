import type { GuideCategory } from "@/types";

/** 1450000 → "1,450,000" */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

/** 420000 → "420K", 1480000 → "1.48M" */
export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 2,
  })
    .format(value)
    .toUpperCase();
}

/** 18.4 → "+18.4%", -2.8 → "-2.8%" */
export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export const categoryLabels: Record<GuideCategory, string> = {
  tactics: "Tactics",
  gameplay: "Gameplay",
  "skill-moves": "Skill moves",
  "meta-players": "Meta players",
  "fut-champs": "FUT Champs",
  "fc-updates": "FC updates",
  beginner: "Beginner",
  "squad-building": "Squad building",
  "set-pieces": "Set pieces",
  shooting: "Shooting",
};
