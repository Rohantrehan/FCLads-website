// "The hard truth" section on Home: each problem players face, and how FC Lads answers it.

export interface HardTruthItem {
  problem: string;
  answerTitle: string;
  answer: string;
  /** Creator who owns this answer (slug in creators.ts). */
  creatorSlug: string;
  cta: { label: string; href: string };
}

export const hardTruth: HardTruthItem[] = [
  {
    problem: "A new patch drops.",
    answerTitle: "Same-day patch breakdowns.",
    answer:
      "We read the notes, then test every change in-game the same day. You get a plain-English summary of what actually changed and what to do about it.",
    creatorSlug: "stefan",
    cta: { label: "Read patch breakdowns", href: "/learn?category=fc-updates" },
  },
  {
    problem: "The meta changes.",
    answerTitle: "A weekly meta breakdown.",
    answer:
      "Every week the Lads break down the formations, tactics and card types winning right now in FUT Champs, so you always know what the top players are using.",
    creatorSlug: "hobs",
    cta: { label: "Browse meta guides", href: "/learn?category=meta-players" },
  },
  {
    problem: "A player suddenly becomes broken.",
    answerTitle: "Tested before you spend.",
    answer:
      "We put them through real Champs games, tell you if they're worth the coins, and show cheaper alternatives that play almost the same.",
    creatorSlug: "hobs",
    cta: { label: "Watch the video series", href: "/learn/collections" },
  },
  {
    problem: "A tactic stops working.",
    answerTitle: "Updated tactics and slider codes.",
    answer:
      "When a formation gets figured out, we rebuild it. New custom tactics, player instructions and slider values, tested in Elite Division.",
    creatorSlug: "stefan",
    cta: { label: "Browse tactics guides", href: "/learn?category=tactics" },
  },
  {
    problem: "The market moves.",
    answerTitle: "Market calls as they happen.",
    answer:
      "Wessam and the Lads post what to buy, when to sell and why, with screenshots, so you can build coins without living on the transfer market.",
    creatorSlug: "wessam",
    cta: { label: "See the trading posts", href: "/trading" },
  },
];
