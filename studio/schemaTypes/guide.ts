import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { guideBlockTypes } from "./objects/guideBlocks";
import { accessOptions, guideCategories } from "./options";

export const guide = defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "body", title: "Article" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "card", validation: (rule) => rule.required().max(90) }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      group: "card",
      description: "The page is /guides/<this>. Don't change it once the guide is live.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "card",
      description: "Shown on cards and in Google. Everyone can read it.",
      validation: (rule) => rule.required().max(240),
    }),
    defineField({ name: "author", title: "Creator", type: "reference", to: [{ type: "creator" }], group: "card", validation: (rule) => rule.required() }),
    defineField({ name: "category", title: "Category", type: "string", group: "card", options: { list: guideCategories }, validation: (rule) => rule.required() }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      group: "card",
      options: { list: [{ title: "Article", value: "article" }, { title: "Video", value: "video" }], layout: "radio", direction: "horizontal" },
      initialValue: "article",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "minutes",
      title: "Minutes",
      type: "number",
      group: "card",
      description: "Read time, or the video's length.",
      validation: (rule) => rule.required().integer().min(1).max(240),
    }),
    defineField({
      name: "access",
      title: "Who can read it",
      type: "string",
      group: "card",
      options: { list: accessOptions, layout: "radio" },
      initialValue: "plus",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "publishedAt", title: "Published on", type: "date", group: "card", initialValue: () => new Date().toISOString().slice(0, 10), validation: (rule) => rule.required() }),
    defineField({ name: "isNew", title: "Show a “New” tag", type: "boolean", group: "card", initialValue: false }),
    defineField({
      name: "isFeatured",
      title: "Featured guide",
      type: "boolean",
      group: "card",
      description: "Shown big at the top of Learn. Feature one guide at a time.",
      initialValue: false,
    }),
    defineField({ name: "image", title: "Thumbnail", type: "image", group: "card", options: { hotspot: true } }),
    defineField({ name: "video", title: "Video", type: "video", group: "body" }),
    defineField({
      name: "highlight",
      title: "Words to colour green",
      type: "string",
      group: "body",
      description: "Part of the title shown in green on the guide page, e.g. “high press”.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const title = (context.document?.title as string | undefined) ?? "";
          return !value || title.toLowerCase().includes(value.toLowerCase()) ? true : "These words must appear in the title.";
        }),
    }),
    defineField({ name: "patch", title: "Patch", type: "string", group: "body", description: "Game patch the guide was tested on, e.g. 1.08." }),
    defineField({
      name: "intro",
      title: "Intro paragraphs",
      type: "array",
      group: "body",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Shown above the article. Everyone can read these, as a preview. Section headings are public too.",
    }),
    defineField({
      name: "body",
      title: "Article",
      type: "array",
      group: "body",
      of: guideBlockTypes.map((block) => defineArrayMember({ type: block.name })),
    }),
    defineField({ name: "presetCode", title: "Custom tactic code", type: "string", group: "body", description: "Optional share code shown with a Copy button." }),
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
