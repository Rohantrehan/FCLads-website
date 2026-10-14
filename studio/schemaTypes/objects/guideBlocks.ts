import { defineArrayMember, defineField, defineType } from "sanity";

// The building blocks of a guide's body. The website renders each one with its own design
// (web/src/components/guide/GuideBlocks.tsx).

export const guideParagraph = defineType({
  name: "guideParagraph",
  title: "Paragraph",
  type: "object",
  fields: [defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (rule) => rule.required() })],
  preview: { select: { title: "text" }, prepare: ({ title }) => ({ title, subtitle: "Paragraph" }) },
});

export const guideSection = defineType({
  name: "guideSection",
  title: "Section heading",
  type: "object",
  description: "Starts a new section. Section headings make up the guide's “In this guide” list.",
  fields: [
    defineField({ name: "title", title: "Heading", type: "string", validation: (rule) => rule.required().max(90) }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title, subtitle: "Section heading" }) },
});

export const guideSteps = defineType({
  name: "guideSteps",
  title: "Numbered steps",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Steps",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", title: "Step", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "text", title: "Explanation", type: "text", rows: 2, validation: (rule) => rule.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare: ({ items }) => ({ title: `${items?.length ?? 0} steps`, subtitle: items?.[0]?.title }),
  },
});

export const guideTip = defineType({
  name: "guideTip",
  title: "Tip box",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", description: "Small text above, e.g. “Lads pro tip”." }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "title", label: "label" }, prepare: ({ title, label }) => ({ title, subtitle: label ?? "Tip box" }) },
});

export const guideControls = defineType({
  name: "guideControls",
  title: "Controller inputs",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", initialValue: "Controller inputs", validation: (rule) => rule.required() }),
    defineField({
      name: "inputs",
      title: "Buttons, in order",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "One button per line, e.g. L1, R1, Through ball.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: "result", title: "What it does", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "note", title: "Note", type: "text", rows: 2 }),
    defineField({ name: "successRate", title: "Success rate", type: "string", description: "Optional, e.g. “84% in Elite Division testing”." }),
  ],
  preview: {
    select: { title: "result", inputs: "inputs" },
    prepare: ({ title, inputs }) => ({ title, subtitle: (inputs ?? []).join(" + ") }),
  },
});

/** Marks where the members-only part of a free guide starts. FC Lads+ guides are locked from the top anyway. */
export const membersOnlyBreak = defineType({
  name: "membersOnlyBreak",
  title: "Members-only from here",
  type: "object",
  description: "Only for free guides: everything below this line is for FC Lads+ members.",
  fields: [defineField({ name: "note", title: "Note (not shown on the site)", type: "string" })],
  preview: { prepare: () => ({ title: "🔒 Members-only from here" }) },
});

export const guideBlockTypes = [guideParagraph, guideSection, guideSteps, guideTip, guideControls, membersOnlyBreak];
