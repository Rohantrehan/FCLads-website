// Drives headless Edge via CDP through a real gameplay review booking against Supabase, with the QA
// test accounts in web/.env.local (free, member, creator linked to "stefan"). Needs DEV_VIEWER unset.
// Creator adds free times → member books → creator adds the call link → member cancels → creator
// removes the times. Leaves only a cancelled booking row behind (delete it with SQL if you like).
import { spawn } from "node:child_process";
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
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => /^QA_\w+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.QA_FREE_EMAIL || !env.QA_MEMBER_EMAIL || !env.QA_CREATOR_EMAIL) {
  console.log("FAIL  QA_* test accounts missing from .env.local"); edge.kill(); process.exit(0);
}

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

// A day two days from now (UK), and how the member calendar labels it.
const ukDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const DAY = ukDay(new Date(Date.now() + 2 * 86_400_000));
const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${DAY}T00:00:00Z`));
const SAME_MONTH = DAY.slice(0, 7) === ukDay(new Date()).slice(0, 7);

try {
  // ---- Who can see the Creator hub
  await send("Network.clearBrowserCookies");
  await go("/creator");
  check("logged out: Creator hub asks to log in", /Log in with your creator account/.test(await text()));
  await logIn(env.QA_FREE_EMAIL, env.QA_FREE_PASSWORD);
  await go("/creator");
  check("free user: Creator hub is creators only", /Creators only/.test(await text()));
  await go("/dashboard/review");
  check("free user: review page is members only", !/Book my session/.test(await text()) && !/Choose a Lad/.test(await text()));

  // ---- Creator adds two free times
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD, "?next=/creator");
  check("creator lands on the Creator hub", (await url()) === "/creator", await url());
  check("header shows Creator hub link", await evaluate(`[...document.querySelectorAll('header a')].some(a=>a.textContent.trim()==='Creator hub')`));
  await evaluate(`(() => { const el=document.querySelector('input[name=day]'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(el,'${DAY}'); el.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await clickOn(`[...document.querySelectorAll('label')].find(l=>l.textContent.trim()==='20:00')`);
  await clickOn(`[...document.querySelectorAll('label')].find(l=>l.textContent.trim()==='20:30')`);
  const addLabel = await evaluate(`${button("/Add \\d+ time/")}?.textContent`);
  check("add button counts the picked times", /Add 2 times/.test(addLabel ?? ""), addLabel);
  await clickOn(button("/Add \\d+ time/"), 500);
  check("times saved", await waitFor(`/Added 2 free times|already free/.test(document.querySelector('main').textContent)`));
  await go("/creator");
  check("free times list shows them", await evaluate(`[...document.querySelectorAll('button[aria-label^="Remove "]')].filter(b=>/20:00|20:30/.test(b.getAttribute('aria-label'))).length >= 2`));

  // ---- Member books 20:00
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD, "?next=/dashboard/review");
  check("member lands on the review page", (await url()) === "/dashboard/review", await url());
  const before = await text();
  check("one review left this month", /1 of 1 review left this month/.test(before));
  check("Stefan is picked (he has free times)", await evaluate(`[...document.querySelectorAll('input[type=radio]')].find(i=>i.value==='stefan')?.checked`));
  if (!(await evaluate(`!!document.querySelector('button[aria-label^="${DAY_LABEL}"]')`))) await clickOn(`document.querySelector('button[aria-label="Next month"]')`);
  check("the day is open", (await evaluate(`document.querySelector('button[aria-label^="${DAY_LABEL}"]')?.disabled`)) === false, DAY_LABEL);
  await clickOn(`document.querySelector('button[aria-label^="${DAY_LABEL}"]')`);
  check("day shows both times", /20:00/.test(await text()) && /20:30/.test(await text()));
  await clickOn(`[...document.querySelectorAll('main label')].find(l=>/20:00/.test(l.textContent)&&l.querySelector('input[type=radio]'))`);
  await clickOn(`document.querySelector('main form button[type=submit]')`, 800);
  check("no match link: plain error, nothing sent", /starts with https:\/\//.test(await text()) && !/You're booked in/.test(await text()));
  await typeInto("input[name=matchUrl]", "https://youtu.be/qa-test-match");
  await typeInto("textarea[name=focus]", "QA test booking: cutbacks");
  const bookLabel = await evaluate(`document.querySelector('main form button[type=submit]').textContent`);
  check("book button names Lad and time", /Book with Stefan · .*20:00/.test(bookLabel), bookLabel);
  await clickOn(`document.querySelector('main form button[type=submit]')`, 6000);
  const booked = await text();
  check("booked", /You're booked in/.test(booked) && /at 20:00/.test(booked), booked.slice(0, 120));
  check("call link not there yet", /adds it before the session/.test(booked));
  if (SAME_MONTH) check("review chip shows 0 left", /Review: 0 left/.test(await evaluate("document.body.textContent")));

  // ---- Creator sees the booking and adds the call link
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD, "?next=/creator");
  const hub = await text();
  check("creator sees the session", /QA Member/.test(hub) && /QA test booking: cutbacks/.test(hub));
  check("booked time left the free list", await evaluate(`![...document.querySelectorAll('button[aria-label^="Remove "]')].some(b=>/20:00/.test(b.getAttribute('aria-label'))&&b.getAttribute('aria-label').includes('${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${DAY}T00:00:00Z`))}'))`));
  await typeInto("input[name=meetingUrl]", "https://meet.example.com/qa");
  await clickOn(button("/Save link/"), 4000);
  check("call link saved", /Saved\./.test(await text()));

  // ---- Member sees the link, then cancels
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD, "?next=/dashboard/review");
  check("member sees Join the call", await evaluate(`[...document.querySelectorAll('main a')].some(a=>/Join the call/.test(a.textContent)&&a.href==='https://meet.example.com/qa')`));
  await clickOn(button("/Cancel or move session/"));
  check("cancel asks to confirm", /Cancel this session\?/.test(await text()));
  await clickOn(button("/Yes, cancel it/"), 6000);
  const after = await text();
  check("cancelled: booking form is back", /Choose a Lad/.test(after) && /1 of 1 review left this month/.test(after));

  // ---- Creator removes the free times again
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD, "?next=/creator");
  check("cancelled session is gone from the hub", !/QA test booking/.test(await text()));
  for (let i = 0; i < 4; i++) {
    const removed = await clickOn(`[...document.querySelectorAll('button[aria-label^="Remove "]')].find(b=>/20:00|20:30/.test(b.getAttribute('aria-label')))`, 3500);
    if (!removed) break;
  }
  check("free times removed", await evaluate(`![...document.querySelectorAll('button[aria-label^="Remove "]')].some(b=>/20:00|20:30/.test(b.getAttribute('aria-label')))`));
} catch (error) {
  check("script ran without errors", false, error.message);
}
// Leave the shared browser profile logged out for the next script.
await send("Network.clearBrowserCookies");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
