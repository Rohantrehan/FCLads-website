// Drives headless Edge via CDP to test real log in / log out against Supabase, with the QA test accounts
// from web/.env.local (free + trialing member). Needs DEV_VIEWER unset. Sends no emails.
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
import { readFileSync } from "node:fs";

// Test accounts live in web/.env.local (QA_* lines), never in this file.
const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => /^QA_\w+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.QA_FREE_EMAIL || !env.QA_MEMBER_EMAIL) { console.log("FAIL  QA_* test accounts missing from .env.local"); edge.kill(); process.exit(0); }

const go = async (path, wait = 3000) => { await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(wait); };
const pos = (expr) => evaluate(`(() => { const el=${expr}; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const typeInto = async (sel, text) => { await evaluate(`document.querySelector('${sel}').focus()`); await send("Input.insertText", { text }); };
const submit = async (wait = 500) => { const p = await pos(`document.querySelector('main form button[type=submit]')`); await click(p.x, p.y); await sleep(wait); };
const errs = () => evaluate(`[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.name).join(',')`);
const note = () => evaluate(`document.querySelector('main [role=alert], main [role=status]')?.textContent ?? ''`);
// textContent, not innerText: innerText follows CSS uppercase.
const text = () => evaluate("document.body.textContent");
const headerAccount = () => evaluate(`[...document.querySelectorAll('body > header a, header[class] a')].map(a=>a.textContent.trim()).find(t=>/^(Log in|.My Lads[+]|.Account)$/.test(t)) ?? [...document.querySelectorAll('header a')].map(a=>a.textContent.trim()).join('|')`);
const logIn = async (email, password, next = "") => {
  await go(`/login${next}`);
  await typeInto("input[name=email]", email);
  await typeInto("input[name=password]", password);
  await submit(6000);
};
const logOutFromAccount = async () => {
  await go("/account/membership");
  const p = await pos(`[...document.querySelectorAll('nav[aria-label=Account] button')].find(b=>/Log out/.test(b.textContent))`);
  await click(p.x, p.y); await sleep(5000);
};

try {
  // ---- Signed out
  await go("/");
  check("signed out: header shows Log in", (await headerAccount()) === "Log in", await headerAccount());
  await go("/auth/confirm?code=not-a-real-code", 4000);
  check("bad email link goes to login with a notice", (await url()) === "/login?error=link" && /expired/.test(await note()), `${await url()} ${await note()}`);

  // ---- Wrong password
  await logIn(env.QA_FREE_EMAIL, "Not-the-password-1");
  check("wrong password: stays on login", (await url()).startsWith("/login"), await url());
  check("wrong password: plain error", /don.t match/.test(await note()), await note());

  // ---- Free account
  await logIn(env.QA_FREE_EMAIL, env.QA_FREE_PASSWORD, "?next=/account/membership");
  check("free login follows ?next=", (await url()) === "/account/membership", await url());
  check("free: header shows Account", /Account$/.test(await headerAccount()), await headerAccount());
  check("free: plan is Free with trial offer", /Current plan\s*Free/.test(await text()) && /Start 14-day free trial/.test(await text()));
  check("free: shows their name and email", (await text()).includes("QA Free") && (await text()).includes(env.QA_FREE_EMAIL));
  check("free: no dashboard link in account menu", !(await evaluate(`!!document.querySelector('nav[aria-label=Account] a[href="/dashboard"]')`)));
  await go("/account/billing");
  check("free: billing says no payments", /No payments yet/.test(await text()));
  check("free: no mock card or invoices", !/4242|LAD-2026/.test(await evaluate("document.documentElement.outerHTML")));
  await go("/trading?range=3d");
  check("free: FC Lads+ trading posts stay locked", !(await evaluate("document.documentElement.outerHTML.includes('buying 86s under 3,000')")));
  await go("/dashboard");
  check("free: dashboard is members-only", !/Welcome back/.test(await text()));
  await go("/login", 4000);
  check("signed in free: /login goes to their account", (await url()).startsWith("/account"), await url());
  await logOutFromAccount();
  check("log out goes home", (await url()) === "/", await url());
  check("after log out: header shows Log in", (await headerAccount()) === "Log in", await headerAccount());
  await go("/account/membership");
  check("after log out: account is gated", /Log in to manage your account/.test(await text()));

  // ---- Member (trialing)
  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD);
  check("member login lands on dashboard", (await url()) === "/dashboard", await url());
  check("member: dashboard welcomes them by name", /Welcome back,\s*QA Member/.test(await text()));
  check("member: header shows My Lads+", /My Lads[+]$/.test(await headerAccount()), await headerAccount());
  await go("/trading?range=3d");
  check("member: FC Lads+ trading posts unlocked", await evaluate("document.body.innerText.includes('buying 86s under 3,000')"));
  await logOutFromAccount();
  check("member log out goes home", (await url()) === "/" && (await headerAccount()) === "Log in", await headerAccount());

  // ---- Password reset pages (no email is sent)
  await go("/forgot-password");
  await typeInto("input[name=email]", "not-an-email");
  await submit();
  check("forgot password: bad email flagged", (await errs()) === "email", await errs());
  await go("/reset-password");
  check("reset page without a link asks for one", /Send me a reset link/.test(await text()));
} catch (error) { results.push("ERROR  " + error.message); }
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
