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
await send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"], origin: "http://localhost:3000" });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/guides/beat-the-high-press" });
await sleep(3500);
// Every guide is FC Lads+: non-members get the title, intro and section names only.
const tocTotal = await evaluate(`document.querySelectorAll('nav[aria-labelledby=toc-heading] a').length`);
const tocLocked = await evaluate(`[...document.querySelectorAll('nav[aria-labelledby=toc-heading] a')].filter(a=>a.getAttribute('href')==='#members-only').length`);
check("every TOC item is locked and links to paywall", tocTotal > 0 && tocLocked === tocTotal, `${tocLocked}/${tocTotal}`);
check("tactic code hidden from non-members", !(await evaluate(`document.documentElement.outerHTML.includes('FCL-PRS-108')`)));
// click locked TOC entry -> scrolls to paywall
const lockLink = await evaluate(`(() => { window.scrollTo(0,0); const a=document.querySelector('nav[aria-labelledby=toc-heading] a[href="#members-only"]'); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await sleep(300); await click(lockLink.x, lockLink.y); await sleep(1200);
const pw = await evaluate(`document.getElementById('members-only').getBoundingClientRect().top`);
check("locked item scrolls to paywall", pw > 0 && pw < 300, String(pw));
// A video guide: the player is locked and no embed is sent.
await send("Page.navigate", { url: "http://localhost:3000/guides/fut-champs-your-first-10-games" }); await sleep(3000);
check("video is locked", /FC Lads\+ members only/.test(await evaluate(`document.querySelector('article a[href="#members-only"]')?.textContent`) ?? ""));
check("no video embeds sent", !(await evaluate(`/loom\.com\/(embed|share)|youtube(-nocookie)?\.com\/embed/.test(document.documentElement.outerHTML)`)));
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
