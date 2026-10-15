"use client";

import { useState } from "react";
import { AuthorField, type BoardPerson, type CreatorChoice } from "@/components/board/AuthorField";
import { Choice, DateTimeField, ImageField, Section, TextArea, TextField } from "@/components/board/fields";
import { SaveBar, useSaver } from "@/components/board/SaveBar";
import { saveTradingPost } from "@/lib/board/actions";
import { accessLabels } from "@/lib/board/options";
import type { TradingPostInput } from "@/lib/board/schemas";
import type { TradingPostRow } from "@/lib/content/rows";

export function TradingEditor({
  base,
  row,
  person,
  creators,
  now,
}: {
  base: string;
  row?: TradingPostRow;
  person: BoardPerson;
  creators: CreatorChoice[];
  now: number;
}) {
  const [post, setPost] = useState<TradingPostInput>(() => ({
    id: row?.id,
    status: row?.status ?? "draft",
    access: row?.access ?? "free",
    authorSlug: row?.author_slug ?? person.creatorSlug ?? creators[0]?.slug ?? "",
    postedAt: row?.posted_at ?? new Date(now).toISOString(),
    title: row?.title ?? "",
    text: row?.text ?? "",
    image: row?.image ?? null,
  }));
  const set = <K extends keyof TradingPostInput>(key: K, value: TradingPostInput[K]) => setPost((old) => ({ ...old, [key]: value }));
  const { save, pending, result } = useSaver(saveTradingPost, (id) => `${base}/trading/${id}`);

  return (
    <div className="flex flex-col gap-6">
      <Section title="The post" description="Shows on /trading: heading and text on the left, screenshot on the right.">
        <TextField label="Heading" value={post.title} onChange={(value) => set("title", value)} maxLength={120} name="title" />
        <TextArea label="Text" value={post.text} onChange={(value) => set("text", value)} rows={6} maxLength={3000} name="text" />
        <ImageField
          label="Screenshot"
          hint="optional"
          folder="trading"
          value={post.image?.src ?? null}
          onChange={(src) => set("image", src ? { src, alt: post.image?.alt ?? "" } : null)}
        />
        {post.image && (
          <TextField
            label="Describe the screenshot"
            hint="for screen readers, e.g. “Price chart of 86 fodder rising”"
            value={post.image.alt}
            onChange={(alt) => set("image", { ...post.image!, alt })}
            maxLength={200}
          />
        )}
      </Section>
      <Section title="Who and when">
        <Choice
          label="Who can see it?"
          value={post.access}
          onChange={(value) => set("access", value)}
          options={[
            { value: "free", label: accessLabels.free },
            { value: "plus", label: accessLabels.plus, hint: "Others see the heading and a lock" },
          ]}
        />
        <AuthorField person={person} creators={creators} value={post.authorSlug} onChange={(slug) => set("authorSlug", slug)} />
        <DateTimeField
          label="Date and time"
          hint="UK time. Pick a future time to schedule it"
          value={post.postedAt}
          onChange={(iso) => set("postedAt", iso)}
        />
      </Section>
      <SaveBar
        status={post.status}
        date={post.postedAt}
        now={now}
        pending={pending}
        result={result}
        onSave={(status) => save({ ...post, status }, () => set("status", status))}
        remove={row ? { kind: "trading", id: row.id, after: `${base}/trading` } : undefined}
      />
    </div>
  );
}
