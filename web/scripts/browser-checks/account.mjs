// Drives headless Edge via CDP to test the account pages. Mode (argv[3]): "public" (default) checks the
// sign-in gate; "member" needs DEV_VIEWER=member in web/.env.local and checks membership, the cancel dialog and billing.
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
const MODE = process.argv[3] ?? "public";

const html = () => evaluate("document.documentElement.outerHTML");
const key = (k, code) => send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: code === "Escape" ? 27 : 13 }).then(() => send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code }));
const dialogOpen = () => evaluate(`document.querySelector('dialog').open`);
const btn = (text) => `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)} && b.offsetParent!==null)`;

if (MODE === "public") {
  for (const path of ["/account/membership", "/account/billing"]) {
    await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(2500);
    const page = await html();
    check(`sign-in gate on ${path}`, page.includes("Log in to manage your account"));
    check(`no account data on ${path}`, !/4242|FL-2026-0628|LAD-2026|arjun_fc/.test(page));
  }
  await send("Page.navigate", { url: "http://localhost:3000/account" }); await sleep(2500);
  check("/account goes to membership", (await evaluate("location.pathname")) === "/account/membership");
} else {
  await send("Page.navigate", { url: "http://localhost:3000/account" }); await sleep(4000);
  check("/account goes to membership", (await evaluate("location.pathname")) === "/account/membership");
  check("Membership is current in menu", (await evaluate(`document.querySelector('nav[aria-label=Account] a[aria-current=page]')?.textContent`))?.startsWith("Membership"));
  check("plan card shows price and next payment", /\$29/.test(await body()) && /28 Oct 2026/.test(await body()));
  check("all 5 perks listed", (await evaluate(`document.querySelectorAll('section[aria-labelledby=included-heading] li').length`)) === 5);
  check("dialog closed at start", !(await dialogOpen()));

  let p = await pos(btn("Cancel membership"));
  await click(p.x, p.y); await sleep(400);
  check("cancel opens dialog", await dialogOpen());
  check("focus starts on Keep my membership", /Keep my membership/.test(await evaluate("document.activeElement.textContent")));
  await key("Escape", "Escape"); await sleep(300);
  check("Escape closes dialog", !(await dialogOpen()));
  check("focus returns to Cancel button", (await evaluate("document.activeElement.textContent")) === "Cancel membership");

  p = await pos(btn("Cancel membership"));
  await click(p.x, p.y); await sleep(400);
  await click(8, 8); await sleep(300);
  check("clicking outside closes dialog", !(await dialogOpen()));

  p = await pos(btn("Cancel membership"));
  await click(p.x, p.y); await sleep(400);
  p = await pos(btn("Yes, cancel membership"));
  await click(p.x, p.y); await sleep(400);
  check("confirm shows cancelled state", !(await dialogOpen()) && /Your membership ends on 28 Oct 2026/.test(await body()) && /Auto-renew off/.test(await body()));
  check("focus moves to Keep my membership", /Keep my membership/.test(await evaluate("document.activeElement.textContent")));
  p = await pos(btn("Keep my membership"));
  await click(p.x, p.y); await sleep(400);
  check("keeping restores active state", /Active membership/.test(await body()) && /Auto-renew on/.test(await body()));

  await send("Page.navigate", { url: "http://localhost:3000/account/billing" }); await sleep(4000);
  check("Billing is current in menu", (await evaluate(`document.querySelector('nav[aria-label=Account] a[aria-current=page]')?.textContent`)) === "Billing");
  check("card shown", /Visa ending 4242/.test(await body()));
  check("4 payments in table", (await evaluate(`document.querySelectorAll('table tbody tr').length`)) === 4);
  p = await pos(btn("Update card"));
  await click(p.x, p.y); await sleep(300);
  check("update card says it's not live yet", /Card changes arrive with payments/.test(await body()));
}
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
