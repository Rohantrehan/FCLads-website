// Drives headless Edge via CDP to test Home page interactions (auto-scroll + hard truth tabs).
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

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
const shot = async (name) => { const r = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.result.data, "base64")); };
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/learn" });
await sleep(3500);
const url = () => evaluate("location.pathname + location.search");
const count = () => evaluate(`document.querySelector('#guide-count').textContent.replace(/\s+/g,' ').trim()`);
check("initial count", (await count()) === "Showing 9 of 11", await count());
// Load more (client-side navigation, should keep scroll)
const lm = await evaluate(`(() => { const a=[...document.querySelectorAll('a')].find(a=>/Load more/.test(a.textContent)); a.scrollIntoView({block:'center'}); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const before = await evaluate("scrollY");
await click(lm.x, lm.y); await sleep(1500);
check("load more shows all", (await count()) === "Showing 11 of 11", (await url()) + " | " + (await count()));
const after = await evaluate("scrollY");
check("load more keeps scroll position", Math.abs(after - before) < 50, `${before} -> ${after}`);
// Category click
await evaluate("scrollTo(0,0)"); await sleep(300);
const cat = await evaluate(`(() => { const a=[...document.querySelectorAll('nav[aria-label="Guide categories"] a')].find(a=>a.textContent.startsWith('Tactics')); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await click(cat.x, cat.y); await sleep(1500);
check("category click filters", (await url()) === "/learn?category=tactics" && (await count()) === "Showing 2 of 2", (await url()) + " | " + (await count()));
const cur = await evaluate(`document.querySelector('nav[aria-label="Guide categories"] [aria-current=page]').textContent`);
check("active category marked", /Tactics/.test(cur), cur);
// Search within category
const box = await evaluate(`(() => { const r=document.querySelector('#learn-search').getBoundingClientRect(); return {x:r.x+40,y:r.y+r.height/2}; })()`);
await click(box.x, box.y);
await send("Input.insertText", { text: "4-3-2-1" });
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: String.fromCharCode(13) });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await sleep(2500);
check("search keeps category", (await url()) === "/learn?category=tactics&q=4-3-2-1", await url());
check("search results", (await count()) === "Showing 1 of 1", await count());
await shot("learn-search-results");
// Clear search
const clr = await evaluate(`(() => { const r=document.querySelector('[aria-label="Clear search"]').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await click(clr.x, clr.y); await sleep(1500);
check("clear search keeps category", (await url()) === "/learn?category=tactics", await url());
// Home topic chip deep link
await send("Page.navigate", { url: "http://localhost:3000/learn?category=fut-champs" }); await sleep(2500);
check("deep link from Home chip", (await count()) === "Showing 2 of 2", await count());
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
