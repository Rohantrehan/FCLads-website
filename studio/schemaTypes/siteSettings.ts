import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/** One document with site-wide values. The Studio shows it as a single “Site settings” page. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "currentPatch",
      title: "Current game patch",
      type: "string",
      description: "Shown on Home, Learn and the dashboard, e.g. 1.08.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "currentSeason",
      title: "Current season",
      type: "string",
      description: "e.g. FC 27. Used for collections.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "trending",
      title: "Trending this week (Feed sidebar)",
      type: "array",
      validation: (rule) => rule.max(6),
      of: [
        defineArrayMember({
          type: "object",
          name: "trendingItem",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "A page on the site, e.g. /guides/beat-the-high-press",
              validation: (rule) =>
                rule.required().custom((value) => (typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? true : "Start with / (a page on this site).")),
            }),
            defineField({ name: "author", title: "Creator", type: "reference", to: [{ type: "creator" }], validation: (rule) => rule.required() }),
            defineField({ name: "views", title: "Views", type: "number", validation: (rule) => rule.integer().min(0) }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
