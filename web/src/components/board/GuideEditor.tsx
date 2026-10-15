"use client";

import { useState } from "react";
import { Gamepad2, Heading2, Lightbulb, ListOrdered, Lock, Pilcrow } from "lucide-react";
import { AuthorField, type BoardPerson, type CreatorChoice } from "@/components/board/AuthorField";
import {
  Choice,
  DateTimeField,
  ImageField,
  ListEditor,
  NumberField,
  Section,
  SelectField,
  TextArea,
  TextField,
  Toggle,
  inputClass,
} from "@/components/board/fields";
import { SaveBar, useSaver } from "@/components/board/SaveBar";
import { saveGuide } from "@/lib/board/actions";
import { accessLabels, guideCategories } from "@/lib/board/options";
import type { GuideInput } from "@/lib/board/schemas";
import { slugify } from "@/lib/board/slug";
import { videoLink } from "@/lib/board/video";
import type { EditorBlock } from "@/lib/content/guideBlocks";
import type { GuideRow } from "@/lib/content/rows";
import type { GuideCategory } from "@/types";

const blockTypes: { type: EditorBlock["type"]; label: string; icon: typeof Pilcrow; make: () => EditorBlock }[] = [
  { type: "section", label: "Heading", icon: Heading2, make: () => ({ type: "section", title: "" }) },
  { type: "p", label: "Paragraph", icon: Pilcrow, make: () => ({ type: "p", text: "" }) },
  { type: "steps", label: "Steps", icon: ListOrdered, make: () => ({ type: "steps", items: [{ title: "", text: "" }] }) },
  { type: "tip", label: "Tip box", icon: Lightbulb, make: () => ({ type: "tip", label: "", title: "", text: "" }) },
  { type: "controls", label: "Controller inputs", icon: Gamepad2, make: () => ({ type: "controls", inputs: [], result: "" }) },
  { type: "lock", label: "Members only from here", icon: Lock, make: () => ({ type: "lock" }) },
];

const withoutEmptyInputs = (block: EditorBlock): EditorBlock =>
  block.type === "controls" ? { ...block, inputs: block.inputs.filter(Boolean) } : block;

const blockName = (type: EditorBlock["type"]) => blockTypes.find((item) => item.type === type)?.label ?? "Block";

