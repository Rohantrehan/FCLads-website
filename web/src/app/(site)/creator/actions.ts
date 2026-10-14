"use server";

import { revalidatePath } from "next/cache";
import { reviewErrorMessage } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { canRunReviews, getViewer } from "@/lib/viewer";

// Creator hub actions. The database functions check the caller is the creator (or an admin).

export interface CreatorFormState {
  message?: string;
  ok?: string;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

async function creatorClient() {
  const viewer = await getViewer();
  if (!viewer.id || !canRunReviews(viewer)) throw new Error(reviewErrorMessage("not_creator"));
  return createClient();
}

/** Admins act for the creator chosen on the page; creators always act for themselves. */
const actingFor = (data: FormData) => text(data, "creator") || null;

export async function addSlots(_prev: CreatorFormState, data: FormData): Promise<CreatorFormState> {
  const day = text(data, "day");
  const times = data.getAll("times").map(String).filter((time) => TIME.test(time));
  if (!DAY.test(day)) return { message: "Pick a day." };
  if (times.length === 0) return { message: reviewErrorMessage("bad_times") };

  const supabase = await creatorClient();
  const { data: added, error } = await supabase.rpc("add_review_slots", {
    p_day: day,
    p_times: times,
    p_creator_slug: actingFor(data),
  });
  if (error) return { message: reviewErrorMessage(error.message) };

  revalidatePath("/creator");
  const count = Number(added ?? 0);
  return {
    ok:
      count === 0
        ? "Nothing new added: those times were already free or have passed."
        : `Added ${count} free ${count === 1 ? "time" : "times"}.`,
  };
}

export async function removeSlot(data: FormData) {
  const supabase = await creatorClient();
  const { error } = await supabase.rpc("remove_review_slot", { p_slot_id: text(data, "slot") });
  if (error) throw new Error(reviewErrorMessage(error.message));
  revalidatePath("/creator");
}

/** Saves the call link, or closes a session as done (recording + plan) or missed. */
export async function updateSession(_prev: CreatorFormState, data: FormData): Promise<CreatorFormState> {
  const status = text(data, "status");
  if (!["booked", "completed", "missed"].includes(status)) return { message: "Something went wrong. Please try again." };
  const plan = data.getAll("plan").map(String);

  const supabase = await creatorClient();
  const { error } = await supabase.rpc("update_review", {
    p_booking_id: text(data, "booking"),
    p_status: status,
    p_meeting_url: data.has("meetingUrl") ? text(data, "meetingUrl") : null,
    p_recording_url: data.has("recordingUrl") ? text(data, "recordingUrl") : null,
    p_title: data.has("title") ? text(data, "title") : null,
    p_plan: status === "completed" ? plan : null,
  });
  if (error) return { message: reviewErrorMessage(error.message) };

  revalidatePath("/creator");
  return { ok: status === "completed" ? "Saved. The member can see their plan now." : status === "missed" ? "Marked as missed." : "Saved." };
}
