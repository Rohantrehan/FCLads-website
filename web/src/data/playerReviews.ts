import "server-only";

import type { PlayerReview } from "@/types";

// In-depth Lads reviews (FC Lads+). Server only: read through lib/playerAccess.ts, which drops
// them for non-members, so this text never reaches a non-member's browser.
export const playerReviews: Record<string, PlayerReview> = {
  "kai-vanderbilt": {
    authorSlug: "wessam",
    quote:
      "The turn is what makes him. One Quick Step out of a first touch and the centre-back is already facing the wrong way. Pair him with a runner and he scores from nothing.",
    insights: [
      {
        title: "First-touch turn",
        text: "Receive on the half-turn with the left stick held: he exits at full speed before defenders react.",
      },
      {
        title: "Finesse from the left",
        text: "Cut inside from the left channel and finesse to the far post. It's his highest-percentage shot.",
      },
      {
        title: "Where he struggles",
        text: "Against two holding mids he gets crowded out. Drift wide to drag one out first.",
      },
    ],
  },
  "marco-velardi": {
    authorSlug: "stefan",
    quote:
      "Since the patch, his step-over sprint boost kicks in instantly and gets him past deep defensive lines before the auto-tackle fires. From outside the box his trivela is the most reliable finish we've tested this season.",
    insights: [
      {
        title: "Sprint trigger",
        text: "A step-over into sprint gives an instant Lengthy burst that beats recovering defenders.",
      },
      {
        title: "Faster release",
        text: "His shooting animation releases a touch quicker than most meta strikers. Shoot early.",
      },
      {
        title: "Finesse+ angles",
        text: "Inside 25 yards, aim finesse shots across the keeper: the curve beats manual positioning.",
      },
    ],
  },
  "kofi-mensah": {
    authorSlug: "hobs",
    quote:
      "With an Engine chemistry style his left-stick dribbling feels almost identical to Vanderbilt. For 68K that's ridiculous value.",
    insights: [
      {
        title: "Engine, not Hunter",
        text: "The dribbling boost matters more than raw pace: he's already fast enough.",
      },
      {
        title: "Run the channels",
        text: "Use him on the left of a front two and play early balls into the channel.",
      },
      {
        title: "Sell window",
        text: "His price climbs every Thursday as Weekend League starts. Buy early in the week.",
      },
    ],
  },
};
