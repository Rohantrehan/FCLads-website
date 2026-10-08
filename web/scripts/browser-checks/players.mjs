// Drives headless Edge via CDP to test Meta Players (/players) and the player detail page.
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
const url = () => evaluate("location.pathname");
const pos = (expr) => evaluate(`(() => { const el=${expr}; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const key = (k, code) => send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: code === "ArrowLeft" ? 37 : 39 }).then(() => send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code }));
const text = (sel) => evaluate(`document.querySelector(${JSON.stringify(sel)})?.textContent ?? ""`);
const href = () => evaluate("location.pathname + location.search");

await send("Page.navigate", { url: "http://localhost:3000/players" }); await sleep(3500);
check("podium has 3 cards", (await evaluate(`document.querySelectorAll('section[aria-label="Top three"] article').length`)) === 3);
check("#1 meta pick is Vanderbilt", /VANDERBILT/i.test(await evaluate(`[...document.querySelectorAll('section[aria-label="Top three"] article')].find(a=>/#1 meta pick/i.test(a.textContent))?.textContent ?? ""`)));
check("ranking shows ranks 4-10", /ranks 4–10/i.test(await text("#ranking-heading")), await text("#ranking-heading"));
check("locked rows behind paywall", /22 more ranked players/i.test(await evaluate("document.body.textContent")));
check("locked players not sent", !(await evaluate(`document.documentElement.outerHTML.includes('Santi Arismendi')`)));
let p = await pos(`[...document.querySelectorAll('nav[aria-label=Positions] a')].find(a=>a.textContent.includes('Strikers'))`);
await click(p.x, p.y); await sleep(2500);
check("position filter", (await href()) === "/players?position=strikers", await href());
check("strikers count", /19 players/.test(await text("#player-count")), await text("#player-count"));
p = await pos(`[...document.querySelectorAll('nav[aria-label=Budget] a')].find(a=>a.textContent.includes('< 50K'))`);
await click(p.x, p.y); await sleep(2500);
check("budget filter", (await href()) === "/players?position=strikers&budget=under-50k", await href());
await evaluate(`(() => { const s=document.getElementById('player-sort'); s.value='price-asc'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`); await sleep(2500);
check("sort updates URL", /sort=price-asc/.test(await href()), await href());
check("no podium when sorted by price", (await evaluate(`document.querySelectorAll('section[aria-label="Top three"]').length`)) === 0);
check("cheapest first", /Santi Arismendi/.test(await evaluate(`document.querySelector('table tbody tr')?.textContent ?? ""`)), await evaluate(`document.querySelector('table tbody tr th')?.textContent ?? ""`));
await send("Page.navigate", { url: "http://localhost:3000/players?q=kofi" }); await sleep(3000);
check("search finds Kofi Mensah", /Kofi Mensah/.test(await evaluate(`document.querySelector('section[aria-labelledby=ranking-heading]')?.textContent ?? ""`)));
await send("Page.navigate", { url: "http://localhost:3000/players?position=gk" }); await sleep(3000);
check("goalkeepers empty state", /Goalkeeper rankings are coming/i.test(await evaluate("document.body.textContent")));

await send("Page.navigate", { url: "http://localhost:3000/players/marco-velardi" }); await sleep(4500);
check("detail h1", /Marco Velardi/i.test(await text("h1")));
check("review hidden from non-members", !(await evaluate(`document.documentElement.outerHTML.includes('step-over sprint boost')`)));
check("review lock card", /in-depth review of Marco Velardi/i.test(await text("#lads-verdict")));
check("chart rendered", (await evaluate(`Number(document.querySelector('#price svg[role=img]')?.getAttribute('width') ?? 0)`)) > 300);
const tip = () => evaluate(`document.querySelector('#price [aria-hidden=true].absolute')?.textContent ?? ""`);
check("tooltip starts on today", /today/.test(await tip()), await tip());
await evaluate(`document.querySelector('#price svg[role=img]').focus()`);
await key("ArrowLeft", "ArrowLeft"); await sleep(300);
check("arrow key moves tooltip", !/today/.test(await tip()), await tip());
p = await pos(`[...document.querySelectorAll('#price [role=radio]')].find(b=>b.textContent==='30D')`);
await click(p.x, p.y); await sleep(500);
check("30D range", /30-day change/.test(await text("#price")));
check("attributes section", (await evaluate(`document.querySelectorAll('section[aria-labelledby=attributes-heading] [role=meter]').length`)) >= 20);
await send("Page.navigate", { url: "http://localhost:3000/players/not-a-player" }); await sleep(2500);
check("unknown player is 404", /isn't built yet|not found/i.test(await evaluate("document.body.textContent")));
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
