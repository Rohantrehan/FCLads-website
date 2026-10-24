// Checks the content tables' row-level security through the real Supabase API, with the public key
// and the QA accounts in web/.env.local (member, creator linked to "stefan", admin). No browser needed.
// Run from web/: node scripts/security-checks/content.mjs
// Adds a draft trading post and a collection as the QA creator and deletes them again.
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

  // ---- Creators: the same board access as admins (is_admin() covers creators). Every write here puts
  // back what was there, or is refused before it changes anything.
  const creator = await signIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD);
  const admin = await signIn(env.QA_ADMIN_EMAIL, env.QA_ADMIN_PASSWORD);
  const [{ count: all }, mine] = await Promise.all([
    admin.from("guides").select("id", { count: "exact", head: true }),
    creator.from("guides").select("id", { count: "exact", head: true }),
  ]);
  check("creator sees every guide, like an admin", (all ?? 0) > 0 && mine.count === all, `${mine.count} vs ${all}`);
  r = await creator.from("trading_posts").insert({ author_slug: "wessam", title: "QA security check post", status: "draft" }).select("id").single();
  check("creator can post for another creator", !r.error, r.error?.message);
  if (r.data) {
    const removed = await creator.from("trading_posts").delete().eq("id", r.data.id).select();
    check("creator can delete any post", !removed.error && removed.data.length === 1);
  }
  const { data: profile } = await creator.from("creators").select("name").eq("slug", "stefan").single();
  r = await creator.from("creators").update({ name: profile?.name }).eq("slug", "stefan").select();
  check("creator can edit creator profiles", !r.error && r.data.length === 1, r.error?.message);
  const { data: settings } = await creator.from("site_settings").select("current_patch").eq("id", 1).single();
  r = await creator.from("site_settings").update({ current_patch: settings?.current_patch }).eq("id", 1).select();
  check("creator can edit site settings", !r.error && r.data.length === 1, r.error?.message);
  r = await creator.from("collections").insert({ slug: `qa-sec-${Date.now()}`, title: "QA" }).select("id").single();
  check("creator can add collections", !r.error, r.error?.message);
  if (r.data) await creator.from("collections").delete().eq("id", r.data.id);
  // A same-name rename and an unknown role get past the permission check and stop before changing anything.
  r = await creator.rpc("rename_game", { p_from: "FC 27", p_to: "FC 27" });
  check("creator may rename the game", r.error?.message === "bad_name", r.error?.message);
  r = await creator.rpc("list_team");
  check("creator lists the team", !r.error && r.data.length >= 2, r.error?.message ?? `${r.data?.length}`);
  r = await creator.rpc("set_team_role", { p_email: env.QA_MEMBER_EMAIL, p_role: "owner", p_creator_slug: null });
  check("creator may set roles", r.error?.message === "bad_role", r.error?.message);
  r = await creator.rpc("set_team_role", { p_email: env.QA_CREATOR_EMAIL, p_role: "member", p_creator_slug: null });
  check("creator can't change their own role", r.error?.message === "own_role", r.error?.message);

  // ---- Admins: everything, except changing their own role
  r = await admin.rpc("list_team");
  check("admin lists the team", !r.error && r.data.length >= 2, r.error?.message ?? `${r.data?.length}`);
  r = await admin.rpc("set_team_role", { p_email: env.QA_ADMIN_EMAIL, p_role: "member", p_creator_slug: null });
  check("admin can't change their own role", r.error?.message === "own_role", r.error?.message);
} catch (error) {
  check("script ran without errors", false, error.message);
}
console.log(results.join("\n"));
