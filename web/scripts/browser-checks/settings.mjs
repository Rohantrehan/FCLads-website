// Drives headless Edge via CDP through the board's Site settings with the QA admin in web/.env.local:
// change the site colour (preview, save, whole site follows), then rename "FC 27" → "FC 28" everywhere
// and back. Puts everything back as it was. Needs BOARD_PATH and SUPABASE_SECRET_KEY.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const OUT = resolve(process.argv[2] ?? ".checks");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}/cdpprof`, "--window-size=1440,900", "about:blank"]);
let targets;
for (let i = 0; i < 120; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(250); }
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.QA_ADMIN_EMAIL || !env.BOARD_PATH || !env.SUPABASE_SECRET_KEY) {
  console.log("FAIL  QA_ADMIN_*, BOARD_PATH or SUPABASE_SECRET_KEY missing from .env.local"); edge.kill(); process.exit(0);
}
const BOARD = `/${env.BOARD_PATH}`;
// Remember the settings, to put them back at the end whatever happens.
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data: original } = await db.from("site_settings").select("theme_color, current_season").eq("id", 1).single();

const go = async (path, wait = 3500) => { await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(wait); };
const text = () => evaluate("document.body.textContent");
const clickOn = async (expr, wait = 400) => {
  const ok = await evaluate(`(() => { const el=${expr}; if(!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true; })()`);
  await sleep(wait);
  return ok;
};
const button = (pattern) => `[...document.querySelectorAll('main button')].find(b=>${pattern}.test(b.textContent))`;
const waitFor = async (expr, ms = 15000) => { for (let t = 0; t < ms; t += 400) { if (await evaluate(expr)) return true; await sleep(400); } return false; };
const primary = () => evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()");

try {
  // A creator can't call the rename function at all.
  const creator = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  await creator.auth.signInWithPassword({ email: env.QA_CREATOR_EMAIL, password: env.QA_CREATOR_PASSWORD });
  const denied = await creator.rpc("rename_game", { p_from: "FC 27", p_to: "FC 99" });
  check("creator can't rename the game", !!denied.error, denied.error?.message);
  const colour = await creator.from("site_settings").update({ theme_color: "#ff0000" }).eq("id", 1).select();
  check("creator can't change the colour", !colour.error && colour.data.length === 0);

  await send("Network.clearBrowserCookies");
  await go("/login");
  await evaluate(`document.querySelector('input[name=email]').focus()`); await send("Input.insertText", { text: env.QA_ADMIN_EMAIL });
  await evaluate(`document.querySelector('input[name=password]').focus()`); await send("Input.insertText", { text: env.QA_ADMIN_PASSWORD });
  await clickOn(`document.querySelector('main form button[type=submit]')`, 6000);

  // ---- Colour
  await go("/");
  check("default page is styled (stylesheets loaded)", (await evaluate("getComputedStyle(document.body).backgroundColor")) === "rgb(7, 9, 13)");
  check("default: green and no theme override", (await primary()) === "#2bd98b" && !(await evaluate("!!document.getElementById('site-theme')")), await primary());
  await go(`${BOARD}/settings`);
  await clickOn(`[...document.querySelectorAll('main label')].find(l=>l.querySelector('input[name=theme-preset]') && l.textContent.trim()==='Purple')`);
  const preview = await evaluate(`getComputedStyle(document.querySelector('[aria-label=Preview]')).getPropertyValue('--color-primary').trim()`);
  check("preview shows purple before saving", preview === "#a970ff", preview);
  check("site not changed yet", (await primary()) === "#2bd98b");
  await clickOn(button("/^Save$/"), 500);
  check("saved", await waitFor(`/Saved\\./.test(document.querySelector('main').textContent)`));
  await go("/");
  check("home page is purple", (await primary()) === "#a970ff", await primary());
  check("page is still styled (stylesheets loaded)", (await evaluate("getComputedStyle(document.body).backgroundColor")) === "rgb(7, 9, 13)");
  check("matching light shade too", (await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-mint').trim()")) !== "#8ff0c9");
  await go("/learn");
  check("other pages are purple", (await primary()) === "#a970ff");

  // Any colour: type a code.
  await go(`${BOARD}/settings`);
  await evaluate(`document.querySelector('input[aria-label="Colour code"]').select()`);
  await send("Input.insertText", { text: "#1e90ff" });
  await clickOn(button("/^Save$/"), 500);
  await waitFor(`/Saved\\./.test(document.querySelector('main').textContent)`);
  await go("/feed");
  check("a typed colour works (blue)", (await primary()) !== "#a970ff" && (await primary()) !== "#2bd98b", await primary());

  // Back to green.
  await go(`${BOARD}/settings`);
  await clickOn(button("/Back to the original green/"));
  await clickOn(button("/^Save$/"), 500);
  await waitFor(`/Saved\\./.test(document.querySelector('main').textContent)`);
  await go("/");
  check("back to green", (await primary()) === "#2bd98b" && !(await evaluate("!!document.getElementById('site-theme')")));

  // ---- Rename FC 27 → FC 28
  await go("/learn/collections");
  check("collections say FC 27 before", /FC 27/.test(await text()));
  await go(`${BOARD}/settings`);
  await evaluate(`document.querySelector('input[name=renameTo]').focus()`); await send("Input.insertText", { text: "FC 28" });
  await clickOn(button("/Replace everywhere/"));
  check("asks to confirm", /Replace .FC 27. with .FC 28. everywhere\?/.test(await text()));
  await clickOn(button("/Yes, replace/"), 500);
  check("renamed", await waitFor(`/Done\\. \\d+ items? updated/.test(document.querySelector('main').textContent)`));
  await go("/learn/collections");
  const after = await text();
  check("collections now say FC 28, not FC 27", /FC 28/.test(after) && !/FC 27/.test(after));
  await go("/lads-plus");
  const plus = await text();
  check("FC Lads+ page text follows", /FC 28 video collections/.test(plus) && !/FC 27/.test(plus));
  await go("/");
  check("home page has no FC 27 left", !/FC 27/.test(await text()));

  // And back.
  await go(`${BOARD}/settings`);
  await evaluate(`document.querySelector('input[name=renameFrom]').select()`); await send("Input.insertText", { text: "FC 28" });
  await evaluate(`document.querySelector('input[name=renameTo]').focus()`); await send("Input.insertText", { text: "FC 27" });
  await clickOn(button("/Replace everywhere/"));
  await clickOn(button("/Yes, replace/"), 500);
  check("renamed back", await waitFor(`/Done\\./.test(document.querySelector('main').textContent)`));
  await go("/learn/collections");
  check("collections say FC 27 again", /FC 27/.test(await text()) && !/FC 28/.test(await text()));
} catch (error) {
  check("script ran without errors", false, error.message);
}
// Put the original settings back, whatever happened above.
await db.from("site_settings").update(original).eq("id", 1);
await send("Network.clearBrowserCookies");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
