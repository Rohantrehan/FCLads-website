// Slot layouts for the vertical pitch on squad pages. x/y are percentages (0,0 = top left, our
// goal at the bottom). A squad's `lineup` lists players in this slot order.

export interface FormationSlot {
  label: string;
  x: number;
  y: number;
}

const backFour: FormationSlot[] = [
  { label: "GK", x: 50, y: 91 },
  { label: "LB", x: 13, y: 70 },
  { label: "CB", x: 37, y: 75 },
  { label: "CB", x: 63, y: 75 },
  { label: "RB", x: 87, y: 70 },
];

export const formations: Record<string, FormationSlot[]> = {
  "4-2-3-1": [
    ...backFour,
    { label: "CDM", x: 35, y: 55 },
    { label: "CDM", x: 65, y: 55 },
    { label: "LAM", x: 15, y: 34 },
    { label: "CAM", x: 50, y: 36 },
    { label: "RAM", x: 85, y: 34 },
    { label: "ST", x: 50, y: 13 },
  ],
  "4-3-2-1": [
    ...backFour,
    { label: "CM", x: 20, y: 53 },
    { label: "CM", x: 50, y: 57 },
    { label: "CM", x: 80, y: 53 },
    { label: "CF", x: 30, y: 31 },
    { label: "CF", x: 70, y: 31 },
    { label: "ST", x: 50, y: 13 },
  ],
  "4-4-2": [
    ...backFour,
    { label: "LM", x: 13, y: 45 },
    { label: "CM", x: 37, y: 52 },
    { label: "CM", x: 63, y: 52 },
    { label: "RM", x: 87, y: 45 },
    { label: "ST", x: 35, y: 16 },
    { label: "ST", x: 65, y: 16 },
  ],
  "4-3-3": [
    ...backFour,
    { label: "CM", x: 24, y: 50 },
    { label: "CDM", x: 50, y: 57 },
    { label: "CM", x: 76, y: 50 },
    { label: "LW", x: 15, y: 23 },
    { label: "ST", x: 50, y: 14 },
    { label: "RW", x: 85, y: 23 },
  ],
};

export function formationSlots(formation: string) {
  return formations[formation] ?? formations["4-2-3-1"];
}
