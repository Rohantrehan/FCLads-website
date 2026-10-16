"use client";

import type { CreatorChoice } from "@/components/board/AuthorField";
import { ListEditor, NumberField, SelectField, TextField, inputClass } from "@/components/board/fields";
import type { SettingsInput } from "@/lib/board/schemas";

// The parts of Site settings that used to be fixed in the code: FC Lads+ price and perks, social
// links, the Home "hard truth" section and the Discord page. Each one edits its slice of the form.

type Plus = SettingsInput["plus"];
type Socials = SettingsInput["socials"];
type HardTruth = SettingsInput["hardTruth"];
type Discord = SettingsInput["discord"];

const perkKeys = [
  { value: "guides", label: "Guides (book icon)" },
  { value: "discord", label: "Discord (chat icon)" },
  { value: "creators", label: "Creators (people icon)" },
  { value: "trading", label: "Trading (chart icon)" },
  { value: "review", label: "Review (video icon)" },
] as const;

const currencies = [
  { value: "USD", label: "US dollar ($)" },
  { value: "GBP", label: "British pound (£)" },
  { value: "EUR", label: "Euro (€)" },
] as const;

export function PlusEditor({ value, onChange }: { value: Plus; onChange: (value: Plus) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Price per month" hint="e.g. 29 or 24.99">
          <input
            name="plusPrice"
            type="number"
            inputMode="decimal"
            min={0.5}
            step={0.01}
            value={Number.isNaN(value.price) ? "" : value.price}
            onChange={(event) => onChange({ ...value, price: event.target.value === "" ? Number.NaN : Number(event.target.value) })}
            className={`${inputClass} tabular`}
          />
        </Field>
        <SelectField
          label="Currency"
          value={value.currency}
          onChange={(currency) => currency && onChange({ ...value, currency })}
          options={[...currencies]}
        />
        <NumberField
          label="Free trial"
          hint="days, 0 for none"
          value={value.trialDays}
          onChange={(trialDays) => onChange({ ...value, trialDays: trialDays ?? 0 })}
          min={0}
          max={90}
        />
      </div>
      <p className="text-sm text-muted">
        Shown everywhere the price appears (Home, FC Lads+ page, sign-up, paywalls, Terms). When payments are connected,
        change the price in the payment provider too.
      </p>
      <ListEditor
        label="Perks"
        hint="Home, the FC Lads+ page, paywalls and the membership page. {season} becomes the current season"
        items={value.perks}
        onChange={(perks) => onChange({ ...value, perks })}
        make={(): Plus["perks"][number] => ({ key: "guides", title: "", description: "" })}
        max={8}
        itemName="perk"
        addLabel="Add a perk"
        render={(perk, update, index) => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr]">
            <select
              aria-label={`Perk ${index + 1}: icon`}
              value={perk.key}
              onChange={(event) => update({ ...perk, key: event.target.value as Plus["perks"][number]["key"] })}
              className={`${inputClass} [color-scheme:dark]`}
            >
              {perkKeys.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              aria-label={`Perk ${index + 1}: title`}
              placeholder="Title"
              value={perk.title}
              maxLength={60}
              onChange={(event) => update({ ...perk, title: event.target.value })}
              className={`${inputClass} font-semibold`}
            />
            <input
              aria-label={`Perk ${index + 1}: description`}
              placeholder="One line about it"
              value={perk.description}
              maxLength={200}
              onChange={(event) => update({ ...perk, description: event.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
          </div>
        )}
      />
    </div>
  );
}

const socialFields = [
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@fclads" },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/fclads" },
  { key: "x", label: "X", placeholder: "https://x.com/fclads" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@fclads" },
  { key: "discord", label: "Discord invite", placeholder: "https://discord.gg/…" },
] as const;

export function SocialsEditor({ value, onChange }: { value: Socials; onChange: (value: Socials) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {socialFields.map((field) => (
        <TextField
          key={field.key}
          label={field.label}
          hint="leave empty to hide"
          type="url"
          value={value[field.key]}
          onChange={(link) => onChange({ ...value, [field.key]: link })}
          placeholder={field.placeholder}
          maxLength={300}
          name={`social-${field.key}`}
        />
      ))}
    </div>
  );
}

export function HardTruthEditor({
  value,
  onChange,
  creators,
}: {
  value: HardTruth;
  onChange: (value: HardTruth) => void;
  creators: CreatorChoice[];
}) {
  return (
    <ListEditor
      label="Problems and answers"
      hint="leave the list empty to hide the section"
      items={value}
      onChange={onChange}
      make={() => ({ problem: "", answerTitle: "", answer: "", creatorSlug: creators[0]?.slug ?? "", cta: { label: "", href: "/" } })}
      max={8}
      itemName="item"
      addLabel="Add a problem"
      render={(item, update, index) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            aria-label={`Item ${index + 1}: problem`}
            placeholder="The problem, e.g. A new patch drops."
            value={item.problem}
            maxLength={80}
            onChange={(event) => update({ ...item, problem: event.target.value })}
            className={`${inputClass} font-semibold`}
          />
          <input
            aria-label={`Item ${index + 1}: answer title`}
            placeholder="Answer title, e.g. Same-day patch breakdowns."
            value={item.answerTitle}
            maxLength={80}
            onChange={(event) => update({ ...item, answerTitle: event.target.value })}
            className={inputClass}
          />
          <textarea
            aria-label={`Item ${index + 1}: answer`}
            placeholder="How FC Lads answers it"
            value={item.answer}
            maxLength={400}
            rows={3}
            onChange={(event) => update({ ...item, answer: event.target.value })}
            className={`${inputClass} sm:col-span-2`}
          />
          <select
            aria-label={`Item ${index + 1}: creator`}
            value={item.creatorSlug}
            onChange={(event) => update({ ...item, creatorSlug: event.target.value })}
            className={`${inputClass} [color-scheme:dark]`}
          >
            {creators.map((creator) => (
              <option key={creator.slug} value={creator.slug}>
                {creator.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label={`Item ${index + 1}: button label`}
              placeholder="Button label"
              value={item.cta.label}
              maxLength={40}
              onChange={(event) => update({ ...item, cta: { ...item.cta, label: event.target.value } })}
              className={inputClass}
            />
            <input
              aria-label={`Item ${index + 1}: button page`}
              placeholder="/learn"
              value={item.cta.href}
              onChange={(event) => update({ ...item, cta: { ...item.cta, href: event.target.value } })}
              className={inputClass}
            />
          </div>
        </div>
      )}
    />
  );
}

export function DiscordEditor({ value, onChange }: { value: Discord; onChange: (value: Discord) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <ListEditor
        label="Main channels"
        hint="the members' Discord page"
        items={value.channels}
        onChange={(channels) => onChange({ ...value, channels })}
        make={() => ({ name: "", label: "", description: "", pinned: "" })}
        max={12}
        itemName="channel"
        addLabel="Add a channel"
        render={(channel, update, index) => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              aria-label={`Channel ${index + 1}: name`}
              placeholder="tactics-room"
              value={channel.name}
              maxLength={40}
              onChange={(event) => update({ ...channel, name: event.target.value.toLowerCase().replace(/\s+/g, "-") })}
              className={`${inputClass} font-semibold`}
            />
            <input
              aria-label={`Channel ${index + 1}: label`}
              placeholder="Label, e.g. Tactics"
              value={channel.label}
              maxLength={30}
              onChange={(event) => update({ ...channel, label: event.target.value })}
              className={inputClass}
            />
            <input
              aria-label={`Channel ${index + 1}: description`}
              placeholder="What it's for"
              value={channel.description}
              maxLength={200}
              onChange={(event) => update({ ...channel, description: event.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              aria-label={`Channel ${index + 1}: pinned message`}
              placeholder="Pinned message (optional)"
              value={channel.pinned ?? ""}
              maxLength={120}
              onChange={(event) => update({ ...channel, pinned: event.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
          </div>
        )}
      />
      <ListEditor
        label="Server rules"
        items={value.rules}
        onChange={(rules) => onChange({ ...value, rules })}
        make={() => ""}
        max={12}
        itemName="rule"
        addLabel="Add a rule"
        render={(rule, update, index) => (
          <input
            aria-label={`Rule ${index + 1}`}
            value={rule}
            maxLength={200}
            onChange={(event) => update(event.target.value)}
            className={inputClass}
          />
        )}
      />
    </div>
  );
}

/** A labelled wrapper for an input that isn't one of the standard fields. */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> · {hint}</span>}
      </span>
      {children}
    </label>
  );
}
