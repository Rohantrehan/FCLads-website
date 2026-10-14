import { defineField, defineType } from "sanity";

/** A members-only video: a Loom video or an unlisted YouTube video. Only members' browsers get the ID. */
export const video = defineType({
  name: "video",
  title: "Video",
  type: "object",
  description: "Only FC Lads+ members can watch it. Leave empty until the video is uploaded.",
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
      initialValue: "loom",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "id",
      title: "Video ID",
      type: "string",
      description: "Loom: the part after loom.com/share/. YouTube: the part after watch?v=.",
      validation: (rule) =>
        rule.required().custom((value) =>
          typeof value === "string" && /^[\w-]+$/.test(value)
            ? true
            : "Paste only the ID, not the whole link (letters, numbers, - and _).",
        ),
    }),
  ],
});
