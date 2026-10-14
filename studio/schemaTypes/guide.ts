import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";
import { guideBlockTypes } from "./objects/guideBlocks";
import { creditCurrentUser } from "./authorDefault";
import { accessOptions, guideCategories } from "./options";

export const guide = defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  icon: BookIcon,
  fieldsets: [{ name: "more", title: "More options", options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required().max(90) }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      description: "Press Generate after writing the title. Don't change it once the guide is live.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Shown on cards and in Google. Everyone can read it.",
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "author",
      title: "Written by",
      type: "reference",
      to: [{ type: "creator" }],
      initialValue: async (_params, context) => (await creditCurrentUser(context)) as { _ref: string },
      options: { disableNew: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "category", title: "Category", type: "string", options: { list: guideCategories }, validation: (rule) => rule.required() }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: { list: [{ title: "Article", value: "article" }, { title: "Video", value: "video" }], layout: "radio", direction: "horizontal" },
      initialValue: "article",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "minutes",
      title: "Minutes",
      type: "number",
      description: "Read time, or the video's length.",
      validation: (rule) => rule.required().integer().min(1).max(240),
    }),
    defineField({
      name: "access",
      title: "Who can read it?",
      type: "string",
      options: { list: accessOptions, layout: "radio", direction: "horizontal" },
      initialValue: "plus",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "video", title: "Video", type: "video" }),
    defineField({
      name: "intro",
      title: "Intro (public preview)",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Shown above the article. Everyone can read these, as a preview. Section headings are public too.",
    }),
    defineField({
      name: "body",
      title: "Article (members only)",
      type: "array",
      of: guideBlockTypes.map((block) => defineArrayMember({ type: block.name })),
    }),
    defineField({ name: "image", title: "Thumbnail (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "publishedAt", fieldset: "more", title: "Published on", type: "date", initialValue: () => new Date().toISOString().slice(0, 10), validation: (rule) => rule.required() }),
    defineField({ name: "isNew", fieldset: "more", title: "Show a “New” tag", type: "boolean", initialValue: false }),
    defineField({
      name: "isFeatured", fieldset: "more",
      title: "Featured guide",
      type: "boolean",
      description: "Shown big at the top of Learn. Feature one guide at a time.",
      initialValue: false,
    }),
    defineField({
      name: "highlight", fieldset: "more",
      title: "Words to colour green",
      type: "string",
      description: "Part of the title shown in green on the guide page, e.g. “high press”.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const title = (context.document?.title as string | undefined) ?? "";
          return !value || title.toLowerCase().includes(value.toLowerCase()) ? true : "These words must appear in the title.";
        }),
    }),
    defineField({ name: "patch", fieldset: "more", title: "Patch", type: "string", description: "Game patch the guide was tested on, e.g. 1.08." }),
    defineField({ name: "presetCode", fieldset: "more", title: "Custom tactic code", type: "string", description: "Optional share code shown with a Copy button." }),
  ],
  orderings: [{ title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", author: "author.name", access: "access", media: "image", featured: "isFeatured" },
    prepare: ({ title, author, access, media, featured }) => ({
      title: featured ? `★ ${title}` : title,
      subtitle: [author, access === "plus" ? "FC Lads+" : "Free"].filter(Boolean).join(" · "),
      media,
    }),
  },
});
