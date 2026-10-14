import { TrendUpwardIcon } from "@sanity/icons/TrendUpward";
import { defineField, defineType } from "sanity";
import { accessOptions } from "./options";

/** A creator's post on /trading: heading + text, with an optional screenshot. */
export const tradingPost = defineType({
  name: "tradingPost",
  title: "Trading post",
  type: "document",
  icon: TrendUpwardIcon,
  fields: [
    defineField({ name: "title", title: "Heading", type: "string", validation: (rule) => rule.required().max(110) }),
    defineField({ name: "text", title: "Text", type: "text", rows: 5, validation: (rule) => rule.required().max(1200) }),
    defineField({ name: "author", title: "Creator", type: "reference", to: [{ type: "creator" }], validation: (rule) => rule.required() }),
    defineField({
      name: "access",
      title: "Who can read it",
      type: "string",
      options: { list: accessOptions, layout: "radio" },
      initialValue: "plus",
      description: "Non-members only see the heading of FC Lads+ posts.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "postedAt",
      title: "Posted at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Screenshot",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Describe the screenshot",
          type: "string",
          description: "For people who can't see the image, e.g. “Price chart of 86 rated fodder rising”.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !value ? "Describe the screenshot." : true;
            }),
        }),
      ],
    }),
  ],
  orderings: [{ title: "Newest first", name: "postedDesc", by: [{ field: "postedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", author: "author.name", access: "access", media: "image", postedAt: "postedAt" },
    prepare: ({ title, author, access, media, postedAt }) => ({
      title,
      subtitle: [author, access === "plus" ? "FC Lads+" : "Free", postedAt?.slice(0, 10)].filter(Boolean).join(" · "),
      media,
    }),
  },
});
