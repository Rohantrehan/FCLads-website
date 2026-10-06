// Drives headless Edge via CDP to test Home page interactions (auto-scroll + hard truth tabs).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const OUT = process.argv[2];
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${OUT}/cdpprof`, "--window-size=1440,900", "about:blank",
]);

let targets;
for (let i = 0; i < 40; i++) {
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
await send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"], origin: "http://localhost:3000" });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/guides/beat-the-high-press" });
await sleep(3500);
const activeToc = () => evaluate(`document.querySelector('[aria-current=location]')?.textContent.trim()`);
check("TOC starts on section 1", /^1\. Recognising/.test(await activeToc() ?? ""), await activeToc());
check("locked TOC items link to paywall", (await evaluate(`[...document.querySelectorAll('nav[aria-labelledby=toc-heading] a')].filter(a=>a.getAttribute('href')==='#members-only').length`)) === 4);
const btn = await evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(b=>/Copy code/.test(b.textContent)); b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await click(btn.x, btn.y); await sleep(400);
check("copy button confirms", await evaluate(`[...document.querySelectorAll('button')].some(b=>/Copied/.test(b.textContent))`));
const clip = await evaluate(`navigator.clipboard.readText().catch(e=>'ERR '+e.message)`);
check("clipboard has the code", clip === "FCL-PRS-108", clip);
// click locked TOC entry -> scrolls to paywall
const lockLink = await evaluate(`(() => { window.scrollTo(0,0); const a=document.querySelector('nav[aria-labelledby=toc-heading] a[href="#members-only"]'); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await sleep(300); await click(lockLink.x, lockLink.y); await sleep(1200);
const pw = await evaluate(`document.getElementById('members-only').getBoundingClientRect().top`);
check("locked item scrolls to paywall", pw > 0 && pw < 300, String(pw));
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
