// Drives headless Edge via CDP to test the legal pages: tabs, contents scroll-spy, copy email, phone contents.
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
const activeToc = () => evaluate(`document.querySelector('nav[aria-label=Contents]:not(details nav) a[aria-current=location]')?.textContent ?? ""`);

await send("Page.navigate", { url: "http://localhost:3000/legal" }); await sleep(4000);
check("/legal redirects to terms", (await evaluate("location.pathname")) === "/legal/terms");
check("terms tab is current", (await evaluate(`document.querySelector('nav[aria-label="Legal pages"] a[aria-current=page]')?.textContent`)) === "Terms of Service");
check("10 sections", (await evaluate("document.querySelectorAll('article[id]').length")) === 10);
check("contents starts on section 1", /Accepting these terms/.test(await activeToc()), await activeToc());
let p = await pos(`[...document.querySelectorAll('nav[aria-label=Contents]:not(details nav) a')].find(a=>a.textContent.includes('Cancelling'))`);
await click(p.x, p.y); await sleep(1200);
check("clicking contents jumps to the section", (await evaluate("location.hash")) === "#cancellation");
check("contents highlights the section on screen", /Cancelling/.test(await activeToc()), await activeToc());
check("heading clears the sticky header", (await evaluate("document.getElementById('cancellation').getBoundingClientRect().top")) >= 80);
p = await pos(`[...document.querySelectorAll('nav[aria-label="Legal pages"] a')].find(a=>a.textContent.includes('Privacy'))`);
await click(p.x, p.y); await sleep(2500);
check("privacy tab opens privacy", (await evaluate("location.pathname")) === "/legal/privacy" && /never sell your data/.test(await body()));
await send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"], origin: "http://localhost:3000" });
p = await pos(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Copy')`);
await click(p.x, p.y); await sleep(400);
check("copy email", (await evaluate("navigator.clipboard.readText()")) === "hello@fclads.com" && /Copied/.test(await body()));

await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/legal/trading-disclaimer" }); await sleep(3500);
check("phone: contents collapsed", (await evaluate("document.querySelector('details').open")) === false);
p = await pos("document.querySelector('details summary')");
await click(p.x, p.y); await sleep(300);
check("phone: contents opens", (await evaluate("document.querySelector('details').open")) === true);
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
