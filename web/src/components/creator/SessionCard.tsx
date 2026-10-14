"use client";

import { useActionState, useId, useState } from "react";
import { ArrowUpRight, CheckCircle2, Link2, Video, XCircle } from "lucide-react";
import { updateSession, type CreatorFormState } from "@/app/(site)/creator/actions";
import { cn } from "@/lib/cn";

export interface SessionView {
  id: string;
  memberName: string;
  /** "Tuesday 20 October · 18:30" (UK time) */
  when: string;
  started: boolean;
  matchUrl: string;
  focus: string;
  meetingUrl?: string;
}

const input =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary/60 focus:outline-none";

/** One booked session on the Creator hub: call link before, then "done" (recording + plan) or "missed". */
export function SessionCard({ session }: { session: SessionView }) {
  const id = useId();
  const [closing, setClosing] = useState(false);
  const [state, formAction, pending] = useActionState<CreatorFormState, FormData>(updateSession, {});
  const hidden = (status: string) => (
    <>
      <input type="hidden" name="booking" value={session.id} />
      <input type="hidden" name="status" value={status} />
    </>
  );

  return (
    <article
      aria-labelledby={`${id}-name`}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5",
        session.started ? "border-gold/40" : "border-white/8",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={`${id}-name`} className="font-display text-lg font-extrabold">
            {session.memberName}
          </h3>
          <p className="tabular text-xs text-muted">{session.when} · UK time</p>
        </div>
        {session.started && (
          <span className="tabular rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold uppercase">
            Started: close it below
          </span>
        )}
      </header>

      <div className="flex flex-col gap-1 rounded-xl bg-surface p-4 text-sm">
        <a
          href={session.matchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-white"
        >
          <Link2 aria-hidden className="size-4" />
          Their match
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
        <p className="text-muted">{session.focus ? <>&ldquo;{session.focus}&rdquo;</> : "No note added."}</p>
      </div>

      {!closing && (
        <form action={formAction} className="flex flex-col gap-2">
          {hidden("booked")}
          <label htmlFor={`${id}-meeting`} className="flex items-center gap-1.5 text-sm font-semibold">
            <Video aria-hidden className="size-4 text-primary" />
            Call link <span className="font-normal text-muted">(the member sees it on their review page)</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-meeting`}
              name="meetingUrl"
              type="url"
              defaultValue={session.meetingUrl}
              placeholder="https://discord.gg/… or https://meet.google.com/…"
              className={input}
            />
            <button
              type="submit"
              disabled={pending}
              className="text-label shrink-0 rounded-xl border border-primary/40 px-4 py-2.5 text-primary hover:bg-primary/10 disabled:opacity-60"
            >
              Save link
            </button>
          </div>
        </form>
      )}

      {session.started &&
        (closing ? (
          <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-primary/30 p-4">
            {hidden("completed")}
            <p className="font-display font-extrabold uppercase">Send the plan</p>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>
                Short title <span className="font-normal text-muted">(optional, e.g. &ldquo;Champs prep&rdquo;)</span>
              </span>
              <input name="title" maxLength={80} className={input} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>
                Recording link <span className="font-normal text-muted">(optional)</span>
              </span>
              <input name="recordingUrl" type="url" placeholder="https://www.loom.com/share/…" className={input} />
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
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={pending}
                className="text-label flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-on-primary disabled:opacity-60"
              >
                <CheckCircle2 aria-hidden className="size-4" />
                {pending ? "Saving…" : "Mark done and send"}
              </button>
              <button
                type="button"
                onClick={() => setClosing(false)}
                className="text-label rounded-xl border border-white/10 px-4 py-2.5 text-muted hover:text-white"
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setClosing(true)}
              className="text-label flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-on-primary"
            >
              <CheckCircle2 aria-hidden className="size-4" />
              Session done: add plan
            </button>
            <form action={formAction}>
              {hidden("missed")}
              <button
                type="submit"
                disabled={pending}
                className="text-label flex items-center gap-1.5 rounded-xl border border-danger/40 px-4 py-2.5 text-danger-soft hover:bg-danger/10 disabled:opacity-60"
              >
                <XCircle aria-hidden className="size-4" />
                They didn&apos;t show up
              </button>
            </form>
          </div>
        ))}

      {(state.message || state.ok) && (
        <p
          role={state.message ? "alert" : "status"}
          className={cn("text-sm", state.message ? "text-danger-soft" : "text-mint")}
        >
          {state.message ?? state.ok}
        </p>
      )}
    </article>
  );
}
