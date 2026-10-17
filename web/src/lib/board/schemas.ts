import { z } from "zod";
import { categoryLabels } from "@/lib/format";
import { parseVideoLink } from "@/lib/board/video";

// What the posting board sends when you save, checked on the server before anything is written.
// The database checks the basics again (see the content migration).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);
const required = (max: number, what: string) => text(max).min(1, `Add ${what}.`);
const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((value) => value || undefined);
const slug = z
  .string()
  .trim()
  .min(2, "Add a web address.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Web address: lowercase letters, numbers and dashes only.");
const date = z.iso.datetime({ offset: true, message: "Pick a date and time." });
const status = z.enum(["draft", "published"]);
const access = z.enum(["free", "plus"]);
const count = (max: number, what = "Numbers") =>
  z
    .number({ error: `${what}: add a number.` })
    .int(`${what}: whole numbers only.`)
    .min(0, `${what} can't be below 0.`)
    .max(max, `${what}: that number is too big.`);
/** Minutes of reading or video. */
const minutes = (what: string) =>
  z.number({ error: `Add ${what}.` }).int().min(1, `Add ${what}.`).max(600, `${what}: 600 minutes at most.`);

/** Our own uploads (Supabase "media" bucket) or a picture shipped with the site. */
const imageUrl = z
  .string()
  .refine(
    (value) => value.startsWith(`${supabaseUrl}/storage/v1/object/public/media/`) || /^\/[\w/.-]+$/.test(value),
    "Upload the picture again.",
  );

const videoLink = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((value, context) => {
    if (!value) return null;
    const video = parseVideoLink(value);
    if (!video) {
      context.addIssue({ code: "custom", message: "Video: paste a Loom or YouTube link." });
      return z.NEVER;
    }
    return video;
  });

export const tradingPostInput = z.object({
  id: z.uuid().optional(),
  status,
  access,
  authorSlug: slug,
  postedAt: date,
  title: required(120, "a title"),
  text: required(3000, "the text"),
  image: z.object({ src: imageUrl, alt: text(200) }).nullable(),
});

const target = z.object({ card: required(80, "the card"), buyBelow: count(100_000_000, "Buy below") });
const pollOption = z.object({ label: required(80, "each answer"), votes: count(10_000_000, "Votes") });

export const feedFields = {
  video: z.object({
    title: required(140, "a title"),
    excerpt: text(400),
    minutes: minutes("the video length"),
    views: count(1_000_000_000, "Views").optional(),
    approval: z.number().int().min(0).max(100).optional(),
    youtubeId: z
      .string()
      .trim()
      .optional()
      .transform((value, context) => {
        if (!value) return undefined;
        const video = parseVideoLink(value);
        if (video?.provider !== "youtube") {
          context.addIssue({ code: "custom", message: "YouTube clip: paste a YouTube link." });
          return z.NEVER;
        }
        return video.id;
      }),
    guideSlug: slug.optional().or(z.literal("").transform(() => undefined)),
  }),
  update: z.object({
    title: required(140, "a title"),
    points: z.array(required(300, "each point")).min(1, "Add at least one point.").max(8),
  }),
  trading: z.object({
    title: required(140, "a title"),
    targets: z.array(target).min(1, "Add at least one target.").max(10),
    freeTargets: count(10, "Targets everyone can see"),
  }),
  tip: z.object({ label: required(60, "a label"), text: required(400, "the tip") }),
  poll: z.object({
    question: required(200, "the question"),
    options: z.array(pollOption).min(2, "Add at least two answers.").max(6),
  }),
};

export const feedPostInput = z.object({
  id: z.uuid().optional(),
  status,
  postType: z.enum(["video", "update", "trading", "tip", "poll"]),
  topic: z.enum(["gameplay", "trading", "updates", "fut-champs"]),
  access,
  authorSlug: slug,
  postedAt: date,
  fields: z.record(z.string(), z.unknown()),
});

const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: required(4000, "the paragraph text") }),
  z.object({ type: z.literal("section"), title: required(140, "the heading") }),
  z.object({
    type: z.literal("steps"),
    items: z
      .array(z.object({ title: required(160, "each step's title"), text: text(800) }))
      .min(1, "Add at least one step.")
      .max(12),
  }),
  z.object({ type: z.literal("tip"), label: optionalText(40), title: required(140, "the tip title"), text: required(800, "the tip text") }),
  z.object({
    type: z.literal("controls"),
    title: optionalText(80),
    inputs: z.array(required(40, "each button")).min(1, "Add at least one button.").max(10),
    result: required(160, "what the inputs do"),
    note: optionalText(400),
    successRate: optionalText(80),
  }),
  z.object({ type: z.literal("lock") }),
]);

export const guideInput = z.object({
  id: z.uuid().optional(),
  status,
  slug,
  title: required(120, "a title"),
  excerpt: required(300, "a short description"),
  category: z.enum(Object.keys(categoryLabels) as [string, ...string[]]),
  format: z.enum(["article", "video"]),
  minutes: minutes("the read time or video length"),
  access,
  authorSlug: slug,
  publishedAt: date,
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  videoLink,
  image: imageUrl.nullable(),
  highlight: optionalText(60),
  patch: optionalText(20),
  presetCode: optionalText(40),
  intro: z.array(text(2000)).max(6).transform((items) => items.filter(Boolean)),
  body: z.array(block).max(80),
});

