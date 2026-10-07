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
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const url = () => evaluate("location.pathname");
const pos = (expr) => evaluate(`(() => { const el=${expr}; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
await send("Page.navigate", { url: "http://localhost:3000/learn" }); await sleep(3000);
let p = await pos(`document.querySelector('nav[aria-label="Learn sections"] a[href="/learn/collections"]')`);
await click(p.x, p.y); await sleep(2000);
check("Collections tab opens /learn/collections", (await url()) === "/learn/collections", await url());
check("14 collection cards", (await evaluate(`document.querySelectorAll('#all-heading ~ div article').length`)) === 14, String(await evaluate(`document.querySelectorAll('#all-heading ~ div article').length`)));
check("path has 5 steps", (await evaluate(`document.querySelectorAll('section[aria-labelledby=path-heading] ol > li').length`)) === 5);
p = await pos(`[...document.querySelectorAll('section[aria-labelledby=path-heading] a')].find(a=>a.textContent.includes('Academy: Defending'))`);
await click(p.x, p.y); await sleep(2000);
check("path step opens collection", (await url()) === "/learn/collections/academy-defending", await url());
check("current step marked", /Academy: Defending/.test(await evaluate(`document.querySelector('[aria-current=step]')?.textContent`) ?? ""));
p = await pos(`[...document.querySelectorAll('section[aria-labelledby=videos-heading] ol a')].find(a=>a.textContent.includes('Defending 1v1'))`);
await click(p.x, p.y); await sleep(2500);
check("episode with guide opens guide page", (await url()) === "/guides/defending-1v1-without-panicking", await url());
await send("Page.navigate", { url: "http://localhost:3000/learn/collections/academy-defending" }); await sleep(2500);
p = await pos(`[...document.querySelectorAll('a')].find(a=>/Next in the path/.test(a.textContent))`);
await click(p.x, p.y); await sleep(2000);
check("next-in-path goes to step 4", (await url()) === "/learn/collections/academy-attacking", await url());
p = await pos(`document.querySelector('nav[aria-label="Learn sections"] a[href="/learn"]')`);
await send("Page.navigate", { url: "http://localhost:3000/learn/collections" }); await sleep(2500);
p = await pos(`document.querySelector('nav[aria-label="Learn sections"] a[href="/learn"]')`);
await click(p.x, p.y); await sleep(2000);
check("Guides tab returns to /learn", (await url()) === "/learn", await url());
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
