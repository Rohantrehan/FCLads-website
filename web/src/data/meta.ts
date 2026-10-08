// The current meta state. Mock values: these will come from the patches / meta_rankings tables.
// Editorial copy is placeholder text written by us until the Lads write the real weekly notes.

export const CURRENT_PATCH = "1.08";
export const CURRENT_WEEK = 28;
/** Monday the current ranking was published. */
export const RANKING_PUBLISHED = "2026-09-28";

/** Short analyst note on how the latest patch changed the meta. */
export const patchImpact = {
  title: "Pace matters more again",
  text: "Sprint changes in 1.08 favour Lengthy AcceleRATE players. Tall, fast strikers are back at the top of the rankings.",
};

/** The Lads' highlighted pick of the week (shown on /players). */
export const proPick = {
  creatorSlug: "hobs",
  playerSlug: "kofi-mensah",
  quote: "With Engine on him, Kofi's dribbling feels like a 94-rated card. Best budget striker in the game right now.",
};

/** Players who got worse with the latest patch. `note` says what changed. */
export const patchNerfs = [
  { playerSlug: "viktor-ramos", note: "Trivela accuracy cut outside the box." },
  {
    playerSlug: "kenji-sato",
    note: "Slower sprint transition for explosive cards.",
  },
  { playerSlug: "callum-vance", note: "Finesse shots curve less." },
];

export const metaAnalystSlug = "stefan";
