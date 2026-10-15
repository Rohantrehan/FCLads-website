// Checks the gameplay review rules (table review_requests + its functions) through the real Supabase
// API with the QA accounts in web/.env.local (free, member, creator linked to "stefan", admin).
// Runs the whole flow: send → edit → start → ask for a new link → fix → send review. No browser needed.
// Run from web/: node scripts/security-checks/reviews.mjs
// Uses SUPABASE_SECRET_KEY only to clear the QA member's requests before and after.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const make = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
const signIn = async (email, password) => {
  const client = make();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, id: data.user.id };
};
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const member = await signIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD);
const clear = () => db.from("review_requests").delete().eq("member_id", member.id);
await clear();

try {
  const anon = make();
  let r = await anon.from("review_requests").select("id").limit(1);
  check("visitor can't read reviews", !!r.error || !r.data?.length, r.error?.code ?? `${r.data?.length} rows`);
  r = await anon.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/x", p_focus: "" });
  check("visitor can't send a match", !!r.error);

  const free = await signIn(env.QA_FREE_EMAIL, env.QA_FREE_PASSWORD);
  r = await free.client.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/x", p_focus: "" });
  check("free user can't send a match", r.error?.message === "not_member", r.error?.message);

  // ---- Member sends
  r = await member.client.rpc("submit_review", { p_creator_slug: "stefan", p_match_url: "http://insecure", p_focus: "" });
  check("non-https link refused", r.error?.message === "bad_match_url", r.error?.message);
  r = await member.client.rpc("submit_review", { p_creator_slug: "tfv-gaming", p_match_url: "https://youtu.be/x", p_focus: "" });
  check("can't ask a Lad who doesn't take reviews", r.error?.message === "bad_creator", r.error?.message);
  r = await member.client.rpc("submit_review", { p_creator_slug: "stefan", p_match_url: "https://youtu.be/qa-1", p_focus: "QA check" });
  check("member sends a match", !r.error && !!r.data, r.error?.message);
  const id = r.data;
  r = await member.client.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/qa-2", p_focus: "" });
  check("only one open request at a time", r.error?.message === "already_open", r.error?.message);
  r = await member.client.rpc("edit_review", { p_id: id, p_match_url: "https://youtu.be/qa-1b", p_focus: "QA edited" });
  check("member can change the link before it starts", !r.error, r.error?.message);
  r = await member.client.from("review_requests").update({ status: "done" }).eq("id", id).select();
  check("member can't write the table directly", !!r.error || !r.data?.length, r.error?.code);

  // ---- Other people
  r = await free.client.from("review_requests").select("id").eq("id", id);
  check("another account can't see it", !r.error && r.data.length === 0);
  const creator = await signIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD);
  r = await creator.client.from("review_requests").select("id, match_url").eq("id", id);
  check("the asked-for creator sees it", r.data?.length === 1 && r.data[0].match_url === "https://youtu.be/qa-1b");
  r = await member.client.rpc("start_review", { p_id: id });
  check("member can't start a review", !!r.error, r.error?.message);
  r = await free.client.rpc("complete_review", { p_id: id, p_title: "", p_notes: "x", p_recording_url: "", p_plan: ["x"] });
  check("free user can't send a review", !!r.error, r.error?.message);

  // ---- Creator flow
  r = await creator.client.rpc("start_review", { p_id: id });
  check("creator starts it", !r.error, r.error?.message);
  r = await member.client.rpc("edit_review", { p_id: id, p_match_url: "https://youtu.be/late", p_focus: "" });
  check("member can't change it once started", r.error?.message === "already_started", r.error?.message);
  r = await member.client.rpc("withdraw_review", { p_id: id });
  check("member can't cancel once started", r.error?.message === "already_started", r.error?.message);
  r = await creator.client.rpc("ask_for_new_link", { p_id: id, p_note: "" });
  check("asking for a new link needs a note", r.error?.message === "note_required", r.error?.message);
  r = await creator.client.rpc("ask_for_new_link", { p_id: id, p_note: "QA: private video" });
  check("creator asks for a new link", !r.error, r.error?.message);
  r = await member.client.rpc("edit_review", { p_id: id, p_match_url: "https://youtu.be/qa-fixed", p_focus: "" });
  check("member fixes the link", !r.error, r.error?.message);
  r = await member.client.from("review_requests").select("status, creator_slug").eq("id", id).single();
  check("back to waiting, still with Stefan", r.data?.status === "waiting" && r.data?.creator_slug === "stefan", JSON.stringify(r.data));
  r = await creator.client.rpc("complete_review", { p_id: id, p_title: "", p_notes: "x", p_recording_url: "", p_plan: [] });
  check("review needs a plan", r.error?.message === "plan_required", r.error?.message);
  r = await creator.client.rpc("complete_review", { p_id: id, p_title: "", p_notes: "x", p_recording_url: "http://x", p_plan: ["a"] });
  check("video link must be https", r.error?.message === "bad_recording_url", r.error?.message);
  r = await creator.client.rpc("complete_review", {
    p_id: id,
    p_title: "QA",
    p_notes: "QA written review",
    p_recording_url: "https://www.loom.com/share/qa",
    p_plan: ["one", " ", "two"],
  });
  check("creator sends the review", !r.error, r.error?.message);
  r = await member.client.from("review_requests").select("status, notes, plan, recording_url").eq("id", id).single();
  check("member sees review, video and plan (blank points dropped)", r.data?.status === "done" && r.data.plan.length === 2 && !!r.data.recording_url, JSON.stringify(r.data?.plan));
  r = await creator.client.rpc("start_review", { p_id: id });
  check("a finished review can't be reopened", r.error?.message === "not_available", r.error?.message);

  // ---- Monthly limit
  r = await member.client.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/qa-3", p_focus: "" });
  check("one review a month", r.error?.message === "month_used", r.error?.message);

  // ---- Any Lad + cancel
  await clear();
  r = await member.client.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/qa-any", p_focus: "" });
  const anyId = r.data;
  r = await creator.client.from("review_requests").select("id").eq("id", anyId);
  check("any-Lad request shows to every creator", r.data?.length === 1);
  r = await member.client.rpc("withdraw_review", { p_id: anyId });
  check("member can cancel before it starts", !r.error, r.error?.message);
  r = await member.client.rpc("submit_review", { p_creator_slug: null, p_match_url: "https://youtu.be/qa-again", p_focus: "" });
  check("cancelling gives the month's review back", !r.error, r.error?.message);
} catch (error) {
  check("script ran without errors", false, error.message);
}
await clear();
console.log(results.join("\n"));
