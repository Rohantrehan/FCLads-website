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
  /** Buy/sell targets. Cards and prices are typed in by the creator (no player database or live prices). */
  opportunities: {
    card: string;
    confidence: "High" | "Medium";
    play: string;
    buyBelow: number;
    sellAt: number;
    reason: string;
  }[];
  events: { day: string; tag?: string; title: string; text: string; highlight?: boolean }[];
  /** Where the market is heading, in the creator's words. */
  trends: { label: string; direction: "up" | "down" | "flat"; text: string }[];
  /** Cards or card types worth keeping an eye on. */
  monitor: { card: string; note: string }[];
}

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
      card: "84 rated LaLiga winger (SBC link)",
      confidence: "High",
      play: "SBC link",
      buyBelow: 7_500,
      sellAt: 9_400,
      reason: "Likely to be needed for an upcoming league SBC, and links well with in-form wingers.",
    },
    {
      card: "Last week's 88 rated in-form CB",
      confidence: "Medium",
      play: "Out of packs",
      buyBelow: 280_000,
      sellAt: 315_000,
      reason: "Leaves packs on Friday. Cards like this usually bounce back by Saturday morning.",
    },
    {
      card: "83 rated Serie A fodder",
      confidence: "High",
      play: "Safe hold",
      buyBelow: 2_900,
      sellAt: 3_400,
      reason: "Already close to quick-sell value, so there's very little downside.",
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
  trends: [
    {
      label: "Fodder (86–89)",
      direction: "up",
      text: "Cheapest it's been this season. Expect a jump when Friday's upgrade SBC drops.",
    },
    {
      label: "Meta gold cards",
      direction: "flat",
      text: "Steady since Weekend League qualifying ended. No rush to buy or sell.",
    },
    {
      label: "Last week's in-forms",
      direction: "down",
      text: "Dropping as new Team of the Week cards arrive. Wait for the Sunday evening dip.",
    },
  ],
  monitor: [
    { card: "Cheap 5★ weak foot wingers", note: "Pushed up by the new wingers evolution. Check the price cap first." },
    { card: "Pace strikers under 50K", note: "Patch 1.08 sprint changes keep demand high." },
    { card: "84–85 rated Premier League golds", note: "Common SBC requirement. Good mid-week flips." },
    { card: "Icon base cards", note: "Usually dip before a big promo. Watch Thursday night." },
  ],
};

/** Earlier briefs (titles only for now; full archive pages come with the backend). */
export const pastBriefs = [
  { week: 27, from: "2026-09-28", to: "2026-10-04", title: "After patch 1.08: who recovered and who didn't" },
  { week: 26, from: "2026-09-21", to: "2026-09-27", title: "Launch week: why fodder prices flipped" },
  { week: 25, from: "2026-09-14", to: "2026-09-20", title: "Starter squads and early web app flips" },
];
