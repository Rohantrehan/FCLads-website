"use client";

import { useState } from "react";
import { ImageField, ListEditor, NumberField, Section, TextArea, TextField, Toggle, inputClass } from "@/components/board/fields";
import { SaveOnlyBar, useSaver } from "@/components/board/SaveBar";
import { saveCreator } from "@/lib/board/actions";
import { socialPlatforms } from "@/lib/board/options";
import type { CreatorInput } from "@/lib/board/schemas";
import { slugify } from "@/lib/board/slug";
import type { CreatorRow } from "@/lib/content/rows";
import type { SocialPlatform } from "@/types";

const ratingLabels = { gam: "Gameplay", tac: "Tactics", trd: "Trading", meta: "Meta" } as const;

export function CreatorEditor({ base, row }: { base: string; row?: CreatorRow }) {
  const [creator, setCreator] = useState<CreatorInput>(() => ({
    isNew: !row,
    slug: row?.slug ?? "",
    hidden: row?.hidden ?? false,
    sortOrder: row?.sort_order ?? 100,
    name: row?.name ?? "",
    initials: row?.initials ?? "",
    role: row?.role ?? "",
    tagline: row?.tagline ?? "",
    country: row?.country ?? "",
    countryCode: row?.country_code ?? "",
    ovr: row?.ovr ?? 85,
    cardPosition: row?.card_position ?? "",
    ratings: row?.ratings ?? { gam: 85, tac: 85, trd: 85, meta: 85 },
    badge: row?.badge ?? "",
    rankLabel: row?.rank_label ?? "",
    highlight: row?.highlight ?? { label: "", value: "" },
    bio: row?.bio ?? "",
    socials: row?.socials ?? {},
    audience: row?.audience ?? [],
    reviewSpecialty: row?.review_specialty ?? "",
    since: row?.since ?? null,
    image: row?.image ?? null,
  }));
  const set = <K extends keyof CreatorInput>(key: K, value: CreatorInput[K]) => setCreator((old) => ({ ...old, [key]: value }));
  const { save, pending, result } = useSaver(saveCreator, (slug) => `${base}/creators/${slug}`);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Profile" description="Shown on Meet the Lads and the creator's own page.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
          <TextField
            label="Name"
            value={creator.name}
            maxLength={60}
            name="name"
            onChange={(name) => setCreator((old) => ({ ...old, name, ...(old.isNew ? { slug: slugify(name) } : {}) }))}
          />
          <TextField label="Initials" hint="no photo" value={creator.initials} onChange={(value) => set("initials", value.toUpperCase())} maxLength={3} />
        </div>
        {creator.isNew ? (
          <TextField label="Web address" hint={`/creators/${creator.slug || "…"} · can't be changed later`} value={creator.slug} onChange={(value) => set("slug", value.toLowerCase())} maxLength={80} />
        ) : (
          <p className="text-sm">
            <span className="font-semibold">Web address</span> <span className="text-muted">· /creators/{creator.slug}</span>
          </p>
        )}
        <ImageField label="Photo" hint="shown on their card on Home, Creators and their profile · face in the middle" folder="creators" value={creator.image} onChange={(image) => set("image", image)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Role" hint="e.g. Tactics Analyst" value={creator.role} onChange={(value) => set("role", value)} maxLength={60} />
          <TextField label="Second line" hint="e.g. Gameplay expert // Tactical" value={creator.tagline} onChange={(value) => set("tagline", value)} maxLength={80} />
          <TextField label="Country" value={creator.country} onChange={(value) => set("country", value)} maxLength={60} />
          <TextField label="Country code" hint="e.g. GER" value={creator.countryCode} onChange={(value) => set("countryCode", value)} maxLength={4} />
        </div>
        <TextArea label="Bio" value={creator.bio ?? ""} onChange={(value) => set("bio", value)} rows={4} maxLength={800} />
        <TextField
          label="Gameplay reviews: what they review best"
          hint="leave empty if they don't take reviews"
          value={creator.reviewSpecialty ?? ""}
          onChange={(value) => set("reviewSpecialty", value)}
          maxLength={80}
        />
      </Section>

      <Section title="Player card" description="The FC-style card on their profile.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <NumberField label="OVR" value={creator.ovr} onChange={(value) => set("ovr", value as number)} min={1} max={99} />
          {(Object.keys(ratingLabels) as (keyof typeof ratingLabels)[]).map((key) => (
            <NumberField
              key={key}
              label={ratingLabels[key]}
              value={creator.ratings[key]}
              onChange={(value) => set("ratings", { ...creator.ratings, [key]: value as number })}
              min={1}
              max={99}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Card position" hint="e.g. CAM / EXPERT" value={creator.cardPosition} onChange={(value) => set("cardPosition", value)} maxLength={30} />
          <TextField label="Rank label" hint="e.g. TACTICAL #02" value={creator.rankLabel ?? ""} onChange={(value) => set("rankLabel", value)} maxLength={30} />
          <TextField label="Badge" hint="optional, e.g. Founding" value={creator.badge ?? ""} onChange={(value) => set("badge", value)} maxLength={30} />
          <TextField
            label="Headline stat: label"
            hint="e.g. Specialty"
            value={creator.highlight?.label ?? ""}
            onChange={(label) => set("highlight", { label, value: creator.highlight?.value ?? "" })}
            maxLength={30}
          />
          <TextField
            label="Headline stat: value"
            hint="e.g. 71-depth ctrl"
            value={creator.highlight?.value ?? ""}
            onChange={(value) => set("highlight", { label: creator.highlight?.label ?? "", value })}
            maxLength={40}
          />
          <NumberField label="Making FC content since" hint="year" value={creator.since ?? undefined} onChange={(value) => set("since", value ?? null)} min={1990} max={2100} />
        </div>
      </Section>

      <Section title="Socials">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {socialPlatforms.map((platform) => (
            <TextField
              key={platform.value}
              label={platform.label}
              hint="link, optional"
              type="url"
              placeholder="https://…"
              value={creator.socials[platform.value] ?? ""}
              onChange={(value) => set("socials", { ...creator.socials, [platform.value]: value })}
            />
          ))}
        </div>
        <ListEditor
          label="Followers"
          hint="shown on their profile"
          items={creator.audience}
          onChange={(audience) => set("audience", audience)}
          make={() => ({ platform: "youtube" as SocialPlatform, count: "" })}
          max={5}
          itemName="follower count"
          addLabel="Add a follower count"
          render={(item, update, index) => (
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label={`Follower count ${index + 1}: platform`}
                value={item.platform}
                onChange={(event) => update({ ...item, platform: event.target.value as SocialPlatform })}
                className={`${inputClass} [color-scheme:dark]`}
              >
                {socialPlatforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
              <input aria-label={`Follower count ${index + 1}: count`} placeholder="e.g. 240K" value={item.count} maxLength={12} onChange={(event) => update({ ...item, count: event.target.value })} className={inputClass} />
            </div>
          )}
        />
      </Section>

      <Section title="On the site">
        <NumberField label="Order" hint="lower first" value={creator.sortOrder} onChange={(value) => set("sortOrder", value ?? 100)} min={0} className="max-w-xs" />
        <Toggle
          label="Hide this creator"
          hint="Hides their profile and everything they posted, everywhere on the site."
          checked={creator.hidden}
          onChange={(value) => set("hidden", value)}
        />
      </Section>

      <SaveOnlyBar
        pending={pending}
        result={result}
        label={creator.isNew ? "Add creator" : "Save"}
        onSave={() => save(creator, () => set("isNew", false))}
        remove={row ? { kind: "creators", id: row.slug, after: `${base}/creators` } : undefined}
      />
    </div>
  );
}
