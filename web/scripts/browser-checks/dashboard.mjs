// Drives headless Edge via CDP to test the member dashboard. Mode (argv[3]): "public" (default) checks the
// members-only gate; "member" needs DEV_VIEWER=member in web/.env.local and checks tabs + review booking.
import { spawn } from "node:child_process";
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const pos = (expr) => evaluate(`(() => { const el=${expr}; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const body = () => evaluate("document.body.textContent");
const MODE = process.argv[3] ?? "public";
const tabs = ["", "/trading", "/gameplay", "/review", "/discord", "/creators"];
const html = () => evaluate("document.documentElement.outerHTML");

if (MODE === "public") {
  for (const tab of tabs) {
    await send("Page.navigate", { url: `http://localhost:3000/dashboard${tab}` }); await sleep(2500);
    const page = await html();
    check(`gate on /dashboard${tab}`, page.includes("Your FC Lads+ dashboard"));
    check(`no member data on /dashboard${tab}`, !/Weekend League - Game 7|arjun_fc|Fodder prices are at a low|Drop defensive depth/.test(page));
  }
  check("header shows Log in", /Log in/.test(await body()) && !(await evaluate(`!!document.querySelector('header a[href="/dashboard"]')`)));
} else {
  await send("Page.navigate", { url: "http://localhost:3000/dashboard" }); await sleep(4000);
  check("welcome message", /Welcome back/.test(await body()));
  check("header links to dashboard", await evaluate(`!!document.querySelector('header a[href="/dashboard"]')`));
  check("My Feed tab is current", (await evaluate(`document.querySelector('nav[aria-label=Dashboard] a[aria-current=page]')?.textContent`)) === "My Feed");
  check("continue watching shows progress", (await evaluate("document.querySelectorAll('[role=progressbar]').length")) >= 3);

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/trading" }); await sleep(3500);
  check("trading tab shows the full brief", /Buy and sell targets/.test(await body()) && /315,000/.test(await body()));

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/gameplay?category=tactics" }); await sleep(3500);
  const cards = await evaluate(`document.querySelectorAll('#library article').length`);
  check("gameplay category filter", cards > 0 && cards < 11, `${cards} cards`);
  check("guides show as unlocked", !(await evaluate(`document.querySelector('#library').textContent.includes('(FC Lads+ members)')`)));

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/creators?creator=hobs" }); await sleep(3500);
  const authors = await evaluate(`[...document.querySelectorAll('section[aria-label="Creator posts"] article header a[href^="/creators/"]')].map(a=>a.textContent)`);
  check("creator filter shows only Hobs", authors.length > 0 && authors.every((name) => name === "Hobs"), authors.join(","));

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/review" }); await sleep(4000);
  const confirm = `[...document.querySelectorAll('button')].find(b=>/Pick a day|Confirm with/.test(b.textContent))`;
  check("confirm disabled at start", await evaluate(`${confirm}.disabled`));
  check("past days disabled", await evaluate(`document.querySelector('button[aria-label^="Monday 5 October"]').disabled`));
  let p = await pos(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Hobs')&&l.querySelector('input[type=radio]'))`);
  await click(p.x, p.y); await sleep(300);
  check("choose Hobs", await evaluate(`[...document.querySelectorAll('input[type=radio]')].find(i=>i.value==='hobs').checked`));
  check("Hobs's days are open", !(await evaluate(`document.querySelector('button[aria-label^="Monday 12 October"]').disabled`)) && (await evaluate(`document.querySelector('button[aria-label^="Tuesday 13 October"]').disabled`)));
  p = await pos(`document.querySelector('button[aria-label^="Monday 12 October"]')`);
  await click(p.x, p.y); await sleep(300);
  check("day shows times", /20:00/.test(await body()) && /21:00/.test(await body()));
  p = await pos(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes('21:00'))`);
  await click(p.x, p.y); await sleep(300);
  const label = await evaluate(`${confirm}.textContent`);
  check("confirm names the booking", /Confirm with Hobs · 12 Oct, 21:00/.test(label), label);
  p = await pos(confirm);
  await click(p.x, p.y); await sleep(500);
  check("booking confirmed", /You're booked in/.test(await body()) && /Monday 12 October at 21:00/.test(await body()));
  p = await pos(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Change booking'))`);
  await click(p.x, p.y); await sleep(300);
  check("change booking keeps the choice", /Confirm with Hobs/.test(await evaluate(`${confirm}.textContent`)));
}
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
