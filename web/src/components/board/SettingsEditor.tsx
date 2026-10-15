"use client";

import { useState } from "react";
import type { CreatorChoice } from "@/components/board/AuthorField";
import { ListEditor, Section, TextField, inputClass } from "@/components/board/fields";
import { SaveOnlyBar, useSaver } from "@/components/board/SaveBar";
import { saveSettings } from "@/lib/board/actions";
import type { SettingsInput } from "@/lib/board/schemas";
import type { SiteSettingsRow } from "@/lib/content/rows";

type Trending = SettingsInput["trending"][number];

export function SettingsEditor({ row, creators }: { row: SiteSettingsRow | null; creators: CreatorChoice[] }) {
  const [settings, setSettings] = useState<SettingsInput>(() => ({
    currentPatch: row?.current_patch ?? "",
    currentSeason: row?.current_season ?? "",
    trending: row?.trending ?? [],
  }));
  const { save, pending, result } = useSaver(saveSettings);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Game">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Current game patch"
            hint="shown on Home, Learn and the dashboard"
            value={settings.currentPatch}
            onChange={(currentPatch) => setSettings((old) => ({ ...old, currentPatch }))}
            maxLength={20}
            name="currentPatch"
          />
          <TextField
            label="Current season"
            hint="e.g. FC 27"
            value={settings.currentSeason}
            onChange={(currentSeason) => setSettings((old) => ({ ...old, currentSeason }))}
            maxLength={20}
          />
        </div>
      </Section>
      <Section title="Trending this week" description="The Feed sidebar. Up to 6 links to pages on this site.">
        <ListEditor<Trending>
          label="Links"
          items={settings.trending}
          onChange={(trending) => setSettings((old) => ({ ...old, trending }))}
          make={() => ({ title: "", href: "/", authorSlug: creators[0]?.slug ?? "" })}
          max={6}
          itemName="link"
          addLabel="Add a link"
          render={(item, update, index) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input aria-label={`Link ${index + 1}: title`} placeholder="Title" value={item.title} maxLength={100} onChange={(event) => update({ ...item, title: event.target.value })} className={`${inputClass} font-semibold`} />
              <input aria-label={`Link ${index + 1}: page`} placeholder="/guides/beat-the-high-press" value={item.href} onChange={(event) => update({ ...item, href: event.target.value })} className={inputClass} />
              <select
                aria-label={`Link ${index + 1}: creator`}
                value={item.authorSlug}
                onChange={(event) => update({ ...item, authorSlug: event.target.value })}
                className={`${inputClass} [color-scheme:dark]`}
              >
                {creators.map((creator) => (
                  <option key={creator.slug} value={creator.slug}>
                    {creator.name}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Link ${index + 1}: views`}
                placeholder="Views (optional)"
                type="number"
                min={0}
                value={item.views ?? ""}
                onChange={(event) => update({ ...item, views: event.target.value === "" ? undefined : Math.round(Number(event.target.value)) })}
                className={`${inputClass} tabular`}
              />
            </div>
          )}
        />
      </Section>
      <SaveOnlyBar pending={pending} result={result} onSave={() => save(settings)} />
    </div>
  );
}
