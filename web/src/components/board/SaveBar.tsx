"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { CalendarClock, CheckCircle2, FileText, Send, Trash2 } from "lucide-react";
import { deleteItem, type DeletableKind, type SaveResult } from "@/lib/board/actions";
import type { PostStatus } from "@/lib/content/rows";
import { cn } from "@/lib/cn";

type Result = SaveResult & { message?: string };

/** What a delete button removes, and where to go afterwards. */
export interface RemoveTarget {
  kind: DeletableKind;
  id: string;
  after: string;
}

/** Saves an editor's state with a Server Action. A new post moves to its own edit address after the first save. */
export function useSaver<T>(action: (payload: T) => Promise<SaveResult>, editPath?: (id: string) => string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  // A new post opens again at its own address after the first save; ?saved=1 carries the message over.
  const [result, setResult] = useState<Result>(() => (searchParams.get("saved") ? { ok: true, message: "Saved." } : {}));

  useEffect(() => {
    if (searchParams.get("saved")) window.history.replaceState(null, "", pathname);
  }, [pathname, searchParams]);

  /** `onSaved` runs only when the save worked, e.g. to show the new status. */
  function save(payload: T, onSaved?: () => void, message = "Saved.") {
    startTransition(async () => {
      const outcome = await action(payload);
      setResult({ ...outcome, message: outcome.ok ? message : undefined });
      if (!outcome.ok) return;
      onSaved?.();
      const target = outcome.id && editPath ? editPath(outcome.id) : undefined;
      if (target && target !== pathname) router.replace(`${target}?saved=1`, { scroll: false });
      else router.refresh();
    });
  }
  return { save, pending, result };
}

export function ResultMessage({ result }: { result: Result }) {
  if (!result.error && !result.message) return null;
  return (
    <p role={result.error ? "alert" : "status"} className={cn("text-sm", result.error ? "text-danger-soft" : "text-mint")}>
      {result.error ?? result.message}
    </p>
  );
}

/** "Delete" → "Delete for good? Yes / Keep it". No browser dialogs. */
function DeleteControl({ target }: { target: RemoveTarget }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="ml-auto flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Delete for good?</span>
          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              startDelete(async () => {
                const outcome = await deleteItem(target.kind, target.id);
                if (!outcome.ok) return setError(outcome.error);
                router.push(target.after);
                router.refresh();
              })
            }
            className="text-label rounded-lg bg-danger/20 px-3 py-1.5 text-danger-soft hover:bg-danger/30"
          >
            {deleting ? "Deleting…" : "Yes, delete it"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-label px-2 py-1.5 text-muted hover:text-on-surface">
            Keep it
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-label flex items-center gap-1.5 text-muted hover:text-danger-soft"
        >
          <Trash2 aria-hidden className="size-4" />
          Delete
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger-soft">
          {error}
        </p>
      )}
    </div>
  );
}

function Bar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-white/10 bg-canvas/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-5">
      {children}
    </div>
  );
}

const primaryButton =
  "text-label flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-on-primary hover:brightness-110 disabled:opacity-60";

/**
 * Bottom bar of a post editor: save as draft, publish (or schedule, when the date is in the future), delete.
 * `now` comes from the server so the label is the same before and after loading.
 */
export function SaveBar({
  status,
  date,
  now,
  pending,
  result,
  onSave,
  remove,
}: {
  status: PostStatus;
  /** The post's date. Leave out for things without one (collections). */
  date?: string;
  now: number;
  pending: boolean;
  result: Result;
  onSave: (status: PostStatus) => void;
  /** Shown for saved posts. */
  remove?: RemoveTarget;
}) {
  const scheduled = date !== undefined && new Date(date).getTime() > now;
  const state =
    status === "draft"
      ? { label: "Draft", detail: "Only you and the admins can see it.", icon: FileText, tone: "text-muted" }
      : scheduled
        ? { label: "Scheduled", detail: "Goes live at its date and time.", icon: CalendarClock, tone: "text-gold" }
        : { label: "Live", detail: "Everyone it's meant for can see it.", icon: CheckCircle2, tone: "text-mint" };
  const publishLabel = status === "published" ? "Save changes" : scheduled ? "Schedule" : "Publish";

  return (
    <Bar>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm" data-board-status={state.label}>
          <state.icon aria-hidden className={cn("size-4", state.tone)} />
          <span className={cn("font-bold", state.tone)}>{state.label}</span>
          <span className="hidden text-muted sm:inline">· {state.detail}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => onSave("draft")}
            className="text-label rounded-xl border border-white/15 px-4 py-2.5 text-on-surface hover:border-white/30 disabled:opacity-60"
          >
            {status === "published" ? "Unpublish" : "Save draft"}
          </button>
          <button type="button" disabled={pending} onClick={() => onSave("published")} className={primaryButton}>
            <Send aria-hidden className="size-4" />
            {pending ? "Saving…" : publishLabel}
          </button>
        </div>
      </div>
      {(remove || result.error || result.message) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ResultMessage result={result} />
          {remove && <DeleteControl target={remove} />}
        </div>
      )}
    </Bar>
  );
}

/** Bottom bar for things without draft / publish (creators, settings). */
export function SaveOnlyBar({
  pending,
  result,
  onSave,
  label = "Save",
  remove,
}: {
  pending: boolean;
  result: Result;
  onSave: () => void;
  label?: string;
  remove?: RemoveTarget;
}) {
  return (
    <Bar>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={pending} onClick={onSave} className={primaryButton}>
          <Send aria-hidden className="size-4" />
          {pending ? "Saving…" : label}
        </button>
        <ResultMessage result={result} />
        {remove && <DeleteControl target={remove} />}
      </div>
    </Bar>
  );
}
