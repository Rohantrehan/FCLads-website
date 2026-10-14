"use client";

import { useActionState, useState } from "react";
import { cancelReview, type ReviewFormState } from "@/app/(site)/dashboard/review/actions";

/** Two-step cancel: the first click asks to confirm, so nobody cancels by accident. */
export function CancelReview({ bookingId }: { bookingId: string }) {
  const [asking, setAsking] = useState(false);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(cancelReview, {});

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="text-label rounded-lg border border-white/10 px-4 py-2.5 text-muted transition-colors hover:border-danger/50 hover:text-danger-soft"
      >
        Cancel or move session
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <input type="hidden" name="booking" value={bookingId} />
      <p className="text-sm">Cancel this session? You can book a new time straight after.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="text-label rounded-lg bg-danger px-4 py-2.5 text-white transition-colors hover:brightness-110 disabled:opacity-70"
        >
          {pending ? "Cancelling…" : "Yes, cancel it"}
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="text-label rounded-lg border border-white/10 px-4 py-2.5 text-primary hover:border-primary/50"
        >
          Keep my session
        </button>
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-danger-soft">
          {state.message}
        </p>
      )}
    </form>
  );
}
