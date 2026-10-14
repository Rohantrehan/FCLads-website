// Turns the website's sample content (web/src/data) into Sanity documents, so the Studio starts
// with everything the site shows today. Writes studio/seed.ndjson; import it with `npm run seed:import`.
//
//   npm run seed          # build seed.ndjson
//   npm run seed:import   # add the documents that don't exist yet (never overwrites edits)
//
// Node 24 reads the .ts sample files directly (type stripping). `--conditions=react-server` lets the
// server-only files load outside Next.

import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, "../../web");
const load = (file) => import(pathToFileURL(resolve(web, "src/data", file)).href);

const [{ creators }, { guides }, { guideContents }, { collections }, { feedPosts, trending }, { tradingPosts }] =
  await Promise.all([
    load("creators.ts"),
    load("guides.ts"),
    load("guideContent.ts"),
    load("collections.ts"),
    load("feed.ts"),
    load("tradingPosts.ts"),
  ]);

const key = () => randomBytes(6).toString("hex");
const keyed = (items) => items.map((item) => ({ _key: key(), ...item }));
const slug = (current) => ({ _type: "slug", current });
const ref = (id) => ({ _type: "reference", _ref: id });
const creatorId = (slugValue) => `creator-${slugValue}`;
const guideId = (slugValue) => `guide-${slugValue}`;
/** Drops undefined fields and "#" placeholder links. */
const clean = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== "#"));

const docs = [];

creators.forEach((creator, index) => {
  docs.push(
    clean({
      _id: creatorId(creator.slug),
      _type: "creator",
      name: creator.name,
      slug: slug(creator.slug),
      hidden: Boolean(creator.hidden),
      order: (index + 1) * 10,
      role: creator.role,
      tagline: creator.tagline,
      bio: creator.bio,
      country: creator.country,
      countryCode: creator.countryCode,
      since: creator.since,
      reviewSpecialty: creator.reviewSpecialty,
      initials: creator.initials,
      ovr: creator.ovr,
      cardPosition: creator.cardPosition,
      ratings: creator.ratings,
      badge: creator.badge,
      rankLabel: creator.rankLabel,
      highlight: creator.highlight,
      socials: clean(creator.socials ?? {}),
      audience: creator.audience ? keyed(creator.audience) : undefined,
    }),
  );
});

/** Sample guide blocks → the Studio's block types. `lockedFrom` becomes a "Members-only from here" marker. */
function toBody(content, access) {
  const body = content.blocks.map((block) => {
    switch (block.type) {
      case "p":
        return { _type: "guideParagraph", text: block.text };
      case "section":
        return { _type: "guideSection", title: block.title };
      case "steps":
        return { _type: "guideSteps", items: keyed(block.items) };
      case "tip":
        return clean({ _type: "guideTip", label: block.label, title: block.title, text: block.text });
      case "controls":
        return clean({ _type: "guideControls", ...block, type: undefined });
      default:
        throw new Error(`Unknown block type ${block.type}`);
    }
  });
  if (access === "free" && content.lockedFrom !== undefined) body.splice(content.lockedFrom, 0, { _type: "membersOnlyBreak" });
  return keyed(body);
}

for (const guide of guides) {
  const content = guideContents.find((entry) => entry.slug === guide.slug);
  docs.push(
    clean({
      _id: guideId(guide.slug),
      _type: "guide",
      title: guide.title,
      slug: slug(guide.slug),
      excerpt: guide.excerpt,
      author: ref(creatorId(guide.authorSlug)),
      category: guide.category,
      format: guide.format,
      minutes: guide.minutes,
      access: guide.access,
      publishedAt: guide.publishedAt,
      isNew: Boolean(guide.isNew),
      isFeatured: Boolean(guide.isFeatured),
      video: guide.video ? { _type: "video", ...guide.video } : undefined,
      highlight: content?.highlight,
      patch: content?.patch,
      presetCode: content?.presetCode,
      intro: content?.intro?.length ? content.intro : undefined,
      body: content ? toBody(content, guide.access) : undefined,
    }),
  );
}

collections.forEach((collection, index) => {
  docs.push(
    clean({
      _id: `collection-${collection.slug}`,
      _type: "collection",
      title: collection.title,
      slug: slug(collection.slug),
      description: collection.description,
      order: (index + 1) * 10,
      season: collection.season,
      videoCount: collection.videoCount,
      badge: collection.badge,
      pathStep: collection.pathStep,
      category: collection.category,
      episodes: keyed(
        collection.episodes.map((episode) =>
          clean({
            _type: "episode",
            title: episode.title,
            minutes: episode.minutes,
            video: episode.video ? { _type: "video", ...episode.video } : undefined,
            guide: episode.guideSlug ? ref(guideId(episode.guideSlug)) : undefined,
          }),
        ),
      ),
    }),
  );
});

for (const post of feedPosts) {
  const { id, type, authorSlug, guideSlug, targets, points, options, ...rest } = post;
  docs.push(
    clean({
      ...rest,
      _id: `feedPost-${id}`,
      _type: "feedPost",
      postType: type,
      author: ref(creatorId(authorSlug)),
      guide: guideSlug ? ref(guideId(guideSlug)) : undefined,
      points,
      targets: targets ? keyed(targets) : undefined,
      options: options ? keyed(options) : undefined,
    }),
  );
}

for (const post of tradingPosts) {
  docs.push(
    clean({
      _id: `tradingPost-${post.id}`,
      _type: "tradingPost",
      title: post.title,
      text: post.text,
      author: ref(creatorId(post.authorSlug)),
      access: post.access,
      postedAt: post.postedAt,
      // The import uploads the placeholder screenshot from web/public.
      image: post.image
        ? {
            _type: "image",
            _sanityAsset: `image@${pathToFileURL(resolve(web, "public", post.image.src.replace(/^\//, ""))).href}`,
            alt: post.image.alt,
          }
        : undefined,
    }),
  );
}

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  currentPatch: "1.08",
  currentSeason: "FC 27",
  trending: keyed(
    trending.map((item) =>
      clean({ title: item.title, href: item.href, author: ref(creatorId(item.authorSlug)), views: item.views }),
    ),
  ),
});

const out = resolve(here, "../seed.ndjson");
writeFileSync(out, `${docs.map((doc) => JSON.stringify(doc)).join("\n")}\n`);
const counts = docs.reduce((acc, doc) => ({ ...acc, [doc._type]: (acc[doc._type] ?? 0) + 1 }), {});
console.log(`Wrote ${docs.length} documents to seed.ndjson`, counts);
