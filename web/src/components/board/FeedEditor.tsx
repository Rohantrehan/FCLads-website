"use client";

import { useState } from "react";
import { AuthorField, type BoardPerson, type CreatorChoice } from "@/components/board/AuthorField";
import {
  Choice,
  DateTimeField,
  ListEditor,
  NumberField,
  Section,
  SelectField,
  TextArea,
  TextField,
  inputClass,
} from "@/components/board/fields";
import { SaveBar, useSaver } from "@/components/board/SaveBar";
import { saveFeedPost } from "@/lib/board/actions";
import { accessLabels, feedPostTypes, feedTopicOptions } from "@/lib/board/options";
import type { FeedPostInput } from "@/lib/board/schemas";
import { videoLink } from "@/lib/board/video";
import type { FeedPostRow, FeedPostType } from "@/lib/content/rows";
import type { FeedTopic } from "@/types";

/** Every type's fields in one place, so switching type doesn't lose what was typed. */
interface Draft {
  title: string;
  excerpt: string;
  minutes?: number;
  views?: number;
  approval?: number;
  youtubeLink: string;
  guideSlug: string;
  points: string[];
  targets: { card: string; buyBelow?: number }[];
  freeTargets?: number;
  label: string;
  text: string;
  question: string;
  options: { label: string; votes?: number }[];
}

function toDraft(fields: Record<string, unknown> = {}): Draft {
  const str = (key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : "");
  const num = (key: string) => (typeof fields[key] === "number" ? (fields[key] as number) : undefined);
  const list = <T,>(key: string) => (Array.isArray(fields[key]) ? (fields[key] as T[]) : undefined);
  const youtubeId = str("youtubeId");
  return {
    title: str("title"),
    excerpt: str("excerpt"),
    minutes: num("minutes"),
    views: num("views"),
    approval: num("approval"),
    youtubeLink: youtubeId ? videoLink({ provider: "youtube", id: youtubeId }) : "",
    guideSlug: str("guideSlug"),
    points: list<string>("points") ?? [""],
    targets: list<{ card: string; buyBelow: number }>("targets") ?? [{ card: "" }],
    freeTargets: num("freeTargets") ?? 1,
    label: str("label"),
    text: str("text"),
    question: str("question"),
    options: list<{ label: string; votes: number }>("options") ?? [{ label: "" }, { label: "" }],
  };
}

/** Only the fields the post type uses. */
function fieldsFor(type: FeedPostType, draft: Draft): Record<string, unknown> {
  switch (type) {
    case "video":
      return {
        title: draft.title,
        excerpt: draft.excerpt,
        minutes: draft.minutes,
        views: draft.views,
        approval: draft.approval,
        youtubeId: draft.youtubeLink,
        guideSlug: draft.guideSlug,
      };
    case "update":
      return { title: draft.title, points: draft.points };
    case "trading":
      return {
        title: draft.title,
        targets: draft.targets.map((target) => ({ card: target.card, buyBelow: target.buyBelow ?? -1 })),
        freeTargets: draft.freeTargets ?? 0,
      };
    case "tip":
      return { label: draft.label, text: draft.text };
    case "poll":
      return { question: draft.question, options: draft.options.map((option) => ({ label: option.label, votes: option.votes ?? 0 })) };
  }
}