export const collectionInput = z.object({
  id: z.uuid().optional(),
  status,
  slug,
  sortOrder: z.number().int().min(0).max(10_000),
  title: required(80, "a title"),
  description: required(300, "a description"),
  season: optionalText(20),
  videoCount: count(1000, "Number of videos").nullable(),
  badge: z.enum(["start", "in-order", "meta", "archive"]).nullable(),
  pathStep: z.number().int().min(1).max(9).nullable(),
  category: z.enum(Object.keys(categoryLabels) as [string, ...string[]]).nullable(),
  episodes: z
    .array(
      z.object({
        title: required(140, "each video's title"),
        minutes: minutes("each video's length"),
        guideSlug: slug.optional().or(z.literal("").transform(() => undefined)),
        videoLink,
      }),
    )
    .min(1, "Add at least one video.")
    .max(200),
});

const rating = z.number({ error: "Ratings: add a number." }).int().min(1, "Ratings: 1 to 99.").max(99, "Ratings: 1 to 99.");
const socialUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => !value || /^https:\/\/\S+$/.test(value), "Social links start with https://");

export const creatorInput = z.object({
  isNew: z.boolean(),
  slug,
  hidden: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
  name: required(60, "a name"),
  initials: required(3, "initials"),
  role: text(60),
  tagline: text(80),
  country: text(60),
  countryCode: text(4),
  ovr: rating,
  cardPosition: text(30),
  ratings: z.object({ gam: rating, tac: rating, trd: rating, meta: rating }),
  badge: optionalText(30),
  rankLabel: optionalText(30),
  highlight: z
    .object({ label: text(30), value: text(40) })
    .nullable()
    .transform((value) => (value?.label && value.value ? value : null)),
  bio: optionalText(800),
  socials: z.object({
    youtube: socialUrl,
    x: socialUrl,
    instagram: socialUrl,
    tiktok: socialUrl,
    twitch: socialUrl,
  }),
  audience: z
    .array(z.object({ platform: z.enum(["youtube", "x", "instagram", "tiktok", "twitch"]), count: required(12, "the follower count") }))
    .max(5),
  reviewSpecialty: optionalText(80),
  since: z.number().int().min(1990).max(2100).nullable(),
  image: imageUrl.nullable(),
});

/** An https:// link, or empty for "not set up yet". */
const link = z
  .string()
  .trim()
  .max(300)
  .refine((value) => !value || /^https:\/\/\S+$/.test(value), "Links start with https://");

export const settingsInput = z.object({
  currentPatch: required(20, "the current patch"),
  currentSeason: required(20, "the current season"),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour.").transform((value) => value.toLowerCase()),
  trending: z
    .array(
      z.object({
        title: required(100, "each title"),
        href: z
          .string()
          .trim()
          .regex(/^\/(?!\/)\S*$/, "Trending links are pages on this site and start with /"),
        authorSlug: slug,
        views: count(1_000_000_000, "Views").optional(),
      }),
    )
    .max(6, "Up to 6 trending links."),
  plus: z.object({
    price: z.number({ error: "Add the price." }).min(0.5, "The price is at least 0.50.").max(1000, "The price is at most 1,000."),
    currency: z.enum(["USD", "GBP", "EUR"], { error: "Pick a currency." }),
    trialDays: count(90, "Free trial days"),
    perks: z
      .array(
        z.object({
          key: z.enum(["guides", "discord", "creators", "trading", "review"]),
          title: required(60, "each perk's title"),
          description: required(200, "each perk's description"),
        }),
      )
      .min(1, "Add at least one perk.")
      .max(8, "Up to 8 perks."),
  }),
  socials: z.object({
    youtube: link,
    instagram: link,
    x: link,
    tiktok: link,
    discord: link,
  }),
  hardTruth: z
    .array(
      z.object({
        problem: required(80, "each problem"),
        answerTitle: required(80, "each answer's title"),
        answer: required(400, "each answer"),
        creatorSlug: slug,
        cta: z.object({
          label: required(40, "each button label"),
          href: z.string().trim().regex(/^\/(?!\/)\S*$/, "Home section buttons link to pages on this site and start with /"),
        }),
      }),
    )
    .max(8, "Up to 8 items in the Home section."),
  discord: z.object({
    channels: z
      .array(
        z.object({
          name: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, "Channel names use lowercase letters, numbers and dashes, e.g. tactics-room."),
          label: required(30, "each channel's label"),
          description: required(200, "each channel's description"),
          pinned: optionalText(120),
        }),
      )
      .max(12, "Up to 12 channels."),
    rules: z.array(required(200, "each rule")).max(12, "Up to 12 rules."),
  }),
});

export const cardsInput = z.object({
  home: z
    .array(
      z.object({
        image: imageUrl.nullable(),
        name: optionalText(60).transform((value) => value ?? ""),
        href: z
          .string()
          .trim()
          .regex(/^(\/(?!\/)\S*)?$/, "Cards link to pages on this site and start with /, e.g. /creators/stefan."),
      }),
    )
    .length(3),
  plus: imageUrl.nullable(),
});

const gameName = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9 .+-]{2,20}$/, "Use 2–20 letters, numbers or spaces, e.g. FC 28.");

export const renameInput = z
  .object({ from: gameName, to: gameName })
  .refine((value) => value.from !== value.to, "The new name is the same as the old one.");

export const teamInput = z.object({
  email: z.email("Add the account's email."),
  role: z.enum(["member", "creator", "admin"]),
  creatorSlug: slug.optional().or(z.literal("").transform(() => undefined)),
});

export type TradingPostInput = z.input<typeof tradingPostInput>;
export type FeedPostInput = z.input<typeof feedPostInput>;
export type GuideInput = z.input<typeof guideInput>;
export type CollectionInput = z.input<typeof collectionInput>;
export type CreatorInput = z.input<typeof creatorInput>;
export type SettingsInput = z.input<typeof settingsInput>;
export type CardsInput = z.input<typeof cardsInput>;

/** The first problem in plain words, e.g. "Add a title." */
export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Something isn't right in the form.";
}
