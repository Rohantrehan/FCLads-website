import { CommentIcon } from "@sanity/icons/Comment";
import { defineArrayMember, defineField, defineType, type CustomValidator } from "sanity";
import { creditCurrentUser } from "./authorDefault";
import { accessOptions, feedTopics } from "./options";

type PostType = "video" | "update" | "trading" | "tip" | "poll";

const postTypes: { title: string; value: PostType }[] = [
  { title: "Video clip", value: "video" },
  { title: "Update (bullet points)", value: "update" },
  { title: "Trading targets", value: "trading" },
  { title: "Quick tip", value: "tip" },
  { title: "Poll", value: "poll" },
];

const typeOf = (document: unknown) => (document as { postType?: PostType } | undefined)?.postType;

/** Field shown (and required) only for some post types. */
const only = (types: PostType[], required = true) => ({
  hidden: ({ document }: { document?: unknown }) => !types.includes(typeOf(document) as PostType),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validation: <R extends { custom: (fn: CustomValidator<any>) => R }>(rule: R) =>
    rule.custom((value: unknown, context) => {
      if (!required || !types.includes(typeOf(context.document) as PostType)) return true;
      const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
      return empty ? "Required for this type of post." : true;
    }),
});

/** A post in /feed. One document type with fields that change with the post type. */
export const feedPost = defineType({
  name: "feedPost",
  title: "Feed post",
  type: "document",
  icon: CommentIcon,
  fieldsets: [{ name: "more", title: "More options", options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({
      name: "postType",
      title: "What kind of post?",
      type: "string",
      options: { list: postTypes, layout: "radio" },
      initialValue: "tip",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "string",
      options: { list: feedTopics, layout: "radio", direction: "horizontal" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", ...only(["video", "update", "trading"]) }),
    defineField({ name: "excerpt", title: "Description", type: "text", rows: 3, ...only(["video"]) }),
    defineField({ name: "minutes", title: "Video length (minutes)", type: "number", ...only(["video"]) }),
    defineField({ name: "youtubeId", title: "YouTube video ID", type: "string", description: "Public clip: the part after watch?v=.", ...only(["video"], false) }),
    defineField({
      name: "guide",
      title: "Full breakdown (guide)",
      type: "reference",
      to: [{ type: "guide" }],
      description: "Optional: the FC Lads+ guide that goes with this clip.",
      ...only(["video"], false),
    }),
    defineField({ name: "points", title: "Bullet points", type: "array", of: [defineArrayMember({ type: "string" })], ...only(["update"]) }),
    defineField({
      name: "targets",
      title: "Targets",
      type: "array",
      ...only(["trading"]),
      of: [
        defineArrayMember({
          type: "object",
          name: "target",
          fields: [
            defineField({ name: "card", title: "Card", type: "string", description: "e.g. 85 rated LaLiga fodder", validation: (rule) => rule.required() }),
            defineField({ name: "buyBelow", title: "Buy below (coins)", type: "number", validation: (rule) => rule.required().integer().min(0) }),
          ],
          preview: { select: { title: "card", buyBelow: "buyBelow" }, prepare: ({ title, buyBelow }) => ({ title, subtitle: `Buy below ${buyBelow ?? "?"}` }) },
        }),
      ],
    }),
    defineField({
      name: "freeTargets",
      title: "Targets everyone can see",
      type: "number",
      description: "For FC Lads+ posts: how many targets non-members see. The rest stay locked.",
      initialValue: 1,
      ...only(["trading"], false),
    }),
    defineField({ name: "label", title: "Label", type: "string", description: "e.g. Market rule #1", ...only(["tip"]) }),
    defineField({ name: "text", title: "Tip", type: "text", rows: 3, ...only(["tip"]) }),
    defineField({ name: "question", title: "Question", type: "string", ...only(["poll"]) }),
    defineField({
      name: "options",
      title: "Answers",
      type: "array",
      ...only(["poll"]),
      of: [
        defineArrayMember({
          type: "object",
          name: "pollOption",
          fields: [
            defineField({ name: "label", title: "Answer", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "votes", title: "Votes", type: "number", initialValue: 0, validation: (rule) => rule.integer().min(0) }),
          ],
          preview: { select: { title: "label", subtitle: "votes" } },
        }),
      ],
    }),
    defineField({
      name: "access",
      title: "Who can see it?",
      type: "string",
      options: { list: accessOptions, layout: "radio", direction: "horizontal" },
      initialValue: "free",
      description: "FC Lads+: non-members see the first targets only, the rest stay locked.",
      // Only trading targets can be locked; every other post type is free.
      hidden: ({ document }) => typeOf(document) !== "trading",
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
    defineField({ name: "views", title: "Views", type: "number", fieldset: "more", ...only(["video"], false) }),
    defineField({ name: "approval", title: "Likes (%)", type: "number", fieldset: "more", ...only(["video"], false) }),
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
    select: { title: "title", question: "question", text: "text", postType: "postType", author: "author.name" },
    prepare: ({ title, question, text, postType, author }) => ({
      title: title ?? question ?? text ?? "Untitled post",
      subtitle: [postTypes.find((type) => type.value === postType)?.title, author].filter(Boolean).join(" · "),
    }),
  },
});
