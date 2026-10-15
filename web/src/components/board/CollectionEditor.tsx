"use client";

import { useState } from "react";
import { ListEditor, NumberField, Section, SelectField, TextArea, TextField, inputClass } from "@/components/board/fields";
import { SaveBar, useSaver } from "@/components/board/SaveBar";
import { saveCollection } from "@/lib/board/actions";
import { collectionBadges, guideCategories } from "@/lib/board/options";
import type { CollectionInput } from "@/lib/board/schemas";
import { slugify } from "@/lib/board/slug";
import { videoLink } from "@/lib/board/video";
import type { CollectionRow } from "@/lib/content/rows";
import type { CollectionBadge, GuideCategory } from "@/types";

type Episode = CollectionInput["episodes"][number];

export function CollectionEditor({
  base,
  row,
  guides,
  now,
}: {
  base: string;
  row?: CollectionRow;
  guides: { slug: string; title: string }[];
  now: number;
}) {
  const [collection, setCollection] = useState<CollectionInput>(() => ({
    id: row?.id,
    status: row?.status ?? "draft",
    slug: row?.slug ?? "",
    sortOrder: row?.sort_order ?? 100,
    title: row?.title ?? "",
    description: row?.description ?? "",
    season: row?.season ?? "",
    videoCount: row?.video_count ?? null,
    badge: row?.badge ?? null,
    pathStep: row?.path_step ?? null,
    category: row?.category ?? null,
    episodes: (row?.episodes ?? [{ title: "", minutes: 10 }]).map((episode) => ({
      title: episode.title,
      minutes: episode.minutes,
      guideSlug: episode.guideSlug ?? "",
      videoLink: videoLink(episode.video),
    })),
  }));
  const [slugTouched, setSlugTouched] = useState(Boolean(row));
  const set = <K extends keyof CollectionInput>(key: K, value: CollectionInput[K]) => setCollection((old) => ({ ...old, [key]: value }));
  const { save, pending, result } = useSaver(saveCollection, (id) => `${base}/collections/${id}`);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Basics" description="A members-only video series in Learn → Collections.">
        <TextField
          label="Title"
          value={collection.title}
          maxLength={80}
          name="title"
          onChange={(title) => setCollection((old) => ({ ...old, title, ...(slugTouched ? {} : { slug: slugify(title) }) }))}
        />
        <TextField
          label="Web address"
          hint={`/learn/collections/${collection.slug || "…"}`}
          value={collection.slug}
          maxLength={80}
          onChange={(slug) => {
            setSlugTouched(true);
            set("slug", slug.toLowerCase());
          }}
        />
        <TextArea label="Description" value={collection.description} onChange={(value) => set("description", value)} rows={3} maxLength={300} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField label="Order on the site" hint="lower first" value={collection.sortOrder} onChange={(value) => set("sortOrder", value ?? 100)} min={0} />
          <TextField label="Season" hint="empty = current" value={collection.season ?? ""} onChange={(value) => set("season", value)} maxLength={20} />
          <NumberField
            label="Number of videos"
            hint="empty = count the list"
            value={collection.videoCount ?? undefined}
            onChange={(value) => set("videoCount", value ?? null)}
            min={0}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label="Badge"
            value={collection.badge ?? ""}
            onChange={(value) => set("badge", (value || null) as CollectionBadge | null)}
            options={collectionBadges}
            empty="No badge"
          />
          <SelectField
            label="Step in “Start here”"
            value={collection.pathStep ? String(collection.pathStep) : ""}
            onChange={(value) => set("pathStep", value ? Number(value) : null)}
            options={["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((step) => ({ value: step, label: `Step ${step}` }))}
            empty="Not in the path"
          />
          <SelectField
            label="Matching guide category"
            value={collection.category ?? ""}
            onChange={(value) => set("category", (value || null) as GuideCategory | null)}
            options={guideCategories}
            empty="None"
          />
        </div>
      </Section>

      <Section title="Videos, in watch order">
        <ListEditor<Episode>
          label="Videos"
          items={collection.episodes}
          onChange={(episodes) => set("episodes", episodes)}
          make={() => ({ title: "", minutes: 10, guideSlug: "", videoLink: "" })}
          itemName="video"
          addLabel="Add a video"
          render={(episode, update, index) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_7rem]">
              <input aria-label={`Video ${index + 1}: title`} placeholder="Title" value={episode.title} maxLength={140} onChange={(event) => update({ ...episode, title: event.target.value })} className={`${inputClass} font-semibold`} />
              <input
                aria-label={`Video ${index + 1}: minutes`}
                placeholder="Minutes"
                type="number"
                min={1}
                value={episode.minutes ?? ""}
                onChange={(event) => update({ ...episode, minutes: Math.round(Number(event.target.value)) })}
                className={`${inputClass} tabular`}
              />
              <input
                aria-label={`Video ${index + 1}: Loom or YouTube link`}
                placeholder="Loom or unlisted YouTube link (optional)"
                type="url"
                value={episode.videoLink ?? ""}
                onChange={(event) => update({ ...episode, videoLink: event.target.value })}
                className={`${inputClass} sm:col-span-2`}
              />
              <select
                aria-label={`Video ${index + 1}: matching guide`}
                value={episode.guideSlug ?? ""}
                onChange={(event) => update({ ...episode, guideSlug: event.target.value })}
                className={`${inputClass} [color-scheme:dark] sm:col-span-2`}
              >
                <option value="">No matching guide</option>
                {guides.map((guide) => (
                  <option key={guide.slug} value={guide.slug}>
                    {guide.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      </Section>

      <SaveBar
        status={collection.status}
        now={now}
        pending={pending}
        result={result}
        onSave={(status) => save({ ...collection, status }, () => set("status", status))}
        remove={row ? { kind: "collections", id: row.id, after: `${base}/collections` } : undefined}
      />
    </div>
  );
}
