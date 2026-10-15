// Checks the content tables' row-level security through the real Supabase API, with the public key
// and the QA accounts in web/.env.local (member, creator linked to "stefan", admin). No browser needed.
// Run from web/: node scripts/security-checks/content.mjs
// Adds one draft trading post as the QA creator and deletes it again.
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
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
};
const tinyImage = () => new Blob(["x"], { type: "image/webp" });

try {
  // ---- Visitors: no access at all
  const anon = make();
  for (const table of ["guides", "trading_posts", "feed_posts", "collections", "creators", "site_settings"]) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    check(`visitor can't read ${table}`, !!error || !data?.length, error?.code ?? `${data?.length} rows`);
  }
  const anonUpload = await anon.storage.from("media").upload(`trading/qa-${Date.now()}.webp`, tinyImage(), { contentType: "image/webp" });
  check("visitor can't upload images", !!anonUpload.error);
  const listed = await anon.storage.from("media").list("trading");
  check("nobody can list uploaded images", !listed.data?.length, listed.error?.message ?? `${listed.data?.length} files`);

  // ---- Members: still nothing (the website decides what they see, on the server)
  const member = await signIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD);
  for (const table of ["guides", "trading_posts", "collections", "creators"]) {
    const { data, error } = await member.from(table).select("*").limit(5);
    check(`member can't read ${table}`, !!error || !data?.length, error?.code ?? `${data?.length} rows`);
  }
  let r = await member.from("trading_posts").insert({ author_slug: "wessam", title: "QA bad" }).select();
  check("member can't post", !!r.error, r.error?.code);
  r = await member.rpc("list_team");
  check("member can't list the team", !!r.error);
  r = await member.rpc("set_team_role", { p_email: env.QA_MEMBER_EMAIL, p_role: "admin", p_creator_slug: null });
  check("member can't make themselves admin", !!r.error);
  const memberUpload = await member.storage.from("media").upload(`trading/qa-${Date.now()}.webp`, tinyImage(), { contentType: "image/webp" });
  check("member can't upload images", !!memberUpload.error);

  // ---- Creators: their own posts only
  const creator = await signIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD);
  r = await creator.from("guides").select("author_slug");
  check("creator only sees own guides", !r.error && r.data.length > 0 && r.data.every((g) => g.author_slug === "stefan"), `${r.data?.length} rows`);
  r = await creator.from("trading_posts").insert({ author_slug: "wessam", title: "QA bad" }).select();
  check("creator can't post as another creator", !!r.error, r.error?.code);
  r = await creator.from("trading_posts").update({ title: "QA hacked" }).eq("author_slug", "wessam").select();
  check("creator can't edit another creator's post", !r.error && r.data.length === 0);
  r = await creator.from("trading_posts").update({ author_slug: "wessam" }).eq("author_slug", "stefan").select();
  check("creator can't hand a post to someone else", !!r.error, r.error?.code);
  r = await creator.from("creators").update({ name: "QA" }).eq("slug", "stefan").select();
  check("creator can't edit creator profiles", !r.error && r.data.length === 0);
  r = await creator.from("site_settings").update({ current_patch: "QA" }).eq("id", 1).select();
  check("creator can't edit site settings", !r.error && r.data.length === 0);
  r = await creator.from("collections").insert({ slug: "qa-bad", title: "QA" }).select();
  check("creator can't add collections", !!r.error);
  r = await creator.rpc("set_team_role", { p_email: env.QA_MEMBER_EMAIL, p_role: "admin", p_creator_slug: null });
  check("creator can't change roles", !!r.error);
  r = await creator.from("trading_posts").insert({ author_slug: "stefan", title: "QA security check post", status: "draft" }).select("id").single();
  check("creator can add their own post", !r.error, r.error?.message);
  if (r.data) {
    const removed = await creator.from("trading_posts").delete().eq("id", r.data.id).select();
    check("creator can delete their own post", !removed.error && removed.data.length === 1);
  }

  // ---- Admins: everything, except changing their own role
  const admin = await signIn(env.QA_ADMIN_EMAIL, env.QA_ADMIN_PASSWORD);
  const [{ count: all }, mine] = await Promise.all([
    admin.from("guides").select("id", { count: "exact", head: true }),
    creator.from("guides").select("id", { count: "exact", head: true }),
  ]);
  check("admin sees more guides than a creator", (all ?? 0) > (mine.count ?? 0), `${all} vs ${mine.count}`);
  r = await admin.rpc("list_team");
  check("admin lists the team", !r.error && r.data.length >= 2, r.error?.message ?? `${r.data?.length}`);
  r = await admin.rpc("set_team_role", { p_email: env.QA_ADMIN_EMAIL, p_role: "member", p_creator_slug: null });
  check("admin can't change their own role", r.error?.message === "own_role", r.error?.message);
} catch (error) {
  check("script ran without errors", false, error.message);
}
console.log(results.join("\n"));
