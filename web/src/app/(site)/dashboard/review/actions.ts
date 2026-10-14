"use server";

import { revalidatePath } from "next/cache";
import { reviewErrorMessage } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export interface ReviewFormState {
  errors?: Partial<Record<"slot" | "matchUrl" | "focus", string>>;
  message?: string;
  ok?: boolean;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const HTTPS_URL = /^https:\/\/\S+$/;

/** Books the chosen slot. The database checks membership, the monthly limit and that the slot is free. */
export async function bookReview(_prev: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer.id) return { message: reviewErrorMessage("not_signed_in") };

  const slotId = text(data, "slot");
  const matchUrl = text(data, "matchUrl");
  const focus = text(data, "focus");
  const errors = {
    slot: slotId ? undefined : "Pick a day and a time.",
    matchUrl: HTTPS_URL.test(matchUrl) && matchUrl.length <= 500 ? undefined : reviewErrorMessage("bad_match_url"),
    focus: focus.length <= 500 ? undefined : reviewErrorMessage("focus_too_long"),
  };
  if (Object.values(errors).some(Boolean)) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("book_review", { p_slot_id: slotId, p_match_url: matchUrl, p_focus: focus });
  if (error) return { message: reviewErrorMessage(error.message) };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Cancels the member's upcoming session (up to 12 hours before), giving the month's review back. */
export async function cancelReview(_prev: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer.id) return { message: reviewErrorMessage("not_signed_in") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_review", { p_booking_id: text(data, "booking") });
  if (error) return { message: reviewErrorMessage(error.message) };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
