"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { ukInputToIso, ukInputValue } from "@/lib/ukTime";

// Form pieces for the posting board. Controlled inputs: each editor keeps the whole post in state
// and sends it to a Server Action as one object.

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-muted/60 focus:border-primary/60 focus:outline-none";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> · {hint}</span>}
      </label>
      {children(id)}
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  className,
  name,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "url" | "email";
  className?: string;
  name?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
  name,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  name?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "resize-y leading-relaxed")}
        />
      )}
    </Field>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  className,
  name,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  className?: string;
  name?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value === "" ? undefined : Math.round(Number(event.target.value)))}
          className={cn(inputClass, "tabular")}
        />
      )}
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
  empty,
  className,
  name,
}: {
  label: string;
  hint?: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: { value: T; label: string }[];
  /** Label for a "none" choice. Leave out to make a choice required. */
  empty?: string;
  className?: string;
  name?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value as T | "")}
          className={cn(inputClass, "[color-scheme:dark]")}
        >
          {empty !== undefined && <option value="">{empty}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** A row of big choice buttons (radio group). */
export function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer flex-col rounded-xl border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
              value === option.value
                ? "border-primary bg-primary/10 text-on-surface"
                : "border-white/10 bg-surface text-muted hover:border-white/25 hover:text-on-surface",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="font-semibold">{option.label}</span>
            {option.hint && <span className="text-xs text-muted">{option.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-[var(--color-primary)]"
      />
      <span>
        <span className="font-semibold">{label}</span>
        {hint && <span className="block text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Date and time in UK time; the value is an ISO moment. */
export function DateTimeField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  return (
    <Field label={label} hint={hint ?? "UK time"}>
      {(id) => (
        <input
          id={id}
          type="datetime-local"
          value={ukInputValue(value)}
          onChange={(event) => {
            const iso = ukInputToIso(event.target.value);
            if (iso) onChange(iso);
          }}
          className={cn(inputClass, "max-w-xs [color-scheme:dark]")}
        />
      )}
    </Field>
  );
}

/** Longest side after resizing. Keeps uploads small (the free plan has 1 GB of storage). */
const MAX_SIDE = 1600;

async function toWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("resize"))), "image/webp", 0.85),
  );
}

/** Picks a picture, shrinks it in the browser, uploads it to the "media" bucket, and returns its public URL. */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  folder,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: "trading" | "guides" | "creators" | "site";
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  async function upload(file: File | undefined) {
    if (!file) return;
    setProblem(undefined);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setProblem("Use a PNG, JPG or WebP picture.");
    if (file.size > 20 * 1024 * 1024) return setProblem("That picture is over 20 MB.");
    setBusy(true);
    try {
      const blob = await toWebp(file);
      const supabase = createBrowserSupabase();
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      onChange(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    } catch {
      setProblem("Couldn't upload the picture. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> · {hint}</span>}
      </p>
      {value ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-white/10">
          <Image src={value} alt="" width={640} height={360} unoptimized className="h-auto w-full" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-canvas/90 px-2.5 py-1.5 text-xs font-bold text-on-surface hover:text-danger-soft"
          >
            <X aria-hidden className="size-3.5" />
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex w-full max-w-sm cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-surface px-4 py-8 text-sm text-muted hover:border-primary/50 hover:text-on-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60"
        >
          {busy ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <ImagePlus aria-hidden className="size-6" />}
          {busy ? "Uploading…" : "Choose a picture"}
          <span className="text-xs">PNG, JPG or WebP</span>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {problem && (
        <p role="alert" className="text-sm text-danger-soft">
          {problem}
        </p>
      )}
    </div>
  );
}

/** Add / remove / reorder items in a list. `render` draws one item's inputs. */
export function ListEditor<T>({
  label,
  hint,
  items,
  onChange,
  make,
  render,
  addLabel,
  max,
  itemName,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, update: (item: T) => void, index: number) => ReactNode;
  addLabel: string;
  max?: number;
  /** "Target", "Answer": used in the button labels for screen readers. */
  itemName: string;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> · {hint}</span>}
      </legend>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 rounded-xl border border-white/8 bg-[#0b1017] p-3">
          <div className="min-w-0 flex-1">{render(item, (next) => onChange(items.map((old, i) => (i === index ? next : old))), index)}</div>
          <div className="flex shrink-0 flex-col gap-1">
            <IconButton label={`Move ${itemName} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton label={`Move ${itemName} ${index + 1} down`} disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
              <ArrowDown className="size-4" />
            </IconButton>
            <IconButton label={`Remove ${itemName} ${index + 1}`} danger onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        </div>
      ))}
      {(max === undefined || items.length < max) && (
        <button
          type="button"
          onClick={() => onChange([...items, make()])}
          className="text-label flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-4 py-2.5 text-primary hover:border-primary/50"
        >
          <Plus aria-hidden className="size-4" />
          {addLabel}
        </button>
      )}
    </fieldset>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border border-white/10 text-muted disabled:opacity-30",
        danger ? "hover:border-danger/50 hover:text-danger-soft" : "hover:border-white/25 hover:text-on-surface",
      )}
    >
      {children}
    </button>
  );
}

/** A group of fields with a heading. */
export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-extrabold uppercase">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
