"use server";

import { revalidatePath } from "next/cache";
import { reviewErrorMessage } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export interface ReviewFormState {
  errors?: Partial<Record<"matchUrl" | "focus", string>>;
  message?: string;
  ok?: boolean;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const HTTPS_URL = /^https:\/\/\S+$/;

function checkFields(data: FormData) {
  const matchUrl = text(data, "matchUrl");
  const focus = text(data, "focus");
  const errors = {
    matchUrl: HTTPS_URL.test(matchUrl) && matchUrl.length <= 500 ? undefined : reviewErrorMessage("bad_match_url"),
    focus: focus.length <= 500 ? undefined : reviewErrorMessage("focus_too_long"),
  };
  return { matchUrl, focus, errors: Object.values(errors).some(Boolean) ? errors : undefined };
}

/** Sends the match for this month's review. The database checks membership, the monthly limit and the Lad. */
export async function sendReview(_prev: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer.id) return { message: reviewErrorMessage("not_signed_in") };
  const { matchUrl, focus, errors } = checkFields(data);
  if (errors) return { errors };

  const lad = text(data, "lad");
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_creator_slug: lad && lad !== "any" ? lad : null,
    p_match_url: matchUrl,
    p_focus: focus,
  });
  if (error) return { message: reviewErrorMessage(error.message) };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Changes the link or note before a Lad starts (or after they asked for a new link). */
export async function editReview(_prev: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer.id) return { message: reviewErrorMessage("not_signed_in") };
  const { matchUrl, focus, errors } = checkFields(data);
  if (errors) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("edit_review", { p_id: text(data, "request"), p_match_url: matchUrl, p_focus: focus });
  if (error) return { message: reviewErrorMessage(error.message) };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Cancels before a Lad starts, giving the month's review back. */
export async function cancelReview(_prev: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer.id) return { message: reviewErrorMessage("not_signed_in") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_review", { p_id: text(data, "request") });
  if (error) return { message: reviewErrorMessage(error.message) };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
