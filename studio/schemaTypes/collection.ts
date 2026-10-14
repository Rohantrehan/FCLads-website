import { PlayIcon } from "@sanity/icons/Play";
import { defineArrayMember, defineField, defineType } from "sanity";
import { collectionBadges, guideCategories } from "./options";

/** A members-only video series in Learn, watched in order. */
export const collection = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required().max(80) }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      description: "The page is /learn/collections/<this>.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, validation: (rule) => rule.required().max(300) }),
    defineField({
      name: "order",
      title: "Order on the site",
      type: "number",
      description: "Lower numbers come first.",
      initialValue: 100,
      validation: (rule) => rule.integer(),
    }),
    defineField({ name: "season", title: "Season", type: "string", description: "e.g. FC 27. Leave empty for the current season." }),
    defineField({
      name: "videoCount",
      title: "Number of videos",
      type: "number",
      description: "Total in the series. Leave empty to count the videos listed below.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({ name: "badge", title: "Badge", type: "string", options: { list: collectionBadges } }),
    defineField({
      name: "pathStep",
      title: "Step in the “Start here” path",
      type: "number",
      description: "1–5. Leave empty if this collection isn't part of the path.",
      validation: (rule) => rule.integer().min(1).max(9),
    }),
    defineField({
      name: "category",
      title: "Matching guide category",
      type: "string",
      options: { list: guideCategories },
      description: "Used to show related guides.",
    }),
    defineField({
      name: "episodes",
      title: "Videos, in watch order",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "episode",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "minutes", title: "Minutes", type: "number", validation: (rule) => rule.required().integer().min(1) }),
            defineField({ name: "video", title: "Video", type: "video" }),
            defineField({
              name: "guide",
              title: "Matching guide",
              type: "reference",
              to: [{ type: "guide" }],
              description: "Optional: link this video to its guide page.",
            }),
          ],
          preview: {
            select: { title: "title", minutes: "minutes", video: "video.id" },
            prepare: ({ title, minutes, video }) => ({ title, subtitle: `${minutes ?? "?"} min${video ? "" : " · no video yet"}` }),
          },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Order on the site", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", step: "pathStep", episodes: "episodes" },
    prepare: ({ title, step, episodes }) => ({
      title,
      subtitle: [step ? `Step ${step}` : undefined, `${episodes?.length ?? 0} videos`].filter(Boolean).join(" · "),
    }),
  },
});
