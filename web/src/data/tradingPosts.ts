import "server-only";

import type { TradingPost } from "@/types";

// Sample trading posts, newest first, used until Sanity is set up. Server only: FC Lads+ posts are
// cut down in lib/tradingAccess.ts before anything reaches a non-member's browser.
// Screenshots are placeholders: real posts carry the creator's own screenshot.
export const tradingPosts: TradingPost[] = [
  {
    id: "fodder-before-friday",
    authorSlug: "wessam",
    postedAt: "2026-10-12T09:30:00Z",
    access: "plus",
    title: "Stock up on 86–88 fodder before Friday's upgrade SBC",
    text: "Fodder is the cheapest it's been all season. I'm buying 86s under 3,000 and 87s under 5,500 today, and listing them Thursday night when the new SBC lands.",
    image: { src: "/trading/shot-rising.svg", alt: "Price chart of 86–88 rated fodder rising over the last two weeks" },
  },
  {
    id: "thursday-rule",
    authorSlug: "wessam",
    postedAt: "2026-10-12T07:00:00Z",
    access: "free",
    title: "Never panic-buy on a Thursday night",
    text: "Everyone's building for Weekend League, so prices are at their highest. If you need a player, buy him Monday or Tuesday and you'll usually save 10–15%.",
  },
  {
    id: "in-forms-dropping",
    authorSlug: "hobs",
    postedAt: "2026-10-11T18:15:00Z",
    access: "plus",
    title: "Last week's in-forms are still dropping: wait for Sunday",
    text: "Team of the Week cards from last Wednesday have fallen every day since. They usually bottom out on Sunday evening, so hold off until then.",
    image: { src: "/trading/shot-falling.svg", alt: "Price chart of last week's in-form cards falling" },
  },
  {
    id: "rewards-monday",
    authorSlug: "wessam",
    postedAt: "2026-10-11T10:00:00Z",
    access: "free",
    title: "Monday rewards will flood the market again",
    text: "Weekend League and Squad Battles rewards come out Monday morning. Expect a dip on mid-tier golds for a few hours. Good time to fill your bench.",
    image: { src: "/trading/shot-list.svg", alt: "List of mid-tier gold card prices" },
  },
  {
    id: "sbc-links",
    authorSlug: "wessam",
    postedAt: "2026-10-10T16:45:00Z",
    access: "plus",
    title: "Three SBC link cards worth holding this week",
    text: "LaLiga and Serie A 84s keep showing up in league SBCs. I'm holding a handful of each and selling after the next league SBC drops.",
    image: { src: "/trading/shot-list.svg", alt: "List of SBC link card prices" },
  },
  {
    id: "pace-strikers",
    authorSlug: "stefan",
    postedAt: "2026-10-09T13:20:00Z",
    access: "free",
    title: "Pace strikers under 50K are holding their price",
    text: "After patch 1.08's sprint changes, tall fast strikers are in demand and their prices have barely moved. Don't expect a dip on these before the weekend.",
    image: { src: "/trading/shot-rising.svg", alt: "Price chart of cheap pace strikers holding steady" },
  },
  {
    id: "icons-before-promo",
    authorSlug: "wessam",
    postedAt: "2026-10-09T08:00:00Z",
    access: "plus",
    title: "Icon base cards usually dip before a big promo",
    text: "With the next promo expected on Friday, base Icons tend to drop on Thursday night as people sell to open packs. That's my window to buy.",
  },
  {
    id: "evolution-wingers",
    authorSlug: "hobs",
    postedAt: "2026-10-07T19:00:00Z",
    access: "free",
    title: "The wingers evolution pushed cheap 5★ weak foot cards up",
    text: "Check the evolution's price cap before buying in. Some of these cards have doubled since it came out, and they'll drop again when it ends.",
    image: { src: "/trading/shot-rising.svg", alt: "Price chart of 5-star weak foot wingers rising" },
  },
  {
    id: "patch-dip",
    authorSlug: "wessam",
    postedAt: "2026-10-05T11:30:00Z",
    access: "free",
    title: "Who recovered after patch 1.08, and who didn't",
    text: "Most meta golds are back to their pre-patch price. Finesse-heavy wingers are still down about 8% because the finesse nerf hit them hardest.",
    image: { src: "/trading/shot-falling.svg", alt: "Price chart showing the dip after patch 1.08" },
  },
  {
    id: "tax-reminder",
    authorSlug: "wessam",
    postedAt: "2026-10-02T09:00:00Z",
    access: "free",
    title: "Always count the 5% EA tax before you flip",
    text: "A card bought at 10,000 has to sell for 10,527 just to break even. Use the tax calculator on this page before every flip.",
  },
];
