// Drives headless Edge via CDP to test Squads: budget tabs, hover-and-stay pitch, copy code, upgrades.
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
await send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"], origin: "http://localhost:3000" });
const href = () => evaluate("location.pathname");
const dossier = () => evaluate(`document.getElementById('dossier-heading')?.textContent ?? ""`);
const chip = (name) => pos(`[...document.querySelectorAll('ul[aria-label^="Starting XI"] button')].find(b=>b.getAttribute('aria-label').includes(${JSON.stringify(name)}))`);

await send("Page.navigate", { url: "http://localhost:3000/squads" }); await sleep(3500);
check("hub lists 5 squads", (await evaluate(`document.querySelectorAll('#all-squads-heading ~ div article').length`)) === 5);
let p = await pos(`[...document.querySelectorAll('nav[aria-label="Squads by budget"] a')].find(a=>a.textContent.startsWith('100K'))`);
await click(p.x, p.y); await sleep(3000);
check("budget tab opens squad", (await href()) === "/squads/100k-hybrid", await href());
check("active tab marked", /^100K/.test(await evaluate(`document.querySelector('nav[aria-label="Squads by budget"] [aria-current=page]')?.textContent ?? ""`)));

await send("Page.navigate", { url: "http://localhost:3000/squads/50k-weekend-league-starter" }); await sleep(4500);
check("11 players on the pitch", (await evaluate(`document.querySelectorAll('ul[aria-label^="Starting XI"] button').length`)) === 11);
check("key player selected first", /Leo Silva/i.test(await dossier()), await dossier());
p = await chip("Omar Haddad");
await mouse(p.x, p.y); await sleep(400);
check("hover selects player", /Omar Haddad/i.test(await dossier()), await dossier());
await mouse(5, 5); await sleep(400);
check("selection stays after cursor leaves", /Omar Haddad/i.test(await dossier()), await dossier());
await evaluate(`[...document.querySelectorAll('ul[aria-label^="Starting XI"] button')].find(b=>b.getAttribute('aria-label').includes('Bruno Matos')).focus()`); await sleep(200);
check("keyboard focus selects", /Bruno Matos/i.test(await dossier()), await dossier());
check("goalkeeper shows keeper stats", /DIV/.test(await evaluate(`document.querySelector('aside[aria-labelledby=dossier-heading]')?.textContent ?? ""`)));
check("bench has 4 players", (await evaluate(`document.querySelectorAll('section[aria-labelledby=bench-heading] li').length`)) === 4);
p = await pos(`[...document.querySelectorAll('button')].find(b=>/Copy code/i.test(b.textContent))`);
await click(p.x, p.y); await sleep(400);
const clip = await evaluate(`navigator.clipboard.readText().catch(e=>'ERR '+e.message)`);
check("tactic code copied", clip === "FCL-50K-4231", clip);
check("still on squad page", (await href()) === "/squads/50k-weekend-league-starter", await href());
p = await pos(`document.querySelector('section[aria-labelledby=upgrade-heading] a[href="/players/oskar-brandt"]')`);
await click(p.x, p.y); await sleep(3000);
check("upgrade links to player", (await href()) === "/players/oskar-brandt", await href());
await send("Page.navigate", { url: "http://localhost:3000/squads/not-a-squad" }); await sleep(2500);
check("unknown squad is 404", /isn't built yet|not found/i.test(await evaluate("document.body.textContent")));
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
