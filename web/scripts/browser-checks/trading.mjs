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
const results = [];
const check = (name, ok, detail) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const body = () => evaluate("document.body.textContent");
const typeInto = async (label, text) => {
  await evaluate(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes(${JSON.stringify(label)})).querySelector('input').focus()`);
  await send("Input.insertText", { text });
};
const calc = () => evaluate(`[...document.querySelectorAll('dl[aria-live=polite] dd')].map(d=>d.textContent).join(' | ')`);

// Mode (argv[3]): "public" (default) checks locked FC Lads+ posts; "member" needs DEV_VIEWER=member.
const MODE = process.argv[3] ?? "public";
const posts = () => evaluate(`document.querySelectorAll('main article').length`);
const current = () => evaluate(`document.querySelector('nav[aria-label="Filter posts by date"] a[aria-current=page]')?.textContent`);
const open = async (query) => { await send("Page.navigate", { url: `http://localhost:3000/trading${query}` }); await sleep(3000); };
const LOCKED_TEXT = "buying 86s under 3,000";

await open("");
check("Last 7 days is the default", (await current()) === "Last 7 days", await current());
check("last 7 days shows 8 posts", (await posts()) === 8, String(await posts()));
check("posts show heading + text", await evaluate(`!!document.querySelector('main article h2')`));
check("screenshot sits right of the text on desktop", await evaluate(`(() => { const a=[...document.querySelectorAll('main article')].find(x=>x.querySelector('img')); const t=a.querySelector('h2').getBoundingClientRect(); const i=a.querySelector('img').getBoundingClientRect(); return i.left > t.left; })()`));
if (MODE === "public") {
  check("locked post text not sent", !(await evaluate(`document.documentElement.outerHTML.includes(${JSON.stringify(LOCKED_TEXT)})`)));
  check("locked posts say Lads+", /full post and screenshot are for FC Lads\+ members/.test(await body()));
} else {
  check("members see the full post", (await body()).includes(LOCKED_TEXT));
  check("no lock notes for members", !/full post and screenshot are for FC Lads\+ members/.test(await body()));
}
await open("?range=today");
check("Today shows 2 posts", (await posts()) === 2, String(await posts()));
await open("?range=yesterday");
check("Yesterday shows 2 posts", (await posts()) === 2, String(await posts()));
await open("?range=3d");
check("Last 3 days shows 5 posts", (await posts()) === 5, String(await posts()));
await open("?range=custom&from=2026-10-01&to=2026-10-05");
check("custom range shows 2 posts", (await posts()) === 2, String(await posts()));
check("custom form keeps the dates", (await evaluate(`document.querySelector('input[name=from]').value + ' ' + document.querySelector('input[name=to]').value`)) === "2026-10-01 2026-10-05");
await open("?range=custom&from=2026-10-05&to=2026-10-01");
check("reversed custom dates still work", (await posts()) === 2, String(await posts()));
await open("?range=custom&from=2026-09-01&to=2026-09-02");
check("empty range shows a message", (await posts()) === 0 && /No trading posts in this range/.test(await body()));
await open("?range=nonsense");
check("bad range falls back to last 7 days", (await current()) === "Last 7 days");
await open("");
await typeInto("Bought for", "10000");
await typeInto("Selling for", "12000");
await sleep(300);
const result = await calc();
check("tax calculator", result === "600 | +1,400 | 10,527", result);
check("inputs format with commas", (await evaluate(`[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Bought for')).querySelector('input').value`)) === "10,000");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
