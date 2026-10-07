# Browser checks

Quick end-to-end checks that drive a real (headless) Microsoft Edge through the Chrome DevTools
Protocol: they move the mouse, click, type and press keys, then read the page back.

```bash
cd web
npm run dev                                     # in another terminal
node scripts/browser-checks/home.mjs  ./.checks # 13 checks: carousel, hard-truth tabs
node scripts/browser-checks/learn.mjs ./.checks #  9 checks: search, categories, load more
node scripts/browser-checks/guide.mjs ./.checks #  5 checks: TOC, copy code, paywall link
node scripts/browser-checks/creators.mjs ./.checks # 7 checks: roster hover panel, TFV hidden, profile tabs
node scripts/browser-checks/collections.mjs ./.checks # 8 checks: tabs, path, episodes, next step
node scripts/browser-checks/plus-auth.mjs ./.checks # 18 checks: FC Lads+ perks/FAQ/Join, sign-up + log-in validation
```

The argument is a folder for the temporary browser profile and screenshots (`.checks/` is git-ignored).
Edge path is hard-coded for Windows (`EDGE` constant). Each line prints `PASS` or `FAIL`.

These are a stop-gap. When the project grows, replace them with Playwright tests.

Run the scripts **one at a time** — each starts its own headless Edge on port 9333, and starting the next one before the previous browser has closed makes it print nothing.

## Phone overflow scan

Checks that pages don't scroll sideways at 375px (real mobile emulation). Pass page paths after the folder.
On Git Bash, prefix with `MSYS_NO_PATHCONV=1` so `/paths` aren't turned into Windows paths.

```bash
MSYS_NO_PATHCONV=1 node scripts/browser-checks/overflow.mjs ./.checks / /learn /lads-plus /login /signup
```

Prints `ok` per page, or `OVERFLOW` plus the elements sticking out and which section causes it.
