import type { GuideContent } from "@/types";

// Article bodies, keyed by guide slug. In the backend phase this comes from the CMS
// (`GET /guides/:slug`). Guides without an entry show a "full write-up coming soon" fallback.

const contents: GuideContent[] = [
  {
    slug: "beat-the-high-press",
    highlight: "high press",
    patch: "1.08",
    presetCode: "FCL-PRS-108",
    playerSlugs: ["marco-velardi", "leo-silva", "antoine-valere"],
    intro: [
      "In the current patch, opponents using 71-depth setups pull your defensive midfielders inward and create dead zones in midfield. If your first instinct is to sprint or play an instant one-touch pass forward, you will keep losing the ball in your own third.",
      "Beating this isn't about reflexes. It's about spacing, baiting the press, and then using the diagonal space they leave behind their full-back.",
    ],
    blocks: [
      { type: "section", id: "recognise-the-press", title: "Recognising the 71-depth press trigger" },
      {
        type: "p",
        text: "When an opponent plays with defensive depth at 71 or higher, the game treats your ball carrier as vulnerable the moment you take a heavy touch towards your own goal. Two AI players step up together while the opponent's second-man press (R1/RB) blocks your nearest central pass.",
      },
      {
        type: "steps",
        items: [
          {
            title: "Spot the trap before you receive the ball",
            text: "Check your radar before the pass arrives. If their central midfielders are sprinting at you together, the press is on.",
          },
          {
            title: "Hold L1/LB to call your striker short",
            text: "Their centre-back either follows and opens a gap behind, or stays back and leaves you a clean third-man pass.",
          },
          {
            title: "Play a driven ground pass (R1 + X / RB + A) into the half-space",
            text: "A normal short pass gets intercepted. The driven pass is fast enough to get through a crowded press.",
          },
        ],
      },
      {
        type: "tip",
        label: "Lads pro tip",
        title: "Never sprint on your first touch",
        text: "When you receive with your back to goal, let go of sprint so your player shields the ball. Tap L1 to face up, let the presser run past your shoulder, then roll into the space with the left stick.",
      },
      {
        type: "controls",
        title: "Controller inputs",
        successRate: "84% in Elite Division testing",
        inputs: ["L1", "R1", "Through ball"],
        result: "Driven lofted pass to the far wing",
        note: "Use 2.8 to 3.2 bars of power aimed at your opposite full-back. The press leaves that wing completely open.",
      },
      {
        type: "player",
        slug: "marco-velardi",
        note: "Ideal striker to drop short: 95 short passing and Incisive Pass+.",
      },
      { type: "section", id: "driven-triangles", title: "Breaking the second-man press with triangles and switches" },
      {
        type: "p",
        text: "Once you've pulled the first line of their press into your half, their back line is briefly stretched. This is where we break down the exact 4-3-2-1 counter setup (45 width, 71-depth counter) and the inputs that switch play instantly.",
      },
      {
        type: "p",
        text: "Pre-buffer the driven lofted pass before your winger crosses halfway. Their full-backs get dragged out of position and you get a 3v2 on the break almost every time.",
      },
      {
        type: "steps",
        items: [
          { title: "Set up the triangle", text: "CM drops between the centre-backs, CAM drifts to the half-space, winger holds the touchline." },
          { title: "Bounce, then switch", text: "One-two with the CAM, then the driven switch on the second touch, never the first." },
          { title: "Attack the 3v2", text: "Winger drives inside, overlapping full-back holds width, striker pins the far centre-back." },
        ],
      },
      { type: "section", id: "controller-breakdown", title: "Full controller input breakdown" },
      { type: "p", text: "Every input, in order, with timing windows for both PlayStation and Xbox layouts." },
      { type: "section", id: "custom-tactics", title: "Custom tactics and sliders" },
      { type: "p", text: "The full custom tactic and player instructions, with an import code you can paste straight into the game." },
      { type: "section", id: "chem-styles", title: "Recommended chemistry styles" },
      { type: "p", text: "Which chem style to use on each position in this setup, and budget alternatives." },
    ],
    lockedFrom: 6,
  },
  {
    slug: "hybrid-overload-custom-tactic",
    highlight: "custom tactic",
    patch: "1.08",
    presetCode: "FCL-HYB-108",
    playerSlugs: ["kai-vanderbilt", "mateo-silva"],
    intro: [
      "This is the 4-3-2-1 setup most of the Lads are running in Champs this patch. It builds passing triangles in the half-spaces that 71-depth pressing can't keep up with.",
    ],
    blocks: [
      { type: "section", id: "the-shape", title: "The shape" },
      {
        type: "p",
        text: "Two CFs sit narrow behind the striker, the middle three stay compact, and the full-backs stay back while attacking. It looks defensive, but the triangles do the work.",
      },
      {
        type: "steps",
        items: [
          { title: "Width 45, depth 65", text: "Narrow enough to protect cutbacks, high enough to win the ball back early." },
          { title: "Balanced build-up", text: "Direct passing gets punished by the press. Balanced keeps your shape." },
          { title: "CFs on 'Get into box'", text: "They arrive late and are almost impossible to track." },
        ],
      },
      {
        type: "tip",
        label: "TFV's tip",
        title: "Switch the CDM to 'Cover centre' against 5 at the back",
        text: "It stops the through ball between your centre-backs, which is the only real weakness of this shape.",
      },
    ],
  },
  {
    slug: "fut-champs-your-first-10-games",
    highlight: "first 10 games",
    patch: "1.08",
    playerSlugs: ["leo-silva"],
    intro: [
      "Your first ten Champs games decide how the weekend feels. Hobs breaks down how to pace your games, reset after a bad loss, and close out leads.",
    ],
    blocks: [
      { type: "section", id: "pacing", title: "Pacing your games" },
      { type: "p", text: "When to queue, when to take a break, and why playing ten in a row is a mistake." },
      { type: "section", id: "tilt", title: "Resetting after a bad loss" },
      { type: "p", text: "A simple three-step routine Hobs uses between games." },
      { type: "section", id: "game-management", title: "Game-management tactics" },
      { type: "p", text: "The custom tactic to switch to when you go 1-0 up." },
    ],
    lockedFrom: 0,
  },
];

export function getGuideContent(slug: string) {
  return contents.find((content) => content.slug === slug);
}
