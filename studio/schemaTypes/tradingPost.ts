import { TrendUpwardIcon } from "@sanity/icons/TrendUpward";
import { defineField, defineType } from "sanity";
import { creditCurrentUser } from "./authorDefault";
import { accessOptions } from "./options";

/** A creator's post on /trading: heading + text, with an optional screenshot. */
export const tradingPost = defineType({
  name: "tradingPost",
  title: "Trading post",
  type: "document",
  icon: TrendUpwardIcon,
  fieldsets: [{ name: "more", title: "More options", options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "One line, like a tweet's first sentence.",
      validation: (rule) => rule.required().max(110),
    }),
    defineField({ name: "text", title: "Your post", type: "text", rows: 5, validation: (rule) => rule.required().max(1200) }),
    defineField({
      name: "image",
      title: "Screenshot (optional)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "What does the screenshot show?",
          type: "string",
          description: "A few words for people who can't see images, e.g. “86 rated fodder prices going up”.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !value ? "Add a few words about the screenshot." : true;
            }),
        }),
      ],
    }),
    defineField({
      name: "access",
      title: "Who can read it?",
      type: "string",
      options: { list: accessOptions, layout: "radio", direction: "horizontal" },
      initialValue: "plus",
      description: "Non-members only see the heading of FC Lads+ posts.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Posted by",
      type: "reference",
      to: [{ type: "creator" }],
      initialValue: async (_params, context) => (await creditCurrentUser(context)) as { _ref: string },
      options: { disableNew: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "postedAt",
      title: "Date and time",
      type: "datetime",
      fieldset: "more",
      description: "Set automatically. Change it only to back-date a post.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{ title: "Newest first", name: "postedDesc", by: [{ field: "postedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", author: "author.name", access: "access", media: "image", postedAt: "postedAt" },
    prepare: ({ title, author, access, media, postedAt }) => ({
      title,
      subtitle: [access === "plus" ? "🔒 FC Lads+" : "Free", author, postedAt?.slice(0, 10)].filter(Boolean).join(" · "),
      media,
    }),
  },
});
