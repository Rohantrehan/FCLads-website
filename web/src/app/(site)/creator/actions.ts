"use server";

import { revalidatePath } from "next/cache";
import { notifyNewLinkNeeded, notifyReviewReady } from "@/lib/email/notify";
import { reviewErrorMessage } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { canRunReviews, getViewer } from "@/lib/viewer";

// Gameplay review actions, used by the Creator hub and the posting board's Reviews page. The database
// functions check the caller is a creator or admin; any Lad can handle any review, credited to them.

export interface CreatorFormState {
  message?: string;
  ok?: string;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

/** Admins act for the creator chosen on the page; creators always act for themselves. */
const actingFor = (data: FormData) => text(data, "creator") || null;

/** Runs one review function as the signed-in creator, then refreshes the hub. */
async function run(fn: string, args: Record<string, unknown>, ok: string, onDone?: () => void): Promise<CreatorFormState> {
  const viewer = await getViewer();
  if (!viewer.id || !canRunReviews(viewer)) return { message: reviewErrorMessage("not_creator") };
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { message: reviewErrorMessage(error.message) };
  onDone?.();
  revalidatePath("/creator");
  revalidatePath("/posting-board/reviews");
  return { ok };
}

/** One button on a review card: start, put back, or ask for a new link. */
export async function reviewStep(_prev: CreatorFormState, data: FormData): Promise<CreatorFormState> {
  const id = text(data, "request");
  const creator = actingFor(data);
  switch (text(data, "step")) {
    case "start":
      return run("start_review", { p_id: id, p_creator_slug: creator }, "It's yours. Send the review when you're done.");
    case "release":
      return run("release_review", { p_id: id, p_creator_slug: creator }, "Put back in the queue.");
    case "new_link":
      return run(
        "ask_for_new_link",
        { p_id: id, p_note: text(data, "note"), p_creator_slug: creator },
        "Sent back. It comes back to you when they add a new link.",
        () => notifyNewLinkNeeded(id),
      );
    default:
      return { message: reviewErrorMessage(undefined) };
  }
}

/** Sends the finished review: written notes and/or a video link, and a 1–3 point plan. */
export async function sendReview(_prev: CreatorFormState, data: FormData): Promise<CreatorFormState> {
  const plan = data.getAll("plan").map((item) => String(item).trim()).filter(Boolean);
  if (plan.length === 0) return { message: reviewErrorMessage("plan_required") };
  const recordingUrl = text(data, "recordingUrl");
  if (recordingUrl && !/^https:\/\/\S+$/.test(recordingUrl)) return { message: reviewErrorMessage("bad_recording_url") };
  const notes = text(data, "notes");
  if (!notes && !recordingUrl) return { message: "Write the review or add a video link (or both)." };

  const id = text(data, "request");
  return run(
    "complete_review",
    {
      p_id: id,
      p_title: text(data, "title"),
      p_notes: notes,
      p_recording_url: recordingUrl,
      p_plan: plan,
      p_creator_slug: actingFor(data),
    },
    "Sent. The member can see their review now.",
    () => notifyReviewReady(id),
  );
}
