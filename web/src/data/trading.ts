// Public trading content: the free weekly market note, the watch list and the weekly market cycle.
// The members-only brief lives in data/tradingBrief.ts (server only).
// Mock editorial copy until the Lads write the real notes.

export const freeMarketNote = {
  authorSlug: "wessam",
  publishedAt: "2026-10-05",
  headline:
    "The pre-Weekend League sell-off is starting early. Take profit on mid-tier cards before Thursday's content drop.",
  body: "Lots of 86–88 rated cards are being listed as players lock in their weekend teams, and the next upgrade SBC is expected to soak up high-rated fodder. If you're holding mid-tier players you don't use, Wednesday night is a better time to sell than Friday.",
  action: "Take profit",
  risk: "Low",
  window: "Next 48 hours",
};

/** Card types to keep an eye on this week (public). Typed in by the creator. */
export const watchList = [
  { card: "86–88 rated fodder", note: "Sell before Thursday's content drop." },
  { card: "Cheap meta pace strikers", note: "Demand stays high after patch 1.08." },
];

/** How a normal week on the transfer market goes. General guidance, free for everyone. */
export const weeklyCycle = [
  {
    day: "Mon",
    title: "Rewards sell-off",
    text: "Weekend League and Squad Battles rewards flood the market. Prices dip.",
  },
  { day: "Tue–Wed", title: "Team of the Week", text: "New in-forms and mid-week SBCs. Good time to buy fodder." },
  { day: "Thu", title: "Pre-weekend rise", text: "Players build for Weekend League. Prices climb, so sell." },
  { day: "Fri", title: "Promo drop", text: "New packs and SBCs at 6PM UK. Expect big swings." },
  { day: "Sat–Sun", title: "Weekend League", text: "Highest demand on Saturday. Watch for a Sunday evening dip." },
];
