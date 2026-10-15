"use client";

import { useActionState, useId, useState } from "react";
import { CheckCircle2, Link2, Send, Users } from "lucide-react";
import { editReview, sendReview, type ReviewFormState } from "@/app/(site)/dashboard/review/actions";
import { cn } from "@/lib/cn";

export interface ReviewerOption {
  slug: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
}

const field =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm placeholder:text-muted/60 focus:border-primary/60 focus:outline-none";

/** Match link + "what should we look at?", shared by the send and edit forms. */
function MatchFields({
  errors,
  defaults,
  onEdit,
}: {
  errors?: ReviewFormState["errors"];
  defaults?: { matchUrl: string; focus: string };
  onEdit: () => void;
}) {
  const id = useId();
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-match`} className="text-sm font-semibold">
          Link to your match
        </label>
        <div className="relative">
          <Link2 aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input
            id={`${id}-match`}
            name="matchUrl"
            type="url"
            inputMode="url"
            defaultValue={defaults?.matchUrl}
            placeholder="https://youtu.be/…"
            aria-invalid={errors?.matchUrl ? true : undefined}
            aria-describedby={`${id}-match-hint${errors?.matchUrl ? ` ${id}-match-error` : ""}`}
            onChange={onEdit}
            className={cn(field, "pl-11", errors?.matchUrl && "border-danger/70")}
          />
        </div>
        <p id={`${id}-match-hint`} className="text-xs text-muted">
          Upload your match as an unlisted YouTube video, or to Google Drive or Medal, and paste the link. Full match, if you
          can. Make sure anyone with the link can open it.
        </p>
        {errors?.matchUrl && (
          <p id={`${id}-match-error`} role="alert" className="text-sm text-danger-soft">
            {errors.matchUrl}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-focus`} className="text-sm font-semibold">
          What should we look at? <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={`${id}-focus`}
          name="focus"
          rows={3}
          maxLength={500}
          defaultValue={defaults?.focus}
          placeholder="e.g. I keep getting caught on cutbacks and lose the ball in transition."
          className={field}
        />
        {errors?.focus && (
          <p role="alert" className="text-sm text-danger-soft">
            {errors.focus}
          </p>
        )}
      </div>
    </>
  );
}

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger-soft">
      {message}
    </p>
  );
}

/** Send this month's match: pick a Lad (or any Lad, quickest), paste the link, send. */
export function SendReviewForm({ reviewers }: { reviewers: ReviewerOption[] }) {
  const id = useId();
  const [lad, setLad] = useState("any");
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(sendReview, {});
  const [errors, setErrors] = useState(state.errors);
  // New result from the server: show its errors (adjusting state while rendering, no effect needed).
  const [shown, setShown] = useState(state);
  if (shown !== state) {
    setShown(state);
    setErrors(state.errors);
  }

  const options = [
    { slug: "any", name: "Any Lad", initials: "", role: "Quickest", specialty: "Whoever is free first picks it up." },
    ...reviewers,
  ];
  const chosen = options.find((option) => option.slug === lad);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4">
          <span className="text-label block text-mint">Step 1</span>
          <span className="font-display text-xl font-extrabold uppercase">Choose a Lad</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {options.map((item) => {
            const selected = item.slug === lad;
            return (
              <label
                key={item.slug}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
                  selected ? "border-primary bg-primary/10" : "border-white/8 bg-surface hover:border-white/25",
                )}
              >
                <input
                  type="radio"
                  name="lad"
                  value={item.slug}
                  checked={selected}
                  onChange={() => setLad(item.slug)}
                  className="sr-only"
                />
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-highest font-display font-extrabold text-mint"
                  >
                    {item.initials || <Users className="size-5" />}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display font-extrabold">{item.name}</span>
                    <span className="truncate text-xs text-muted">{item.role}</span>
                  </span>
                  {selected && <CheckCircle2 aria-hidden className="ml-auto size-5 shrink-0 text-primary" />}
                </span>
                <span className="text-sm text-muted">{item.specialty}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4" aria-describedby={`${id}-how`}>
        <legend className="mb-4">
          <span className="text-label block text-mint">Step 2</span>
          <span className="font-display text-xl font-extrabold uppercase">Share your match</span>
        </legend>
        <MatchFields errors={errors} onEdit={() => setErrors((current) => ({ ...current, matchUrl: undefined }))} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <FormMessage message={state.message} />
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-display font-extrabold text-on-primary uppercase shadow-[0_0_24px_rgb(43_217_139/0.25)] transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          <Send aria-hidden className="size-5 shrink-0" />
          {pending ? "Sending…" : lad === "any" ? "Send my match" : `Send to ${chosen?.name}`}
        </button>
        <p id={`${id}-how`} className="text-center text-xs text-muted">
          No booking needed. The Lad watches it when they&apos;re free and sends back a written review, often a video, and
          a 3-point plan. You can change the link or cancel until they start.
        </p>
      </div>
    </form>
  );
}

/** Change the link or note on an open request (before a Lad starts, or when they asked for a new link). */
export function EditMatchForm({
  requestId,
  matchUrl,
  focus,
  startOpen = false,
}: {
  requestId: string;
  matchUrl: string;
  focus: string;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(editReview, {});
  const [errors, setErrors] = useState(state.errors);
  const [shown, setShown] = useState(state);
  if (shown !== state) {
    setShown(state);
    setErrors(state.errors);
    if (state.ok) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label rounded-lg border border-white/10 px-4 py-2.5 text-primary transition-colors hover:border-primary/50"
      >
        Change link or note
      </button>
    );
  }
  return (
    <form action={formAction} noValidate className="flex w-full max-w-lg flex-col gap-4 text-left">
      <input type="hidden" name="request" value={requestId} />
      <MatchFields
        errors={errors}
        defaults={{ matchUrl, focus }}
        onEdit={() => setErrors((current) => ({ ...current, matchUrl: undefined }))}
      />
      <FormMessage message={state.message} />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="text-label rounded-lg bg-primary px-4 py-2.5 text-on-primary hover:brightness-110 disabled:opacity-70"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-label rounded-lg border border-white/10 px-4 py-2.5 text-muted hover:text-white"
        >
          Never mind
        </button>
      </div>
    </form>
  );
}
