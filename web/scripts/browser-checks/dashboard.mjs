// Drives headless Edge via CDP to test the member dashboard. Mode (argv[3]): "public" (default) checks the
// members-only gate; "member" needs DEV_VIEWER=member in web/.env.local and checks the tabs (booking: reviews.mjs).
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
    check(`no member data on /dashboard${tab}`, !/Weekend League - Game 7|arjun_fc|buying 86s under 3,000|Drop defensive depth/.test(page));
  }
  check("header shows Log in", /Log in/.test(await body()) && !(await evaluate(`!!document.querySelector('header a[href="/dashboard"]')`)));
} else {
  await send("Page.navigate", { url: "http://localhost:3000/dashboard" }); await sleep(4000);
  check("welcome message", /Welcome back/.test(await body()));
  check("header links to dashboard", await evaluate(`!!document.querySelector('header a[href="/dashboard"]')`));
  check("My Feed tab is current", (await evaluate(`document.querySelector('nav[aria-label=Dashboard] a[aria-current=page]')?.textContent`)) === "My Feed");
  check("continue watching shows progress", (await evaluate("document.querySelectorAll('[role=progressbar]').length")) >= 3);

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/trading" }); await sleep(3500);
  check("trading tab shows members-only posts unlocked", (await body()).includes("buying 86s under 3,000") && !/full post and screenshot are for FC Lads\+ members/.test(await body()));

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/gameplay?category=tactics" }); await sleep(3500);
  const cards = await evaluate(`document.querySelectorAll('#library article').length`);
  check("gameplay category filter", cards > 0 && cards < 11, `${cards} cards`);
  check("guides show as unlocked", !(await evaluate(`document.querySelector('#library').textContent.includes('(FC Lads+ members)')`)));

  await send("Page.navigate", { url: "http://localhost:3000/dashboard/creators?creator=hobs" }); await sleep(3500);
  const authors = await evaluate(`[...document.querySelectorAll('section[aria-label="Creator posts"] article header a[href^="/creators/"]')].map(a=>a.textContent)`);
  check("creator filter shows only Hobs", authors.length > 0 && authors.every((name) => name === "Hobs"), authors.join(","));

  // Real booking needs a real account: see reviews.mjs. The design preview only shows a note.
  await send("Page.navigate", { url: "http://localhost:3000/dashboard/review" }); await sleep(4000);
  check("review tab: preview mode explains real accounts are needed", /Log in with a real FC Lads\+ account to book/.test(await body()));
}
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
