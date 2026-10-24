// Drives headless Edge via CDP through the hidden posting board with the QA accounts in web/.env.local
// (free, member, creator linked to "stefan", admin; creators get the same board as admins). Needs BOARD_PATH set and DEV_VIEWER unset.
// Checks who gets in (everyone else sees the normal 404), then posts, schedules, rejects bad input and
// deletes again. Leaves nothing behind.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

// Test accounts and the board address live in web/.env.local, never in this file.
const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => /^(QA_\w+|BOARD_PATH|SUPABASE_SECRET_KEY)=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.QA_MEMBER_EMAIL || !env.QA_CREATOR_EMAIL || !env.QA_ADMIN_EMAIL || !env.BOARD_PATH) {
  console.log("FAIL  QA_* accounts or BOARD_PATH missing from .env.local"); edge.kill(); process.exit(0);
}
const BOARD = `/${env.BOARD_PATH}`;
const SITE_READS_DB = Boolean(env.SUPABASE_SECRET_KEY);

const go = async (path, wait = 3500) => { await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(wait); };
const url = () => evaluate("location.pathname");
const text = () => evaluate("document.body.textContent");
const is404 = async () => /This page isn.t built yet/.test(await text());
const pos = (expr) => evaluate(`(() => { const el=${expr}; if(!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const clickOn = async (expr, wait = 400) => { const p = await pos(expr); if (!p) return false; await click(p.x, p.y); await sleep(wait); return true; };
const button = (pattern) => `[...document.querySelectorAll('main button')].find(b=>${pattern}.test(b.textContent))`;
/** Types into a field found by its label text (focus + insertText, so React sees it). */
const typeIn = async (labelPattern, value) => {
  await evaluate(`(() => { const l=[...document.querySelectorAll('main label')].find(l=>${labelPattern}.test(l.textContent)); const el=l && (l.htmlFor ? document.getElementById(l.htmlFor) : l.querySelector('input,textarea')); el.scrollIntoView({block:'center'}); el.focus(); el.select?.(); })()`);
  await send("Input.insertText", { text: value });
};
/** Sets a datetime-local value the way React expects. */
const setDate = (value) => evaluate(`(() => { const el=document.querySelector('main input[type=datetime-local]'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(el,'${value}'); el.dispatchEvent(new Event('input',{bubbles:true})); })()`);
const waitFor = async (expr, ms = 12000) => { for (let t = 0; t < ms; t += 400) { if (await evaluate(expr)) return true; await sleep(400); } return false; };
const status = () => evaluate(`document.querySelector('[data-board-status]')?.dataset.boardStatus`);
const logIn = async (email, password) => {
  await send("Network.clearBrowserCookies");
  await go("/login");
  await evaluate(`document.querySelector('input[name=email]').focus()`); await send("Input.insertText", { text: email });
  await evaluate(`document.querySelector('input[name=password]').focus()`); await send("Input.insertText", { text: password });
  await clickOn(`document.querySelector('main form button[type=submit]')`, 6000);
};
const STAMP = Date.now().toString(36);

try {
  // ---- Who gets in
  await send("Network.clearBrowserCookies");
  await go(BOARD);
  check("logged out: board is a plain 404", await is404());
  await go(`${BOARD}/trading`);
  check("logged out: board pages are 404 too", await is404());
  await go("/lads-board-wrongpath1");
  check("wrong address: 404", await is404());

  await logIn(env.QA_MEMBER_EMAIL, env.QA_MEMBER_PASSWORD);
  await go(BOARD);
  check("member: board is a plain 404", await is404());

  // ---- Creator
  await logIn(env.QA_CREATOR_EMAIL, env.QA_CREATOR_PASSWORD);
  await go(BOARD);
  check("creator: board home opens", /What are we posting\?/.test(await text()));
  check("creator: same menu as an admin", await evaluate(`['Team','Site settings','Creators','Video collections'].every(n=>[...document.querySelectorAll('nav a')].some(a=>a.textContent.trim()===n))`));
  await go(`${BOARD}/team`);
  check("creator: Team page opens", /qa-creator@fclads\.test/.test(await text()));
  await go(`${BOARD}/settings`);
  check("creator: Settings page opens", await evaluate(`!!document.querySelector('input[name=currentPatch]')?.value`));

  // Bad input is refused with a plain message.
  await go(`${BOARD}/trading/new`);
  check("creator: author picker shown, like an admin", await evaluate(`[...document.querySelectorAll('main label')].some(l=>/^Posted by/.test(l.textContent))`));
  await clickOn(button("/^Publish$/"), 2500);
  check("empty post is refused", /Add a title\./.test(await text()));

  // Publish a free trading post.
  const title = `QA board post ${STAMP}`;
  await typeIn("/^Heading/", title);
  await typeIn("/^Text/", "QA test text from the board check.");
  await clickOn(button("/^Publish$/"), 500);
  check("publish saves", await waitFor(`/Saved\\./.test(document.body.textContent)`));
  check("new post gets its own address", await waitFor(`/\\/trading\\/[0-9a-f-]{36}$/.test(location.pathname)`), await url());
  check("status is Live", (await status()) === "Live", await status());
  const postPath = await url();
  if (SITE_READS_DB) {
    await go("/trading");
    check("live post shows on /trading", (await text()).includes(title));
  }

  // Schedule it for next year, then check it's off the site.
  await go(postPath);
  await setDate(`${new Date().getFullYear() + 1}-01-15T18:30`);
  check("future date: label changes to Scheduled", (await status()) === "Scheduled", await status());
  await clickOn(button("/Save changes/"), 500);
  check("scheduled date saved", await waitFor(`/Saved\\./.test(document.body.textContent)`));
  if (SITE_READS_DB) {
    await go("/trading");
    check("scheduled post is not on /trading yet", !(await text()).includes(title));
  }

  // The list shows it; then delete it.
  await go(`${BOARD}/trading`);
  check("list shows the post as Scheduled", await evaluate(`[...document.querySelectorAll('main li')].some(li=>li.textContent.includes(${JSON.stringify(title)}) && /Scheduled/.test(li.textContent))`));
  await go(postPath);
  await clickOn(button("/^Delete$/"));
  check("delete asks to confirm", /Delete for good\?/.test(await text()));
  await clickOn(button("/Yes, delete it/"), 500);
  check("deleted: back on the list", await waitFor(`location.pathname === ${JSON.stringify(`${BOARD}/trading`)}`), await url());
  check("post is gone", await waitFor(`!document.querySelector('main').textContent.includes(${JSON.stringify(title)})`));

  // Feed post: a tip as a draft, then delete.
  await go(`${BOARD}/feed/new`);
  await typeIn("/^Label/", "QA label");
  await typeIn("/^Tip/", `QA tip ${STAMP}`);
  await clickOn(button("/Save draft/"), 500);
  check("feed tip saved as draft", await waitFor(`/\\/feed\\/[0-9a-f-]{36}$/.test(location.pathname) && document.querySelector('[data-board-status]')?.dataset.boardStatus==='Draft' && /Saved\\./.test(document.body.textContent)`));
  await clickOn(button("/^Delete$/"));
  await clickOn(button("/Yes, delete it/"), 500);
  check("feed draft deleted", await waitFor(`location.pathname === ${JSON.stringify(`${BOARD}/feed`)}`), await url());

  // ---- Admin
  await logIn(env.QA_ADMIN_EMAIL, env.QA_ADMIN_PASSWORD);
  await go(BOARD);
  check("admin: board home opens with admin menu", await evaluate(`['Team','Site settings','Creators','Video collections'].every(n=>[...document.querySelectorAll('nav a')].some(a=>a.textContent.trim()===n))`));
  await go(`${BOARD}/team`);
  check("admin: Team lists the QA creator", /qa-creator@fclads\.test/.test(await text()));
  await go(`${BOARD}/settings`);
  check("admin: Settings shows the patch", await evaluate(`!!document.querySelector('input[name=currentPatch]')?.value`));
  await go(`${BOARD}/creators/stefan`);
  check("admin: creator profile opens", /Edit Stefan/.test(await text()));

  // A guide with blocks, published then deleted.
  await go(`${BOARD}/guides/new`);
  const guideTitle = `QA board guide ${STAMP}`;
  await typeIn("/^Title/", guideTitle);
  check("web address follows the title", await evaluate(`document.querySelector('input[name=slug]').value === ${JSON.stringify(`qa-board-guide-${STAMP}`)}`));
  await typeIn("/^Short description/", "QA guide description.");
  check("admin: author picker shown", await evaluate(`[...document.querySelectorAll('main label')].some(l=>/^Posted by/.test(l.textContent))`));
  await clickOn(button("/^Heading$/"));
  await clickOn(button("/^Paragraph$/"));
  await clickOn(button("/Members only from here/"));
  check("three blocks added", (await evaluate(`document.querySelectorAll('main button[aria-label^="Remove block"]').length`)) === 3);
  check("only one members-only marker", !(await evaluate(`!!${button("/Members only from here/")}`)));
  await evaluate(`document.querySelector('main input[aria-label="Heading"]').focus()`); await send("Input.insertText", { text: "QA section" });
  await evaluate(`document.querySelector('main textarea[aria-label="Paragraph"]').focus()`); await send("Input.insertText", { text: "QA paragraph." });
  await clickOn(button("/^Publish$/"), 500);
  check("guide published", await waitFor(`/Saved\\./.test(document.body.textContent) && /\\/guides\\/[0-9a-f-]{36}$/.test(location.pathname)`), await url());
  if (SITE_READS_DB) {
    await go(`/guides/qa-board-guide-${STAMP}`);
    check("guide page is live", (await text()).includes(guideTitle));
    await go(`${BOARD}/guides`);
    await clickOn(`[...document.querySelectorAll('main a')].find(a=>a.textContent.includes(${JSON.stringify(guideTitle)}))`, 3500);
  } else {
    await sleep(500);
  }
  await clickOn(button("/^Delete$/"));
  await clickOn(button("/Yes, delete it/"), 500);
  check("guide deleted", await waitFor(`location.pathname === ${JSON.stringify(`${BOARD}/guides`)}`), await url());
} catch (error) {
  check("script ran without errors", false, error.message);
}
// Leave the shared browser profile logged out for the next script.
await send("Network.clearBrowserCookies");
console.log(results.join(String.fromCharCode(10)));
ws.close(); edge.kill();
process.exit(0);
