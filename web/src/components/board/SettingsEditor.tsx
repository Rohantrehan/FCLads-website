"use client";

import { useState, type CSSProperties } from "react";
import { Check, Replace, RotateCcw } from "lucide-react";
import type { CreatorChoice } from "@/components/board/AuthorField";
import { ListEditor, Section, TextField, inputClass } from "@/components/board/fields";
import { ResultMessage, SaveOnlyBar, useSaver } from "@/components/board/SaveBar";
import { renameGame, saveSettings } from "@/lib/board/actions";
import type { SettingsInput } from "@/lib/board/schemas";
import type { SiteSettingsRow } from "@/lib/content/rows";
import { cn } from "@/lib/cn";
import { DEFAULT_THEME_COLOR, isHexColor, themePresets, themeTokens } from "@/lib/theme";

type Trending = SettingsInput["trending"][number];

/** The theme's tokens as CSS variables, so a preview box shows the new colours before saving. */
const previewVars = (color: string) =>
  Object.fromEntries(Object.entries(themeTokens(color)).map(([name, value]) => [`--color-${name}`, value])) as CSSProperties;

function ThemePicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [typed, setTyped] = useState(value);
  const choose = (color: string) => {
    setTyped(color);
    onChange(color);
  };
  const isPreset = themePresets.some((preset) => preset.color === value);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Ready-made colours</legend>
          <div className="flex flex-wrap gap-2">
            {themePresets.map((preset) => {
              const selected = preset.color === value;
              return (
                <label
                  key={preset.name}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
                    selected ? "border-white/60 bg-white/8" : "border-white/10 bg-surface hover:border-white/25",
                  )}
                >
                  <input
                    type="radio"
                    name="theme-preset"
                    value={preset.color}
                    checked={selected}
                    onChange={() => choose(preset.color)}
                    className="sr-only"
                  />
                  <span aria-hidden className="flex size-5 items-center justify-center rounded-full" style={{ background: themeTokens(preset.color).primary }}>
                    {selected && <Check className="size-3.5" style={{ color: themeTokens(preset.color)["on-primary"] }} />}
                  </span>
                  {preset.name}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="theme-custom" className="text-sm font-semibold">
            Any colour <span className="font-normal text-muted">· pick one, or type a code like #ff4d5e</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="theme-custom"
              type="color"
              value={value}
              onChange={(event) => choose(event.target.value)}
              className={cn(
                "h-11 w-16 cursor-pointer rounded-xl border bg-surface p-1",
                isPreset ? "border-white/10" : "border-white/60",
              )}
            />
            <input
              aria-label="Colour code"
              value={typed}
              maxLength={7}
              placeholder="#2bd98b"
              onChange={(event) => {
                const next = event.target.value.trim();
                setTyped(next);
                if (isHexColor(next)) onChange(next.toLowerCase());
              }}
              className={cn(inputClass, "tabular w-32")}
            />
            {value !== DEFAULT_THEME_COLOR && (
              <button
                type="button"
                onClick={() => choose(DEFAULT_THEME_COLOR)}
                className="text-label flex items-center gap-1.5 text-muted hover:text-white"
              >
                <RotateCcw aria-hidden className="size-4" />
                Back to the original green
              </button>
            )}
          </div>
          <p className="text-xs text-muted">
            Very dark or very light colours are adjusted a little so text and buttons stay easy to read.
          </p>
        </div>
      </div>

      {/* Preview: the same classes the site uses, with this colour. */}
      <div style={previewVars(value)} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-canvas p-5" aria-label="Preview">
        <p className="text-label text-muted">Preview</p>
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          Live now
        </p>
        <p className="font-display text-xl font-extrabold uppercase">
          Beat the <span className="text-primary">high press</span>
        </p>
        <div className="rounded-xl border border-primary/40 bg-pitch-green p-3 text-sm text-muted">
          FC Lads+ members get every guide.
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-label rounded-xl bg-gradient-to-r from-primary-bright via-primary to-mint px-4 py-2.5 text-on-primary shadow-[0_0_24px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]">
            Start free trial
          </span>
          <span className="text-label rounded-xl border border-primary/40 px-4 py-2.5 text-primary">Learn more</span>
        </div>
      </div>
    </div>
  );
}

/** Swap one game name for another in every post, guide, collection and profile. */
function RenameGame({ current, onRenamed }: { current: string; onRenamed: (name: string) => void }) {
  const [from, setFrom] = useState(current);
  const [to, setTo] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { save, pending, result } = useSaver(renameGame);
  const done = result.ok ? `Done. ${result.id} ${result.id === "1" ? "item" : "items"} updated, and the current season is now ${to}.` : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Replace" hint="e.g. FC 27" value={from} onChange={setFrom} maxLength={20} name="renameFrom" />
        <TextField label="With" hint="e.g. FC 28" value={to} onChange={setTo} maxLength={20} name="renameTo" />
      </div>
      <p className="text-sm text-muted">
        Changes the words in every guide, collection, feed post, trading post and creator profile, plus the site&apos;s own
        text (FC Lads+ page, menus). To undo, swap them back. Words inside other words aren&apos;t a problem, but check
        that the old name isn&apos;t used for something else (e.g. a review of last year&apos;s game).
      </p>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
          <span>
            Replace &ldquo;{from}&rdquo; with &ldquo;{to}&rdquo; everywhere?
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              save({ from, to }, () => {
                setConfirming(false);
                onRenamed(to.trim());
              }, "")
            }
            className="text-label rounded-lg bg-gold px-3 py-1.5 text-canvas disabled:opacity-60"
          >
            {pending ? "Replacing…" : "Yes, replace"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-label px-2 py-1.5 text-muted hover:text-white">
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!from.trim() || !to.trim()}
          onClick={() => setConfirming(true)}
          className="text-label flex w-fit items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-on-surface hover:border-white/30 disabled:opacity-40"
        >
          <Replace aria-hidden className="size-4" />
          Replace everywhere
        </button>
      )}
      <ResultMessage result={{ ...result, message: done }} />
    </div>
  );
}

export function SettingsEditor({ row, creators }: { row: SiteSettingsRow | null; creators: CreatorChoice[] }) {
  const [settings, setSettings] = useState<SettingsInput>(() => ({
    currentPatch: row?.current_patch ?? "",
    currentSeason: row?.current_season ?? "",
    themeColor: row?.theme_color ?? DEFAULT_THEME_COLOR,
    trending: row?.trending ?? [],
  }));
  const { save, pending, result } = useSaver(saveSettings);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Site colour" description="The main colour of the whole website: buttons, links, highlights and glows. Press Save to apply it.">
        <ThemePicker value={settings.themeColor} onChange={(themeColor) => setSettings((old) => ({ ...old, themeColor }))} />
      </Section>

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
            hint="e.g. FC 27. Used in the site's own text"
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

      <Section
        title="Rename the game everywhere"
        description="When the new game comes out: swap the old name for the new one across the whole site in one go. This saves straight away."
      >
        <RenameGame
          current={row?.current_season ?? ""}
          // Keep the form above in step, so a later Save doesn't put the old name back.
          onRenamed={(currentSeason) => setSettings((old) => ({ ...old, currentSeason }))}
        />
      </Section>
    </div>
  );
}
