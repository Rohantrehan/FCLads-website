"use client";

import { useActionState, useId, useState } from "react";
import { ArrowUpRight, CheckCircle2, Link2, Play, Undo2, Unlink } from "lucide-react";
import { reviewStep, sendReview, type CreatorFormState } from "@/app/(site)/creator/actions";
import { cn } from "@/lib/cn";

export interface ReviewCardView {
  id: string;
  memberName: string;
  /** "Sent 14 Oct" */
  sent: string;
  /** Asked for this Lad, or for any Lad. */
  forAnyLad: boolean;
  status: "waiting" | "in_review";
  matchUrl: string;
  focus: string;
  /** The Lad the member asked for, when it isn't you (posting board). */
  askedFor?: string;
  /** Who's reviewing it, when it isn't you (posting board): you can take it over. */
  reviewer?: string;
}

const input =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary/60 focus:outline-none";

function Feedback({ state }: { state: CreatorFormState }) {
  if (!state.message && !state.ok) return null;
  return (
    <p role={state.message ? "alert" : "status"} className={cn("text-sm", state.message ? "text-danger-soft" : "text-mint")}>
      {state.message ?? state.ok}
    </p>
  );
}

/** One member's match: pick it up (or take it over), then send the review, or ask for a new link. */
export function ReviewCard({ review, creator }: { review: ReviewCardView; creator?: string }) {
  const id = useId();
  const [askingLink, setAskingLink] = useState(false);
  const [stepState, stepAction, stepPending] = useActionState<CreatorFormState, FormData>(reviewStep, {});
  const [sendState, sendAction, sendPending] = useActionState<CreatorFormState, FormData>(sendReview, {});
  const hidden = (step?: string) => (
    <>
      <input type="hidden" name="request" value={review.id} />
      {creator && <input type="hidden" name="creator" value={creator} />}
      {step && <input type="hidden" name="step" value={step} />}
    </>
  );
  // In progress with someone else: you can see it and take it over, but not send it.
  const takenByOther = review.status === "in_review" && Boolean(review.reviewer);
  const reviewing = review.status === "in_review" && !takenByOther;
  const badge = reviewing
    ? "You're reviewing"
    : takenByOther
      ? `${review.reviewer} is reviewing`
      : review.forAnyLad
        ? "Any Lad"
        : review.askedFor
          ? `Asked for ${review.askedFor}`
          : "Asked for you";

  return (
    <article
      aria-labelledby={`${id}-name`}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5",
        reviewing ? "border-primary/40" : "border-white/8",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={`${id}-name`} className="font-display text-lg font-extrabold">
            {review.memberName}
          </h3>
          <p className="tabular text-xs text-muted">{review.sent}</p>
        </div>
        <span
          className={cn(
            "tabular rounded-full px-3 py-1 text-[11px] font-bold uppercase",
            reviewing || takenByOther ? "bg-primary/15 text-mint" : review.forAnyLad ? "bg-azure/15 text-[#93c5fd]" : "bg-gold/10 text-gold",
          )}
        >
          {badge}
        </span>
      </header>

      <div className="flex flex-col gap-1 rounded-xl bg-surface p-4 text-sm">
        <a
          href={review.matchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-white"
        >
          <Link2 aria-hidden className="size-4" />
          Watch their match
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
        <p className="text-muted">{review.focus ? <>&ldquo;{review.focus}&rdquo;</> : "No note added."}</p>
      </div>

      {reviewing && !askingLink && (
        <form action={sendAction} className="flex flex-col gap-3 rounded-xl border border-primary/30 p-4">
          {hidden()}
          <p className="font-display font-extrabold uppercase">Send the review</p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>
              Short title <span className="font-normal text-muted">(optional, e.g. &ldquo;Champs prep&rdquo;)</span>
            </span>
            <input name="title" maxLength={80} className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>
              Video review <span className="font-normal text-muted">(link, optional: Loom, unlisted YouTube…)</span>
            </span>
            <input name="recordingUrl" type="url" placeholder="https://www.loom.com/share/…" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>
              Written review <span className="font-normal text-muted">(what you saw, moment by moment)</span>
            </span>
            <textarea name="notes" rows={6} maxLength={4000} className={cn(input, "resize-y leading-relaxed")} />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-semibold">3-point plan (at least one)</legend>
            {[1, 2, 3].map((point) => (
              <input
                key={point}
                name="plan"
                maxLength={300}
                placeholder={`Point ${point}`}
                aria-label={`Plan point ${point}`}
                className={input}
              />
            ))}
          </fieldset>
          <button
            type="submit"
            disabled={sendPending}
            className="text-label flex w-fit items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-on-primary disabled:opacity-60"
          >
            <CheckCircle2 aria-hidden className="size-4" />
            {sendPending ? "Sending…" : "Send review"}
          </button>
          <Feedback state={sendState} />
        </form>
      )}

      {askingLink ? (
        <form action={stepAction} className="flex flex-col gap-3 rounded-xl border border-gold/40 p-4">
          {hidden("new_link")}
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            What&apos;s wrong with the link?
            <input
              name="note"
              required
              maxLength={300}
              placeholder="e.g. The video is private. Set it to unlisted."
              className={input}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={stepPending}
              className="text-label rounded-xl bg-gold px-4 py-2.5 text-canvas disabled:opacity-60"
            >
              {stepPending ? "Sending…" : "Ask for a new link"}
            </button>
            <button
              type="button"
              onClick={() => setAskingLink(false)}
              className="text-label rounded-xl border border-white/10 px-4 py-2.5 text-muted hover:text-white"
            >
              Back
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          {!reviewing && (
            <form action={stepAction}>
              {hidden("start")}
              <button
                type="submit"
                disabled={stepPending}
                className="text-label flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-on-primary disabled:opacity-60"
              >
                <Play aria-hidden className="size-4" />
                {stepPending ? "Starting…" : takenByOther ? "Take over" : "Start review"}
              </button>
            </form>
          )}
          {review.status === "in_review" && (
            <form action={stepAction}>
              {hidden("release")}
              <button
                type="submit"
                disabled={stepPending}
                className="text-label flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-muted hover:text-white disabled:opacity-60"
              >
                <Undo2 aria-hidden className="size-4" />
                Put back in the queue
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => setAskingLink(true)}
            className="text-label flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-muted hover:border-gold/50 hover:text-gold"
          >
            <Unlink aria-hidden className="size-4" />
            Link doesn&apos;t work
          </button>
        </div>
      )}
      <Feedback state={stepState} />
    </article>
  );
}
