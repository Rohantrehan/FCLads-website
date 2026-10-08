// Drives headless Edge via CDP to test Home page interactions (auto-scroll + hard truth tabs).
import { spawn } from "node:child_process";


const OUT = process.argv[2];
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
await send("Page.navigate", { url: "http://localhost:3000/creators" });
await sleep(3500);
const panelName = () => evaluate(`document.querySelector('[aria-label="Selected creator"] .font-display')?.textContent.trim()`);
const cardPos = (name) => evaluate(`(() => { const h=[...document.querySelectorAll('article h3')].find(h=>h.textContent.trim()===${JSON.stringify(name)}); const r=h.closest('article').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+60}; })()`);
check("panel starts on Stefan (TFV hidden)", (await panelName()) === "Stefan", await panelName());
check("TFV not in roster", !(await evaluate("document.body.innerText.includes('TFV')")));
const st = await cardPos("Hobs");
await mouse(st.x, st.y); await sleep(800);
check("hover Hobs shows Hobs", (await panelName()) === "Hobs", await panelName());
await mouse(5, 5); await sleep(700);
check("panel stays on Hobs after leaving", (await panelName()) === "Hobs", await panelName());
const ws2 = await cardPos("Wessam");
await mouse(ws2.x, ws2.y); await sleep(800);
check("hover Wessam shows Wessam", (await panelName()) === "Wessam", await panelName());
await click(ws2.x, ws2.y); await sleep(2500);
check("click opens Wessam's profile", (await evaluate("location.pathname")) === "/creators/wessam", await evaluate("location.pathname"));
await send("Page.navigate", { url: "http://localhost:3000/creators/stefan" }); await sleep(3000);
const tab = await evaluate(`(() => { const a=document.querySelector('nav[aria-label="Profile sections"] a[href="#squads"]'); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await click(tab.x, tab.y); await sleep(1200);
const top = await evaluate(`document.getElementById('squads').getBoundingClientRect().top`);
check("Squads tab jumps below sticky bar", top > 100 && top < 260, String(top));
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
