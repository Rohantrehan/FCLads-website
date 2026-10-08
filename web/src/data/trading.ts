// Public trading content: the free weekly market note and the "featured movers".
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

/** Two cards to keep an eye on this week (public). */
export const featuredMovers = ["felix-aldana", "anders-kvist"];
