// Drives headless Edge via CDP through a real gameplay review against Supabase, with the QA test
// accounts in web/.env.local (free, member, creator linked to "stefan"). Needs DEV_VIEWER unset and
// SUPABASE_SECRET_KEY (used only to clear the QA member's review requests before and after).
// Member sends a match → changes the link → creator starts it → asks for a new link → member fixes it
// → creator sends the review → member sees review and plan. Leaves nothing behind.
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Absolute path: Edge refuses a relative --user-data-dir for remote debugging.
const OUT = resolve(process.argv[2] ?? ".checks");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${OUT}/cdpprof`, "--window-size=1440,900", "about:blank",
]);

let targets;
for (let i = 0; i < 120; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(250); }
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const mouse = (x, y, type = "mouseMoved", extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, pointerType: "mouse", ...extra });
const click = async (x, y) => { await mouse(x, y); await mouse(x, y, "mousePressed", { button: "left", clickCount: 1 }); await mouse(x, y, "mouseReleased", { button: "left", clickCount: 1 }); };
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

// Test accounts live in web/.env.local (QA_* lines), never in this file.
const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => /^(QA_\w+|NEXT_PUBLIC_SUPABASE_\w+|SUPABASE_SECRET_KEY)=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.QA_FREE_EMAIL || !env.QA_MEMBER_EMAIL || !env.QA_CREATOR_EMAIL || !env.SUPABASE_SECRET_KEY) {
  console.log("FAIL  QA_* test accounts or SUPABASE_SECRET_KEY missing from .env.local"); edge.kill(); process.exit(0);
}

// Clears the QA member's review requests (one a month, so each run starts fresh).
const memberClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const { data: memberLogin } = await memberClient.auth.signInWithPassword({ email: env.QA_MEMBER_EMAIL, password: env.QA_MEMBER_PASSWORD });
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const clearMemberReviews = () => db.from("review_requests").delete().eq("member_id", memberLogin.user.id);
await clearMemberReviews();

const go = async (path, wait = 3500) => { await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(wait); };
const url = () => evaluate("location.pathname + location.search");
// textContent, not innerText: innerText follows CSS uppercase.
const text = () => evaluate("document.querySelector('main').textContent");
const pos = (expr) => evaluate(`(() => { const el=${expr}; if(!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const clickOn = async (expr, wait = 400) => { const p = await pos(expr); if (!p) return false; await click(p.x, p.y); await sleep(wait); return true; };
const typeInto = async (sel, value) => { await evaluate(`document.querySelector('${sel}').focus()`); await send("Input.insertText", { text: value }); };
/** Polls the page until `expr` is true (or the time runs out). Server actions can take a moment in dev. */
const waitFor = async (expr, ms = 12000) => { for (let t = 0; t < ms; t += 400) { if (await evaluate(expr)) return true; await sleep(400); } return false; };
const button = (pattern) => `[...document.querySelectorAll('main button')].find(b=>${pattern}.test(b.textContent))`;
const logIn = async (email, password, next = "") => {
  await send("Network.clearBrowserCookies");
  await go(`/login${next}`);
  await typeInto("input[name=email]", email);
  await typeInto("input[name=password]", password);
  await clickOn(`document.querySelector('main form button[type=submit]')`, 6000);
};

const STAMP = Date.now().toString(36);
const mainText = () => evaluate("document.querySelector('main').textContent");
const card = `[...document.querySelectorAll('main article')].find(a=>a.textContent.includes(${JSON.stringify(STAMP)}))`;
const cardButton = (pattern) => `[...(${card}?.querySelectorAll('button') ?? [])].find(b=>${pattern}.test(b.textContent))`;

try {
  // ---- Who can see what
  await send("Network.clearBrowserCookies");
  await go("/creator");
  check("logged out: Creator hub asks to log in", /Log in with your creator account/.test(await text()));
  await logIn(env.QA_FREE_EMAIL, env.QA_FREE_PASSWORD);
  await go("/creator");
  check("free user: Creator hub is creators only", /Creators only/.test(await text()));
  await go("/dashboard/review");
  check("free user: review page is members only", !/Send my match/.test(await text()) && !/Choose a Lad/.test(await text()));

  // ---- Member sends a match (no booking, no times)
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD, "?next=/dashboard/review");
  check("member lands on the review page", (await url()) === "/dashboard/review", await url());
  const before = await text();
  check("one review left this month", /1 of 1 review left this month/.test(before));
  check("no calendar or times any more", !(await evaluate(`!!document.querySelector('button[aria-label="Next month"]')`)) && !/Free times/.test(before));
  check("Any Lad is picked by default", await evaluate(`document.querySelector('input[name=lad][value=any]')?.checked`));
  await clickOn(`document.querySelector('main form button[type=submit]')`, 800);
  check("no match link: plain error, nothing sent", /starts with https:\/\//.test(await text()) && !/Match sent/.test(await text()));
  await clickOn(`[...document.querySelectorAll('main label')].find(l=>l.querySelector('input[name=lad][value=stefan]'))`);
  check("send button names the Lad", /Send to Stefan/.test(await evaluate(`document.querySelector('main form button[type=submit]').textContent`)));
  await typeInto("input[name=matchUrl]", "https://youtu.be/qa-test-match");
  await typeInto("textarea[name=focus]", `QA test review ${STAMP}: cutbacks`);
  await clickOn(`document.querySelector('main form button[type=submit]')`, 500);
  check("sent", await waitFor(`/Match sent/.test(document.querySelector('main').textContent)`));
  check("says Stefan will pick it up", /Stefan will pick it up/.test(await mainText()));
  check("review chip shows 0 left", await waitFor(`/0 of 1 review left/.test(document.body.textContent)`));

  // Member changes the link before anyone starts.
  await clickOn(button("/Change link or note/"));
  await evaluate(`document.querySelector('main input[name=matchUrl]').select()`);
  await send("Input.insertText", { text: "https://youtu.be/qa-test-match-2" });
  await clickOn(button("/^Save$/"), 500);
  check("link changed", await waitFor(`[...document.querySelectorAll('main a')].some(a=>a.href==='https://youtu.be/qa-test-match-2')`));

  // ---- Creator picks it up, then asks for a new link
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD, "?next=/creator");
  const hub = await mainText();
  check("creator: no free-times panel", !/Add free times/.test(hub));
  check("creator sees it in the queue", /Waiting for a Lad/.test(hub) && hub.includes(`QA test review ${STAMP}`));
  check("marked as asked for them", await evaluate(`/Asked for you/.test(${card}?.textContent ?? '')`));
  await clickOn(cardButton("/Start review/"), 500);
  check("started: now You're reviewing", await waitFor(`/You're reviewing/.test(${card}?.textContent ?? '')`));
  await clickOn(cardButton("/Link doesn.t work/"));
  await evaluate(`${card}.querySelector('input[name=note]').focus()`);
  await send("Input.insertText", { text: "QA: the video is private" });
  await clickOn(cardButton("/Ask for a new link/"), 500);
  check("sent back for a new link", await waitFor(`/Waiting for a new link/.test(document.querySelector('main').textContent)`));

  // ---- Member fixes the link
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD, "?next=/dashboard/review");
  check("member sees New link needed + note", /New link needed/.test(await mainText()) && /QA: the video is private/.test(await mainText()));
  await evaluate(`document.querySelector('main input[name=matchUrl]').select()`);
  await send("Input.insertText", { text: "https://youtu.be/qa-test-match-3" });
  await clickOn(button("/^Save$/"), 500);
  check("fixed: back to Match sent", await waitFor(`/Match sent/.test(document.querySelector('main').textContent)`));

  // ---- Creator sends the review
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD, "?next=/creator");
  await clickOn(cardButton("/Start review/"), 500);
  await waitFor(`!!${card}?.querySelector('textarea[name=notes]')`);
  await clickOn(cardButton("/Send review/"), 2500);
  check("review without a plan is refused", /at least one point/.test(await mainText()));
  await evaluate(`${card}.querySelector('input[name=title]').focus()`); await send("Input.insertText", { text: "QA title" });
  await evaluate(`${card}.querySelector('textarea[name=notes]').focus()`); await send("Input.insertText", { text: "QA written review: hold your shape." });
  await evaluate(`${card}.querySelector('input[name=plan]').focus()`); await send("Input.insertText", { text: "QA plan point one" });
  await clickOn(cardButton("/Send review/"), 500);
  check("review sent: in the last-90-days list", await waitFor(`/QA plan point one/.test(document.querySelector('section[aria-labelledby=past-heading]')?.textContent ?? '')`));

  // ---- Member sees the review
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD, "?next=/dashboard/review");
  const after = await mainText();
  check("member sees the plan and written review", /QA plan point one/.test(after) && /QA written review/.test(after));
  check("month used: can't send another", /had this month.s review/.test(after) && !(await evaluate(`!!document.querySelector('input[name=matchUrl]')`)));
} catch (error) {
  check("script ran without errors", false, error.message);
}
await clearMemberReviews();
// Leave the shared browser profile logged out for the next script.
await send("Network.clearBrowserCookies");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
