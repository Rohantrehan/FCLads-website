// Drives headless Edge via CDP to test Home page interactions (auto-scroll + hard truth tabs).
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
const url = () => evaluate("location.pathname + location.search");
const pos = (expr) => evaluate(`(() => { const el=${expr}; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const typeInto = async (sel, text) => { const p = await pos(`document.querySelector('${sel}')`); await click(p.x, p.y); await send("Input.insertText", { text }); };
const submit = async () => { const p = await pos(`document.querySelector('form button[type=submit]')`); await click(p.x, p.y); await sleep(500); };
const errs = () => evaluate(`[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.name).join(',')`);
const statusText = () => evaluate(`document.querySelector('[role=status]')?.textContent ?? ''`);

try {
// ---- FC Lads+ page
await send("Page.navigate", { url: "http://localhost:3000/lads-plus" }); await sleep(3500);
const panelTitle = () => evaluate(`document.querySelector('#perk-panel h3')?.textContent`);
check("perk panel starts on guides & video series", /Every guide & video series/.test(await panelTitle() ?? ""), await panelTitle());
let p = await pos(`document.getElementById('perk-tab-trading')`);
await mouse(p.x, p.y); await sleep(800);
check("hover Trading brief shows its preview", /trading brief/i.test(await panelTitle() ?? ""), await panelTitle());
await mouse(5, 5); await sleep(600);
check("preview stays after leaving", /trading brief/i.test(await panelTitle() ?? ""), await panelTitle());
check("TFV not on page", !(await evaluate("document.body.innerText.includes('TFV')")));
p = await pos(`[...document.querySelectorAll('details summary')].find(s=>/Discord/.test(s.textContent))`);
await click(p.x, p.y); await sleep(300);
check("FAQ item opens", await evaluate(`[...document.querySelectorAll('details')].find(d=>/Discord/.test(d.textContent)).open`));
p = await pos(`document.querySelector('main a[href="/signup?plan=plus"]')`);
await click(p.x, p.y); await sleep(2500);
check("Join goes to sign-up with plan", (await url()) === "/signup?plan=plus", await url());

// ---- Sign up (plus)
check("plus sign-up heading", /Join FC Lads\+/.test(await evaluate("document.querySelector('h1').textContent")));
await submit();
check("empty sign-up flags all fields", (await errs()) === "name,email,password,terms", await errs());
check("no success message on errors", (await statusText()) === "");
await typeInto("input[name=name]", "TestLad");
await typeInto("input[name=email]", "not-an-email");
await typeInto("input[name=password]", "abc");
check("weak password shows strength", /Too short|Weak/.test(await evaluate("document.body.innerText")));
await submit();
check("bad email + short password flagged", (await errs()) === "email,password,terms", await errs());
await evaluate("document.querySelector('input[name=email]').select()");
await send("Input.insertText", { text: "test@example.com" });
await evaluate("document.querySelector('input[name=password]').select()");
await send("Input.insertText", { text: "Testpass123!" });
check("strong password rated", /Strength: (Good|Strong)/.test(await evaluate("document.body.innerText")));
const eye = await pos(`document.querySelector('[aria-label="Show password"]')`);
await click(eye.x, eye.y); await sleep(200);
check("show password reveals text", (await evaluate("document.querySelector('input[name=password]').type")) === "text");
p = await pos(`document.querySelector('input[name=terms]')`); await click(p.x, p.y);
await submit();
check("valid sign-up shows honest status", /isn.t switched on yet.*checkout/.test(await statusText()), await statusText());
check("no errors left", (await errs()) === "", await errs());

// ---- Log in
await send("Page.navigate", { url: "http://localhost:3000/login" }); await sleep(2500);
await submit();
check("empty login flags email + password", (await errs()) === "email,password", await errs());
await typeInto("input[name=email]", "test@example.com");
await typeInto("input[name=password]", "Testpass123!");
await submit();
check("valid login shows honest status", /isn.t switched on yet/.test(await statusText()), await statusText());
p = await pos(`[...document.querySelectorAll('button')].find(b=>/Discord/.test(b.textContent))`);
await click(p.x, p.y); await sleep(300);
check("Discord button explains it's not connected", /Discord isn.t switched on yet/.test(await statusText()), await statusText());
} catch (error) { results.push("ERROR  " + error.message); }
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