function BlockFields({ block, update }: { block: EditorBlock; update: (block: EditorBlock) => void }) {
  const Icon = blockTypes.find((item) => item.type === block.type)?.icon ?? Pilcrow;
  const title = (
    <p className="text-label mb-2 flex items-center gap-1.5 text-mint">
      <Icon aria-hidden className="size-3.5" />
      {blockName(block.type)}
    </p>
  );
  switch (block.type) {
    case "section":
      return (
        <>
          {title}
          <input aria-label="Heading" value={block.title} maxLength={140} onChange={(event) => update({ ...block, title: event.target.value })} className={`${inputClass} font-bold`} />
        </>
      );
    case "p":
      return (
        <>
          {title}
          <textarea aria-label="Paragraph" rows={4} value={block.text} maxLength={4000} onChange={(event) => update({ ...block, text: event.target.value })} className={`${inputClass} resize-y leading-relaxed`} />
        </>
      );
    case "steps":
      return (
        <>
          {title}
          <ListEditor
            label="Steps"
            items={block.items}
            onChange={(items) => update({ ...block, items })}
            make={() => ({ title: "", text: "" })}
            max={12}
            itemName="step"
            addLabel="Add a step"
            render={(step, change, index) => (
              <div className="flex flex-col gap-2">
                <input aria-label={`Step ${index + 1}: title`} placeholder={`Step ${index + 1}`} value={step.title} maxLength={160} onChange={(event) => change({ ...step, title: event.target.value })} className={`${inputClass} font-semibold`} />
                <textarea aria-label={`Step ${index + 1}: text`} rows={2} value={step.text} maxLength={800} onChange={(event) => change({ ...step, text: event.target.value })} className={`${inputClass} resize-y`} />
              </div>
            )}
          />
        </>
      );
    case "tip":
      return (
        <div className="flex flex-col gap-2">
          {title}
          <input aria-label="Tip label" placeholder="Label, e.g. Lads pro tip (optional)" value={block.label ?? ""} maxLength={40} onChange={(event) => update({ ...block, label: event.target.value })} className={inputClass} />
          <input aria-label="Tip title" placeholder="Title" value={block.title} maxLength={140} onChange={(event) => update({ ...block, title: event.target.value })} className={`${inputClass} font-semibold`} />
          <textarea aria-label="Tip text" rows={3} value={block.text} maxLength={800} onChange={(event) => update({ ...block, text: event.target.value })} className={`${inputClass} resize-y`} />
        </div>
      );
    case "controls":
      return (
        <div className="flex flex-col gap-2">
          {title}
          <input aria-label="Box title" placeholder="Title (optional, default “Controller inputs”)" value={block.title ?? ""} maxLength={80} onChange={(event) => update({ ...block, title: event.target.value })} className={inputClass} />
          <input
            aria-label="Buttons, in order, separated by commas"
            placeholder="Buttons in order, with commas: L1, R1, Through ball"
            value={block.inputs.join(", ")}
            // Empty items are kept while typing ("L1, ") and dropped on save.
            onChange={(event) => update({ ...block, inputs: event.target.value.split(",").map((item) => item.trim()) })}
            className={inputClass}
          />
          <input aria-label="What it does" placeholder="What it does, e.g. Driven lofted pass to the far wing" value={block.result} maxLength={160} onChange={(event) => update({ ...block, result: event.target.value })} className={inputClass} />
          <input aria-label="Note" placeholder="Note (optional)" value={block.note ?? ""} maxLength={400} onChange={(event) => update({ ...block, note: event.target.value })} className={inputClass} />
          <input aria-label="Success rate" placeholder="Success rate (optional), e.g. 84% in Elite testing" value={block.successRate ?? ""} maxLength={80} onChange={(event) => update({ ...block, successRate: event.target.value })} className={inputClass} />
        </div>
      );
    case "lock":
      return (
        <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-sm">
          <Lock aria-hidden className="size-4 text-gold" />
          <span>
            <span className="font-bold text-gold">Members only from here.</span>{" "}
            <span className="text-muted">On a free guide, everything below is for FC Lads+ members.</span>
          </span>
        </div>
      );
  }
}

