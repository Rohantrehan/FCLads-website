import { defineField, defineType } from "sanity";

type Video = { provider?: string; id?: string } | undefined;

/** A members-only video: a Loom video or an unlisted YouTube video. Only members' browsers get the ID. */
export const video = defineType({
  name: "video",
  title: "Video (optional)",
  type: "object",
  description: "Only FC Lads+ members can watch it. Leave empty until the video is uploaded.",
  options: { collapsible: true, collapsed: true },
  // Optional as a whole, but if one part is filled in, both are needed.
  validation: (rule) =>
    rule.custom((value: Video) => {
      if (!value || (!value.provider && !value.id)) return true;
      if (!value.provider) return "Choose Loom or YouTube.";
      if (!value.id) return "Paste the video ID.";
      return /^[\w-]+$/.test(value.id) ? true : "Paste only the ID, not the whole link (letters, numbers, - and _).";
    }),
  fields: [
    defineField({
      name: "provider",
      title: "Where is it hosted?",
      type: "string",
      options: {
        list: [
          { title: "Loom", value: "loom" },
          { title: "YouTube (unlisted)", value: "youtube" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "id",
      title: "Video ID",
      type: "string",
      description: "Loom: the part after loom.com/share/. YouTube: the part after watch?v=.",
    }),
  ],
});
