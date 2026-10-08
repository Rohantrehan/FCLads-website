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
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(4000);

// ---------- 1. Auto-scroll carousel ----------
await evaluate(`document.querySelector('[aria-label^="Meta players"]').scrollIntoView({block:'center'})`);
await mouse(5, 5); // cursor away from the row
await sleep(800);
const rect = await evaluate(`(() => { const r = document.querySelector('[aria-label^="Meta players"]').getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; })()`);
const sl = () => evaluate(`document.querySelector('[aria-label^="Meta players"]').scrollLeft`);
const a1 = await sl(); await sleep(1500); const a2 = await sl();
check("carousel scrolls by itself", a2 > a1, `${a1} -> ${a2}`);
await shot("t1-carousel-running");
await mouse(rect.x, rect.y); await sleep(400);
const b1 = await sl(); await sleep(1500); const b2 = await sl();
check("carousel stops on hover", b1 === b2, `${b1} -> ${b2}`);
await mouse(5, 5); await sleep(400);
const c1 = await sl(); await sleep(1500); const c2 = await sl();
check("carousel resumes after cursor leaves", c2 > c1, `${c1} -> ${c2}`);
const btn = await evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(b=>/Pause/.test(b.textContent)); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await click(btn.x, btn.y); await mouse(5, 5); await sleep(400);
const d1 = await sl(); await sleep(1200); const d2 = await sl();
check("Pause button stops scrolling", d1 === d2, `${d1} -> ${d2}`);
await click(btn.x, btn.y); await mouse(5, 5);
const pos = await evaluate(`[...document.querySelectorAll('[role=radio]')].find(b=>b.textContent==='CAM').getBoundingClientRect().toJSON()`);
await click(pos.x + pos.width / 2, pos.y + pos.height / 2); await sleep(600);
const camCards = await evaluate(`document.querySelector('[aria-label^="Meta players"]').textContent.includes('Leo Silva')`);
check("position filter still works (CAM shows Leo Silva)", camCards);

// ---------- 2. Hard truth tabs ----------
await evaluate(`document.querySelector('[role=tablist][aria-label="Common FC problems"]').scrollIntoView({block:'center'})`);
await sleep(600);
const tabs = await evaluate(`[...document.querySelectorAll('[role=tab]')].map(t => { const r=t.getBoundingClientRect(); return {x:r.x+80,y:r.y+r.height/2}; })`);
const panelTitle = () => evaluate(`document.querySelector('[role=tabpanel] h3')?.textContent.replace(/\\s+/g,' ').trim()`);
check("default answer is problem 3", (await panelTitle()) === "Tested before you spend.", await panelTitle());
const skew = await evaluate(`getComputedStyle(document.querySelector('[role=tab] span[aria-hidden] > span')).transform`);
check("highlight bar keeps its skew", skew && skew !== "none", skew);
await shot("t2-truth-default");

await mouse(tabs[0].x, tabs[0].y); await sleep(800);
check("resting on problem 1 shows its answer", (await panelTitle()) === "Same-day patch breakdowns.", await panelTitle());
await mouse(5, 5); await sleep(900);
check("answer STAYS after cursor leaves", (await panelTitle()) === "Same-day patch breakdowns.", await panelTitle());
// Quick sweep over rows 2 and 3 (40ms each), then rest on row 4.
const seen = new Set();
for (const i of [1, 2]) { await mouse(tabs[i].x, tabs[i].y); await sleep(40); seen.add(await panelTitle()); }
await mouse(tabs[3].x, tabs[3].y); await sleep(900);
check("quick sweep does not flash rows 2/3", ![...seen].some(t => t === "A weekly power ranking." || t === "Tested before you spend."), [...seen].join(" | "));
check("stopping on problem 4 shows its answer", (await panelTitle()) === "Updated tactics and slider codes.", await panelTitle());
await mouse(tabs[4].x, tabs[4].y); await sleep(900); await mouse(5, 5); await sleep(400);
const selected = await evaluate(`[...document.querySelectorAll('[role=tab]')].findIndex(t=>t.getAttribute('aria-selected')==='true')`);
check("aria-selected follows hover (tab 5)", selected === 4, String(selected));
await shot("t5-truth-hover-5-left");
await evaluate(`document.querySelectorAll('[role=tab]')[4].focus()`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowUp", code: "ArrowUp", windowsVirtualKeyCode: 38 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowUp", code: "ArrowUp", windowsVirtualKeyCode: 38 });
await sleep(900);
check("ArrowUp moves to problem 4", (await panelTitle()) === "Updated tactics and slider codes.", await panelTitle());

console.log(results.join("\n"));
ws.close(); edge.kill();
process.exit(0);