export function FeedEditor({
  base,
  row,
  person,
  creators,
  guides,
  now,
}: {
  base: string;
  row?: FeedPostRow;
  person: BoardPerson;
  creators: CreatorChoice[];
  guides: { slug: string; title: string }[];
  now: number;
}) {
  const [meta, setMeta] = useState({
    status: row?.status ?? ("draft" as const),
    postType: row?.post_type ?? ("tip" as FeedPostType),
    topic: row?.topic ?? ("gameplay" as FeedTopic),
    access: row?.access ?? ("free" as const),
    authorSlug: row?.author_slug ?? person.creatorSlug ?? creators[0]?.slug ?? "",
    postedAt: row?.posted_at ?? new Date(now).toISOString(),
  });
  const [draft, setDraft] = useState(() => toDraft(row?.fields));
  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }));
  const { save, pending, result } = useSaver(saveFeedPost, (id) => `${base}/feed/${id}`);
  const type = meta.postType;

  const payload = (status: FeedPostInput["status"]): FeedPostInput => ({
    id: row?.id,
    ...meta,
    status,
    fields: fieldsFor(type, draft),
  });

  return (
    <div className="flex flex-col gap-6">
      <Section title="What kind of post?">
        <Choice
          label="Post type"
          value={type}
          onChange={(postType) => setMeta((old) => ({ ...old, postType }))}
          options={feedPostTypes}
        />
        <SelectField
          label="Topic"
          value={meta.topic}
          onChange={(topic) => topic && setMeta((old) => ({ ...old, topic }))}
          options={feedTopicOptions}
          className="max-w-xs"
        />
      </Section>

      <Section title="The post">
        {(type === "video" || type === "update" || type === "trading") && (
          <TextField label="Title" value={draft.title} onChange={(value) => setField("title", value)} maxLength={140} name="title" />
        )}

        {type === "video" && (
          <>
            <TextArea label="Description" value={draft.excerpt} onChange={(value) => setField("excerpt", value)} rows={3} maxLength={400} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <NumberField label="Length" hint="minutes" value={draft.minutes} onChange={(value) => setField("minutes", value)} min={1} />
              <NumberField label="Views" hint="optional" value={draft.views} onChange={(value) => setField("views", value)} min={0} />
              <NumberField label="Likes" hint="%, optional" value={draft.approval} onChange={(value) => setField("approval", value)} min={0} max={100} />
            </div>
            <TextField
              label="Public YouTube clip"
              hint="optional"
              type="url"
              placeholder="https://youtu.be/…"
              value={draft.youtubeLink}
              onChange={(value) => setField("youtubeLink", value)}
            />
            <SelectField
              label="Full breakdown"
              hint="optional FC Lads+ guide"
              value={draft.guideSlug}
              onChange={(value) => setField("guideSlug", value)}
              options={guides.map((guide) => ({ value: guide.slug, label: guide.title }))}
              empty="No guide"
            />
          </>
        )}

        {type === "update" && (
          <ListEditor
            label="Bullet points"
            items={draft.points}
            onChange={(points) => setField("points", points)}
            make={() => ""}
            max={8}
            itemName="point"
            addLabel="Add a point"
            render={(point, update, index) => (
              <input aria-label={`Point ${index + 1}`} value={point} maxLength={300} onChange={(event) => update(event.target.value)} className={inputClass} />
            )}
          />
        )}

        {type === "trading" && (
          <>
            <ListEditor<Draft["targets"][number]>
              label="Targets"
              items={draft.targets}
              onChange={(targets) => setField("targets", targets)}
              make={() => ({ card: "" })}
              max={10}
              itemName="target"
              addLabel="Add a target"
              render={(target, update, index) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_12rem]">
                  <input
                    aria-label={`Target ${index + 1}: card`}
                    placeholder="e.g. 85 rated LaLiga fodder"
                    value={target.card}
                    maxLength={80}
                    onChange={(event) => update({ ...target, card: event.target.value })}
                    className={inputClass}
                  />
                  <input
                    aria-label={`Target ${index + 1}: buy below (coins)`}
                    placeholder="Buy below (coins)"
                    type="number"
                    min={0}
                    value={target.buyBelow ?? ""}
                    onChange={(event) => update({ ...target, buyBelow: event.target.value === "" ? undefined : Math.round(Number(event.target.value)) })}
                    className={`${inputClass} tabular`}
                  />
                </div>
              )}
            />
            <Choice
              label="Who can see it?"
              value={meta.access}
              onChange={(access) => setMeta((old) => ({ ...old, access }))}
              options={[
                { value: "free", label: accessLabels.free },
                { value: "plus", label: accessLabels.plus, hint: "Others see only the first targets" },
              ]}
            />
            {meta.access === "plus" && (
              <NumberField
                label="Targets everyone can see"
                hint="the rest stay locked"
                value={draft.freeTargets}
                onChange={(value) => setField("freeTargets", value)}
                min={0}
                max={10}
                className="max-w-xs"
              />
            )}
          </>
        )}

        {type === "tip" && (
          <>
            <TextField label="Label" placeholder="e.g. Market rule #1" value={draft.label} onChange={(value) => setField("label", value)} maxLength={60} />
            <TextArea label="Tip" value={draft.text} onChange={(value) => setField("text", value)} rows={3} maxLength={400} name="text" />
          </>
        )}

        {type === "poll" && (
          <>
            <TextField label="Question" value={draft.question} onChange={(value) => setField("question", value)} maxLength={200} />
            <ListEditor<Draft["options"][number]>
              label="Answers"
              items={draft.options}
              onChange={(options) => setField("options", options)}
              make={() => ({ label: "" })}
              max={6}
              itemName="answer"
              addLabel="Add an answer"
              render={(option, update, index) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem]">
                  <input
                    aria-label={`Answer ${index + 1}`}
                    value={option.label}
                    maxLength={80}
                    onChange={(event) => update({ ...option, label: event.target.value })}
                    className={inputClass}
                  />
                  <input
                    aria-label={`Answer ${index + 1}: votes`}
                    placeholder="Votes"
                    type="number"
                    min={0}
                    value={option.votes ?? ""}
                    onChange={(event) => update({ ...option, votes: event.target.value === "" ? undefined : Math.round(Number(event.target.value)) })}
                    className={`${inputClass} tabular`}
                  />
                </div>
              )}
            />
          </>
        )}
      </Section>

      <Section title="Who and when">
        <AuthorField person={person} creators={creators} value={meta.authorSlug} onChange={(authorSlug) => setMeta((old) => ({ ...old, authorSlug }))} />
        <DateTimeField
          label="Date and time"
          hint="UK time. Pick a future time to schedule it"
          value={meta.postedAt}
          onChange={(postedAt) => setMeta((old) => ({ ...old, postedAt }))}
        />
      </Section>

      <SaveBar
        status={meta.status}
        date={meta.postedAt}
        now={now}
        pending={pending}
        result={result}
        onSave={(status) => save(payload(status), () => setMeta((old) => ({ ...old, status })))}
        remove={row ? { kind: "feed", id: row.id, after: `${base}/feed` } : undefined}
      />
    </div>
  );
}
