// FC Lads+ membership content shared by Home, the pricing page and paywalls.

export const ladsPlus = {
  price: 29,
  currency: "USD",
  priceLabel: "$29",
} as const;

export type PerkKey = "guides" | "discord" | "creators" | "trading" | "review";

export const ladsPlusPerks: { key: PerkKey; title: string; description: string }[] = [
  { key: "guides", title: "Premium guides", description: "Patch-day breakdowns, slider codes and controller inputs." },
  { key: "discord", title: "Private Discord", description: "Members-only channels with the creators and pro players." },
  { key: "creators", title: "Creator access", description: "Ask the Lads directly. Squad and chemistry fixes every week." },
  { key: "trading", title: "Trading brief", description: "Every Monday: what to watch, buy targets and exit prices." },
  { key: "review", title: "Monthly review", description: "A 1-on-1 video review of your own FUT Champs gameplay." },
];
