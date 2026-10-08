import { isVisibleCreator } from "@/data/creators";
import { getPlayer } from "@/data/players";
import type { Squad } from "@/types";

// Mock squad blueprints built from the fictional players in data/players.ts.
// `budget` is worked out below from the players' prices (starting XI + bench).
type SquadInput = Omit<Squad, "budget">;

const allSquads: SquadInput[] = [
  {
    slug: "50k-weekend-league-starter",
    name: "50K meta starter",
    tier: "Budget meta starter",
    budgetLabel: "50K",
    formation: "4-2-3-1",
    chemistry: 33,
    width: 45,
    depth: 55,
    buildUp: "Direct passing",
    defensiveStyle: "Balanced",
    chanceCreation: "Forward runs",
    keyPlaystyles: "Incisive Pass+ & Rapid",
    authorSlug: "stefan",
    record: "18-2 in Weekend League testing",
    note: "Went 18-2 in Weekend League testing with this exact core. The double pivot covers cutbacks perfectly.",
    keyPlayerSlug: "leo-silva",
    lineup: [
      { playerSlug: "bruno-matos" },
      { playerSlug: "ryo-tanaka", chem: "Shadow" },
      { playerSlug: "lucas-moreau", chem: "Shadow" },
      { playerSlug: "sean-doyle", chem: "Shadow" },
      { playerSlug: "pablo-ortega", chem: "Shadow" },
      { playerSlug: "matteo-bianchi", chem: "Anchor" },
      { playerSlug: "felipe-costa", chem: "Anchor" },
      { playerSlug: "marco-bellini", chem: "Hunter" },
      { playerSlug: "leo-silva", chem: "Engine" },
      { playerSlug: "jamal-hart", chem: "Hunter" },
      { playerSlug: "omar-haddad", chem: "Hunter" },
    ],
    bench: [
      { playerSlug: "tom-ward", role: "Back-up keeper" },
      { playerSlug: "aidan-kelly", role: "Left-back cover" },
      { playerSlug: "samu-nilsen", role: "Holding mid" },
      { playerSlug: "gianni-rossi", role: "Recovery pace" },
    ],
    reasons: [
      {
        title: "Midfield lockdown",
        text: "Bianchi and Costa both stay back while attacking and cover the centre, so through balls into the box get cut out early.",
      },
      {
        title: "Free-roaming playmaker",
        text: "Leo Silva drifts into the half-spaces with Incisive Pass+ and feeds Haddad's runs before the defence can drop.",
      },
      {
        title: "Full-backs who recover",
        text: "Tanaka and Ortega have high work rates both ways, so they get back against fast wingers without leaving the centre-backs exposed.",
      },
    ],
    upgrades: [
      {
        fromSlug: "matteo-bianchi",
        toSlug: "oskar-brandt",
        gain: "Much better defending and Intercept+ to shut down elite CAMs.",
      },
      {
        fromSlug: "omar-haddad",
        toSlug: "kofi-mensah",
        gain: "Rapid+, 5★ weak foot and the best budget dribbling in the game.",
      },
    ],
    tacticCode: "FCL-50K-4231",
    guideSlug: "beat-the-high-press",
  },
  {
    slug: "100k-hybrid",
    name: "100K hybrid beast",
    tier: "Budget hybrid",
    budgetLabel: "100K",
    formation: "4-3-2-1",
    chemistry: 33,
    width: 45,
    depth: 60,
    buildUp: "Balanced",
    defensiveStyle: "Press after possession loss",
    chanceCreation: "Balanced",
    keyPlaystyles: "Technical & Rapid",
    authorSlug: "hobs",
    record: "14-6 in the first promo weekend",
    note: "My go-to for the first weekend of a new promo. Cheap, fast, and very hard to break down.",
    keyPlayerSlug: "omar-haddad",
    lineup: [
      { playerSlug: "bruno-matos" },
      { playerSlug: "mateus-prado", chem: "Shadow" },
      { playerSlug: "felix-aldana", chem: "Shadow" },
      { playerSlug: "lucas-moreau", chem: "Shadow" },
      { playerSlug: "pablo-ortega", chem: "Shadow" },
      { playerSlug: "felipe-costa", chem: "Engine" },
      { playerSlug: "matteo-bianchi", chem: "Anchor" },
      { playerSlug: "leo-silva", chem: "Engine" },
      { playerSlug: "omar-haddad", chem: "Hunter" },
      { playerSlug: "marco-bellini", chem: "Hunter" },
      { playerSlug: "santi-arismendi", chem: "Hunter" },
    ],
    bench: [
      { playerSlug: "tom-ward", role: "Back-up keeper" },
      { playerSlug: "sean-doyle", role: "Centre-back cover" },
      { playerSlug: "aidan-kelly", role: "Left-back cover" },
      { playerSlug: "samu-nilsen", role: "Close out games" },
      { playerSlug: "jamal-hart", role: "Impact pace" },
    ],
    reasons: [
      {
        title: "Two quick CFs",
        text: "Haddad and Bellini pin the centre-backs, so Arismendi gets one-on-ones in behind.",
      },
      {
        title: "Narrow three",
        text: "Costa, Bianchi and Silva stay compact, which makes it very hard to play through the middle.",
      },
      {
        title: "Cheap to upgrade",
        text: "Every position has a clear next step, so you can improve one player at a time.",
      },
    ],
    upgrades: [
      { fromSlug: "santi-arismendi", toSlug: "kofi-mensah", gain: "A big jump in finishing, dribbling and weak foot." },
      { fromSlug: "felix-aldana", toSlug: "darius-okonkwo", gain: "Aerial+ and much stronger in one-on-one duels." },
    ],
    tacticCode: "FCL-100K-4321",
  },
  {
    slug: "250k-weekend-league-meta",
    name: "250K Weekend League meta",
    tier: "Mid budget",
    budgetLabel: "250K",
    formation: "4-4-2",
    chemistry: 33,
    width: 50,
    depth: 62,
    buildUp: "Fast build-up",
    defensiveStyle: "Balanced",
    chanceCreation: "Direct passing",
    keyPlaystyles: "Aerial & Rapid",
    authorSlug: "wessam",
    record: "Rank 2 rewards two weekends running",
    note: "Two strikers up top and wide players who track back. Simple, strong and great value for the coins.",
    keyPlayerSlug: "luka-horvat",
    lineup: [
      { playerSlug: "anders-kvist" },
      { playerSlug: "mateus-prado", chem: "Shadow" },
      { playerSlug: "felix-aldana", chem: "Shadow" },
      { playerSlug: "lucas-moreau", chem: "Shadow" },
      { playerSlug: "liam-carrow", chem: "Shadow" },
      { playerSlug: "teo-marchand", chem: "Engine" },
      { playerSlug: "bastian-kohl", chem: "Architect" },
      { playerSlug: "felipe-costa", chem: "Anchor" },
      { playerSlug: "jamal-hart", chem: "Hunter" },
      { playerSlug: "luka-horvat", chem: "Marksman" },
      { playerSlug: "tariq-al-mansoor", chem: "Hunter" },
    ],
    bench: [
      { playerSlug: "tom-ward", role: "Back-up keeper" },
      { playerSlug: "gianni-rossi", role: "Recovery pace" },
      { playerSlug: "samu-nilsen", role: "Holding mid" },
      { playerSlug: "aidan-kelly", role: "Left-back cover" },
      { playerSlug: "marco-bellini", role: "Impact winger" },
    ],
    reasons: [
      {
        title: "Big and fast up top",
        text: "Horvat wins the headers and Tariq runs in behind, so you always have two options.",
      },
      { title: "Wingers who defend", text: "Marchand and Hart track back, making a solid back six without the ball." },
      {
        title: "A keeper you can trust",
        text: "Kvist saves the shots a budget keeper wouldn't. Worth every coin at this level.",
      },
    ],
    upgrades: [
      { fromSlug: "tariq-al-mansoor", toSlug: "kofi-mensah", gain: "Rapid+ and far better finishing." },
      { fromSlug: "teo-marchand", toSlug: "ilias-benali", gain: "Elite dribbling down the left." },
    ],
    tacticCode: "FCL-250K-442",
  },
  {
    slug: "500k-elite-division",
    name: "500K Elite Division squad",
    tier: "Competitive squad",
    budgetLabel: "500K",
    formation: "4-3-2-1",
    chemistry: 33,
    width: 40,
    depth: 71,
    buildUp: "Direct passing",
    defensiveStyle: "Press after possession loss",
    chanceCreation: "Forward runs",
    keyPlaystyles: "Intercept+ & Rapid+",
    authorSlug: "stefan",
    record: "20-0 in Elite Division testing",
    note: "Built for fast transitions and recovery. The left CF drops in to make a 4-4-2 block without the ball.",
    keyPlayerSlug: "kofi-mensah",
    lineup: [
      { playerSlug: "anders-kvist" },
      { playerSlug: "mateus-prado", chem: "Shadow" },
      { playerSlug: "darius-okonkwo", chem: "Shadow" },
      { playerSlug: "felix-aldana", chem: "Shadow" },
      { playerSlug: "liam-carrow", chem: "Shadow" },
      { playerSlug: "bastian-kohl", chem: "Architect" },
      { playerSlug: "oskar-brandt", chem: "Anchor" },
      { playerSlug: "felipe-costa", chem: "Engine" },
      { playerSlug: "ilias-benali", chem: "Hunter" },
      { playerSlug: "enzo-ricci", chem: "Hunter" },
      { playerSlug: "kofi-mensah", chem: "Engine" },
    ],
    bench: [
      { playerSlug: "tom-ward", role: "Back-up keeper" },
      { playerSlug: "lucas-moreau", role: "Centre-back cover" },
      { playerSlug: "matteo-bianchi", role: "Close out games" },
      { playerSlug: "leo-silva", role: "Creative spark" },
      { playerSlug: "omar-haddad", role: "Impact pace" },
    ],
    reasons: [
      {
        title: "Brandt shields everything",
        text: "Intercept+ in front of Okonkwo and Aldana means very few clear chances against you.",
      },
      {
        title: "Kofi on Engine",
        text: "With Engine his dribbling feels like a far more expensive card, and he finishes with both feet.",
      },
      {
        title: "Fast transitions",
        text: "Win it back and play early to Benali or Ricci: the counter is on before the opponent recovers.",
      },
    ],
    upgrades: [
      { fromSlug: "enzo-ricci", toSlug: "marcus-lindqvist", gain: "Stronger, faster and two-footed." },
      {
        fromSlug: "felipe-costa",
        toSlug: "hugo-lindeman",
        gain: "Incisive Pass+ and elite vision in the final third.",
      },
    ],
    tacticCode: "FCL-500K-4321",
    guideSlug: "best-custom-tactics-this-patch",
  },
  {
    slug: "1-5m-pro-squad",
    name: "1.5M pro squad",
    tier: "Endgame",
    budgetLabel: "1.5M",
    formation: "4-2-3-1",
    chemistry: 33,
    width: 48,
    depth: 68,
    buildUp: "Short passing",
    defensiveStyle: "Constant pressure",
    chanceCreation: "Forward runs",
    keyPlaystyles: "Quick Step+ & Finesse Shot+",
    authorSlug: "hobs",
    record: "Rank 1 finish, 20-0",
    note: "The best players in the game around a double pivot. This is the team I took to a 20-0.",
    keyPlayerSlug: "kai-vanderbilt",
    lineup: [
      { playerSlug: "anders-kvist" },
      { playerSlug: "mateus-prado", chem: "Shadow" },
      { playerSlug: "darius-okonkwo", chem: "Shadow" },
      { playerSlug: "felix-aldana", chem: "Shadow" },
      { playerSlug: "liam-carrow", chem: "Shadow" },
      { playerSlug: "oskar-brandt", chem: "Anchor" },
      { playerSlug: "mateo-silva", chem: "Engine" },
      { playerSlug: "ilias-benali", chem: "Hunter" },
      { playerSlug: "hugo-lindeman", chem: "Architect" },
      { playerSlug: "jonah-brightwell", chem: "Finisher" },
      { playerSlug: "kai-vanderbilt", chem: "Hunter" },
    ],
    bench: [
      { playerSlug: "bruno-matos", role: "Back-up keeper" },
      { playerSlug: "lucas-moreau", role: "Centre-back cover" },
      { playerSlug: "ryo-tanaka", role: "Left-back cover" },
      { playerSlug: "bastian-kohl", role: "Control the midfield" },
      { playerSlug: "kofi-mensah", role: "Impact striker" },
    ],
    reasons: [
      {
        title: "Vanderbilt on the turn",
        text: "Quick Step+ out of the first touch: he's facing goal before the centre-back reacts.",
      },
      {
        title: "Silva runs the game",
        text: "Two-footed and tireless next to Brandt, he wins it back and starts every attack.",
      },
      {
        title: "Finesse from both wings",
        text: "Benali and Brightwell cut inside and finesse to the far post. Very hard to defend.",
      },
    ],
    upgrades: [
      {
        fromSlug: "ilias-benali",
        toSlug: "marco-velardi",
        gain: "Move Velardi out wide for Finesse Shot+ and Rapid+ on the left.",
      },
    ],
    tacticCode: "FCL-15M-4231",
  },
  {
    slug: "250k-wl-meta",
    name: "250K Weekend League meta",
    tier: "Mid budget",
    budgetLabel: "250K",
    formation: "4-4-2",
    chemistry: 33,
    width: 50,
    depth: 62,
    buildUp: "Fast build-up",
    defensiveStyle: "Balanced",
    chanceCreation: "Direct passing",
    keyPlaystyles: "Quick Step+ & Trivela",
    authorSlug: "tfv-gaming",
    note: "Two strikers who both drop short. Went 10-0 in Playoffs with this.",
    keyPlayerSlug: "antoine-valere",
    lineup: [
      { playerSlug: "anders-kvist" },
      { playerSlug: "mateus-prado" },
      { playerSlug: "felix-aldana" },
      { playerSlug: "lucas-moreau" },
      { playerSlug: "liam-carrow" },
      { playerSlug: "teo-marchand" },
      { playerSlug: "bastian-kohl" },
      { playerSlug: "felipe-costa" },
      { playerSlug: "jamal-hart" },
      { playerSlug: "antoine-valere" },
      { playerSlug: "tariq-al-mansoor" },
    ],
    bench: [],
    reasons: [],
    upgrades: [],
  },
];

const priceOf = (slug: string) => getPlayer(slug)?.price ?? 0;

/** Squads shown on the site, cheapest first. Squads by hidden creators are left out. */
export const squads: Squad[] = allSquads
  .filter((squad) => isVisibleCreator(squad.authorSlug))
  .map((squad) => ({
    ...squad,
    budget: [...squad.lineup, ...squad.bench].reduce((sum, slot) => sum + priceOf(slot.playerSlug), 0),
  }))
  .sort((a, b) => a.budget - b.budget);

export function getSquad(slug: string) {
  return squads.find((squad) => squad.slug === slug);
}

export function getSquadsByAuthor(slug: string) {
  return squads.filter((squad) => squad.authorSlug === slug);
}
