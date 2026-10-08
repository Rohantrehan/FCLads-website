import "server-only";

// The weekly trading brief (FC Lads+). Server only: the /trading page reads it only for members,
// so none of this reaches a non-member's browser. Mock content until the real briefs exist.

export interface TradingBrief {
  week: number;
  /** ISO dates of the week the brief covers. */
  from: string;
  to: string;
  authorSlug: string;
  readMinutes: number;
  watching: { title: string; text: string }[];
  opportunities: {
    playerSlug: string;
    confidence: "High" | "Medium";
    play: string;
    targetOut: number;
    reason: string;
  }[];
  events: { day: string; tag?: string; title: string; text: string; highlight?: boolean }[];
  /** FC Lads market index, one value per day (oldest first), with notes on key days. */
  index: { date: string; value: number }[];
  indexNotes: { date: string; label: string }[];
  monitor: string[];
}

const indexValues = [104.2, 105.1, 104.6, 105.8, 106.3, 102.1, 101.7, 103.9, 106.8, 108.2, 107.5, 111.9, 114.6, 118.4];

export const currentBrief: TradingBrief = {
  week: 28,
  from: "2026-10-05",
  to: "2026-10-11",
  authorSlug: "wessam",
  readMinutes: 6,
  watching: [
    {
      title: "Fodder prices are at a low",
      text: "86–89 rated fodder is close to its cheapest this season. With a big upgrade SBC expected on Friday, these prices won't last.",
    },
    {
      title: "Top meta golds are steady",
      text: "Weekend League qualifying is over, so most players have their starting XI. Prices of in-demand pace players have stopped falling.",
    },
    {
      title: "Evolution run-ups",
      text: "The new wingers evolution has pushed up cheap 5★ weak foot wingers. Check the price cap before you buy in.",
    },
  ],
  opportunities: [
    {
      playerSlug: "omar-haddad",
      confidence: "High",
      play: "SBC link",
      targetOut: 9_400,
      reason: "Likely to be needed for an upcoming league SBC, and links well with in-form wingers.",
    },
    {
      playerSlug: "antoine-valere",
      confidence: "Medium",
      play: "Out of packs",
      targetOut: 315_000,
      reason: "Leaves packs on Friday. Cards like this usually bounce back by Saturday morning.",
    },
    {
      playerSlug: "matteo-bianchi",
      confidence: "High",
      play: "Safe hold",
      targetOut: 3_400,
      reason: "Already close to his quick-sell value, so there's very little downside.",
    },
  ],
  events: [
    { day: "Thu", tag: "SBC", title: "League SBC", text: "The pre-Weekend League sell-off window opens." },
    {
      day: "Fri",
      tag: "Promo",
      title: "Promo drop (6PM)",
      text: "New objectives and a flood of packs.",
      highlight: true,
    },
    {
      day: "Sat–Sun",
      tag: "Peak",
      title: "Weekend League",
      text: "Highest squad demand. Watch for Sunday evening dips.",
    },
    {
      day: "Mon",
      tag: "Rewards",
      title: "Rewards sell-off",
      text: "Weekend League and Squad Battles rewards hit the market.",
    },
    { day: "Tue–Wed", tag: "Mid-week", title: "Team of the Week", text: "New in-forms and mid-week upgrade SBCs." },
  ],
  index: indexValues.map((value, index) => {
    const date = new Date("2026-09-25T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + index);
    return { date: date.toISOString().slice(0, 10), value };
  }),
  indexNotes: [
    { date: "2026-09-30", label: "Patch 1.08 dip" },
    { date: "2026-10-08", label: "Pre-Weekend League rebound" },
  ],
  monitor: ["marco-velardi", "leo-silva", "julian-cruz", "felix-aldana", "anders-kvist", "antoine-valere"],
};

/** Earlier briefs (titles only for now; full archive pages come with the backend). */
export const pastBriefs = [
  { week: 27, from: "2026-09-28", to: "2026-10-04", title: "After patch 1.08: who recovered and who didn't" },
  { week: 26, from: "2026-09-21", to: "2026-09-27", title: "Launch week: why fodder prices flipped" },
  { week: 25, from: "2026-09-14", to: "2026-09-20", title: "Starter squads and early web app flips" },
];
