// Drives headless Edge via CDP to test The Feed: topics, load more, locked trading targets.
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
const href = () => evaluate("location.pathname + location.search");
const count = () => evaluate(`document.getElementById('feed-count')?.textContent ?? ""`);
const posts = () => evaluate(`document.querySelectorAll('main article').length`);

await send("Page.navigate", { url: "http://localhost:3000/feed" }); await sleep(3500);
check("first page shows 8 posts", (await posts()) === 8, String(await posts()));
check("count says 8 of 13", /8 of 13/.test(await count()), await count());
check("locked trading price not sent", !(await evaluate(`document.documentElement.outerHTML.includes('3,900')`)));
check("locked target note", /1 more target for FC Lads\+ members/.test(await evaluate("document.body.textContent")));
check("video links to Lads+ breakdown", !!(await evaluate(`!!document.querySelector('main article a[href="/guides/beat-the-high-press"]')`)));
let p = await pos(`[...document.querySelectorAll('nav[aria-label="Feed topics"] a')].find(a=>a.textContent.startsWith('Trading'))`);
await click(p.x, p.y); await sleep(2500);
check("topic filter", (await href()) === "/feed?topic=trading", await href());
check("trading shows 3 posts", (await posts()) === 3, String(await posts()));
await send("Page.navigate", { url: "http://localhost:3000/feed" }); await sleep(3000);
p = await pos(`[...document.querySelectorAll('main a')].find(a=>/Load more posts/.test(a.textContent))`);
await click(p.x, p.y); await sleep(2500);
check("load more", (await href()) === "/feed?limit=16" && (await posts()) === 13, `${await href()} ${await posts()}`);
await send("Page.navigate", { url: "http://localhost:3000/feed?topic=nope" }); await sleep(2500);
check("unknown topic falls back to all", /of 13/.test(await count()), await count());
p = await pos(`[...document.querySelectorAll('section[aria-labelledby=trending-heading] a')][0]`);
await click(p.x, p.y); await sleep(2500);
check("trending item opens", (await href()) === "/guides/beat-the-high-press", await href());
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
