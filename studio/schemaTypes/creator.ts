import { UsersIcon } from "@sanity/icons/Users";
import { defineArrayMember, defineField, defineType } from "sanity";
import { socialPlatforms } from "./options";

const rating = (name: string, title: string) =>
  defineField({ name, title, type: "number", validation: (rule) => rule.required().integer().min(1).max(99) });

export const creator = defineType({
  name: "creator",
  title: "Creator",
  type: "document",
  icon: UsersIcon,
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "card", title: "Card" },
    { name: "social", title: "Socials" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "profile", validation: (rule) => rule.required().max(40) }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      group: "profile",
      description: "The profile page is /creators/<this>. Don't change it once the profile is live.",
      options: { source: "name", maxLength: 40 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "studioEmail",
      title: "Studio login email",
      type: "string",
      group: "profile",
      description: "The email this creator signs in to the Studio with. Their new posts are then credited to them automatically.",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "hidden",
      title: "Hide this creator",
      type: "boolean",
      group: "profile",
      description: "Hides the profile and everything they posted, without deleting anything.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order on the site",
      type: "number",
      group: "profile",
      description: "Lower numbers come first in the roster.",
      initialValue: 10,
      validation: (rule) => rule.integer(),
    }),
    defineField({ name: "role", title: "Role", type: "string", group: "profile", description: "e.g. Tactics Analyst", validation: (rule) => rule.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "profile", description: "Second line under the name.", validation: (rule) => rule.required() }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 4, group: "profile", validation: (rule) => rule.max(400) }),
    defineField({ name: "country", title: "Country", type: "string", group: "profile", validation: (rule) => rule.required() }),
    defineField({
      name: "countryCode",
      title: "Country code",
      type: "string",
      group: "profile",
      description: "2–3 letters shown on the card, e.g. GER.",
      validation: (rule) => rule.required().max(3).uppercase(),
    }),
    defineField({ name: "since", title: "Making FC content since (year)", type: "number", group: "profile", validation: (rule) => rule.integer().min(2000).max(2100) }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      group: "profile",
      options: { hotspot: true },
      description: "Optional. Without a photo the site shows their initials.",
    }),
    defineField({
      name: "initials",
      title: "Initials",
      type: "string",
      group: "card",
      description: "2 letters shown when there's no photo.",
      validation: (rule) => rule.required().length(2).uppercase(),
    }),
    defineField({ name: "ovr", title: "Card rating (OVR)", type: "number", group: "card", validation: (rule) => rule.required().integer().min(1).max(99) }),
    defineField({ name: "cardPosition", title: "Card position", type: "string", group: "card", description: "e.g. CAM / EXPERT", validation: (rule) => rule.required() }),
    defineField({
      name: "ratings",
      title: "Card stats",
      type: "object",
      group: "card",
      options: { columns: 4 },
      fields: [rating("gam", "GAM"), rating("tac", "TAC"), rating("trd", "TRD"), rating("meta", "META")],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "badge", title: "Badge", type: "string", group: "card", description: "Optional, e.g. Founding." }),
    defineField({ name: "rankLabel", title: "Rank label", type: "string", group: "card", description: "Optional, e.g. TACTICAL #02." }),
    defineField({
      name: "highlight",
      title: "Headline stat",
      type: "object",
      group: "card",
      description: "One stat shown on small cards.",
      options: { columns: 2 },
      fields: [
        defineField({ name: "label", title: "Label", type: "string", description: "e.g. WL record" }),
        defineField({ name: "value", title: "Value", type: "string", description: "e.g. 20-0 Rank 1" }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "object",
      group: "social",
      fields: socialPlatforms.map((platform) =>
        defineField({ name: platform.value, title: platform.title, type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
      ),
    }),
    defineField({
      name: "audience",
      title: "Followers",
      type: "array",
      group: "social",
      of: [
        defineArrayMember({
          type: "object",
          name: "audienceCount",
          fields: [
            defineField({ name: "platform", title: "Platform", type: "string", options: { list: socialPlatforms }, validation: (rule) => rule.required() }),
            defineField({ name: "count", title: "Followers", type: "string", description: "e.g. 240K", validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "count", subtitle: "platform" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Order on the site", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "image", hidden: "hidden" },
    prepare: ({ title, subtitle, media, hidden }) => ({ title: hidden ? `${title} (hidden)` : title, subtitle, media }),
  },
});
