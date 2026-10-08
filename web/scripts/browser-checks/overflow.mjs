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

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true });
const pages = process.argv.slice(3);
for (const path of pages) {
  await send("Page.navigate", { url: "http://localhost:3000" + path }); await sleep(3000);
  const report = await evaluate(`(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const wide = [...document.querySelectorAll('body *')].filter(el => {
      const r = el.getBoundingClientRect();
      const parent = el.parentElement?.getBoundingClientRect();
      // report the outermost element that sticks out (its parent fits)
      return r.right > vw + 1 && r.width > 0 && (!parent || parent.right <= vw + 1);
    }).slice(0, 8).map(el => el.tagName.toLowerCase() + ' "' + (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 90) + '" right=' + Math.round(el.getBoundingClientRect().right));
    return { vw, sw, wide };
  })()`);
  console.log(path, "viewport", report.vw, "page width", report.sw, report.sw > report.vw ? "OVERFLOW" : "ok");
  if (report.sw > report.vw) for (const w of report.wide) console.log("   ", w);
  if (report.sw > report.vw) {
    const culprits = await evaluate(`(() => {
      const vw = document.documentElement.clientWidth;
      const out = [];
      const blocks = [...document.querySelectorAll('header, main > *, main > * > *, footer')];
      for (const el of blocks) {
        const prev = el.style.display; el.style.display = 'none';
        const fixed = document.documentElement.scrollWidth <= vw;
        el.style.display = prev;
        if (fixed) out.push(el.tagName.toLowerCase() + ' "' + (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 80) + '" id=' + (el.id || '-'));
      }
      return out;
    })()`);
    for (const c of culprits) console.log("    hiding fixes it:", c);
  }
}
ws.close(); edge.kill();
process.exit(0);
