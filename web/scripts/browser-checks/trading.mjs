// Drives headless Edge via CDP to test Trading: free note, tax calculator, locked brief (public view).
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
const typeInto = async (label, text) => {
  await evaluate(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes(${JSON.stringify(label)})).querySelector('input').focus()`);
  await send("Input.insertText", { text });
};
const calc = () => evaluate(`[...document.querySelectorAll('dl[aria-live=polite] dd')].map(d=>d.textContent).join(' | ')`);

await send("Page.navigate", { url: "http://localhost:3000/trading" }); await sleep(4000);
check("free market note shown", /pre-Weekend League sell-off/.test(await body()));
check("brief is locked", /Unlock the brief/.test(await body()));
check("brief content not sent", !(await evaluate(`document.documentElement.outerHTML.includes('Fodder prices are at a low') || document.documentElement.outerHTML.includes('315,000')`)));
check("rising list starts with the biggest riser", /Kai Vanderbilt/.test(await evaluate(`document.querySelector('section[aria-labelledby=risers-heading] a')?.textContent ?? ""`)));
await typeInto("Bought for", "10000");
await typeInto("Selling for", "12000");
await sleep(300);
const result = await calc();
check("tax calculator", result === "600 | +1,400 | 10,527", result);
check("inputs format with commas", (await evaluate(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Bought for')).querySelector('input').value`)) === "10,000");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