export function GuideEditor({
  base,
  row,
  person,
  creators,
  now,
}: {
  base: string;
  row?: GuideRow;
  person: BoardPerson;
  creators: CreatorChoice[];
  now: number;
}) {
  const [guide, setGuide] = useState<GuideInput>(() => ({
    id: row?.id,
    status: row?.status ?? "draft",
    slug: row?.slug ?? "",
    title: row?.title ?? "",
    excerpt: row?.excerpt ?? "",
    category: row?.category ?? "tactics",
    format: row?.format ?? "article",
    minutes: row?.minutes ?? 5,
    access: row?.access ?? "plus",
    authorSlug: row?.author_slug ?? person.creatorSlug ?? creators[0]?.slug ?? "",
    publishedAt: row?.published_at ?? new Date(now).toISOString(),
    isNew: row?.is_new ?? true,
    isFeatured: row?.is_featured ?? false,
    videoLink: videoLink(row?.video),
    image: row?.image ?? null,
    highlight: row?.highlight ?? "",
    patch: row?.patch ?? "",
    presetCode: row?.preset_code ?? "",
    intro: row?.intro ?? [],
    body: row?.body ?? [],
  }));
  // New guides take their web address from the title until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(Boolean(row));
  const [introText, setIntroText] = useState((row?.intro ?? []).join("\n\n"));
  const set = <K extends keyof GuideInput>(key: K, value: GuideInput[K]) => setGuide((old) => ({ ...old, [key]: value }));
  const { save, pending, result } = useSaver(saveGuide, (id) => `${base}/guides/${id}`);
  const body = guide.body as EditorBlock[];

  return (
    <div className="flex flex-col gap-6">
      <Section title="Basics" description="What shows on the guide card in Learn.">
        <TextField
          label="Title"
          value={guide.title}
          maxLength={120}
          name="title"
          onChange={(title) => setGuide((old) => ({ ...old, title, ...(slugTouched ? {} : { slug: slugify(title) }) }))}
        />
        <TextField
          label="Web address"
          hint={`/guides/${guide.slug || "…"}`}
          value={guide.slug}
          maxLength={80}
          name="slug"
          onChange={(slug) => {
            setSlugTouched(true);
            set("slug", slug.toLowerCase());
          }}
        />
        <TextArea label="Short description" value={guide.excerpt} onChange={(value) => set("excerpt", value)} rows={2} maxLength={300} name="excerpt" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label="Category"
            value={guide.category as GuideCategory}
            onChange={(value) => value && set("category", value)}
            options={guideCategories}
          />
          <SelectField
            label="Format"
            value={guide.format}
            onChange={(value) => value && set("format", value)}
            options={[
              { value: "article", label: "Article" },
              { value: "video", label: "Video" },
            ]}
          />
          <NumberField label={guide.format === "video" ? "Video length" : "Read time"} hint="minutes" value={guide.minutes} onChange={(value) => set("minutes", value as number)} min={1} />
        </div>
        <ImageField label="Thumbnail" hint="optional" folder="guides" value={guide.image} onChange={(image) => set("image", image)} />
        <TextField
          label="Members-only video"
          hint="optional Loom or unlisted YouTube link"
          type="url"
          placeholder="https://www.loom.com/share/…"
          value={guide.videoLink ?? ""}
          onChange={(value) => set("videoLink", value)}
        />
      </Section>

      <Section title="The article" description="Lead paragraphs, then the body built from blocks. Members only, unless the guide is free.">
        <TextArea
          label="Intro"
          hint="leave an empty line between paragraphs"
          value={introText}
          rows={4}
          onChange={(value) => {
            setIntroText(value);
            set("intro", value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean));
          }}
        />
        <ListEditor<EditorBlock>
          label="Body"
          items={body}
          onChange={(blocks) => set("body", blocks)}
          make={() => ({ type: "p", text: "" })}
          max={body.length}
          itemName="block"
          addLabel=""
          render={(block, update) => <BlockFields block={block} update={update} />}
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Add a block</p>
          <div className="flex flex-wrap gap-2">
            {blockTypes
              .filter((item) => item.type !== "lock" || !body.some((block) => block.type === "lock"))
              .map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => set("body", [...body, item.make()])}
                  className="text-label flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface px-3 py-2 text-on-surface hover:border-primary/50"
                >
                  <item.icon aria-hidden className="size-4 text-primary" />
                  {item.label}
                </button>
              ))}
          </div>
        </div>
      </Section>

      <Section title="Sidebar extras" description="All optional.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Green words in the title" hint="e.g. high press" value={guide.highlight ?? ""} onChange={(value) => set("highlight", value)} maxLength={60} />
          <TextField label="Game patch" hint="e.g. 1.08" value={guide.patch ?? ""} onChange={(value) => set("patch", value)} maxLength={20} />
          <TextField label="Tactic share code" value={guide.presetCode ?? ""} onChange={(value) => set("presetCode", value)} maxLength={40} />
        </div>
      </Section>

      <Section title="Who and when">
        <Choice
          label="Who can read it?"
          value={guide.access}
          onChange={(value) => set("access", value)}
          options={[
            { value: "plus", label: accessLabels.plus },
            { value: "free", label: accessLabels.free, hint: "Use “Members only from here” to lock the end" },
          ]}
        />
        <AuthorField person={person} creators={creators} value={guide.authorSlug} onChange={(slug) => set("authorSlug", slug)} />
        <DateTimeField label="Date and time" hint="UK time. Pick a future time to schedule it" value={guide.publishedAt} onChange={(iso) => set("publishedAt", iso)} />
        <Toggle label="Show a “New” tag" checked={guide.isNew} onChange={(value) => set("isNew", value)} />
        {person.isAdmin && (
          <Toggle
            label="Featured guide"
            hint="The big guide at the top of Learn. If several are featured, the newest wins."
            checked={guide.isFeatured}
            onChange={(value) => set("isFeatured", value)}
          />
        )}
      </Section>

      <SaveBar
        status={guide.status}
        date={guide.publishedAt}
        now={now}
        pending={pending}
        result={result}
        onSave={(status) => save({ ...guide, status, body: body.map(withoutEmptyInputs) }, () => set("status", status))}
        remove={row ? { kind: "guides", id: row.id, after: `${base}/guides` } : undefined}
      />
    </div>
  );
}
