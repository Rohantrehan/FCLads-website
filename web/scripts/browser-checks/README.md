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
```

The argument is a folder for the temporary browser profile and screenshots (`.checks/` is git-ignored).
Edge path is hard-coded for Windows (`EDGE` constant). Each line prints `PASS` or `FAIL`.

These are a stop-gap. When the project grows, replace them with Playwright tests.

Run the scripts **one at a time** — each starts its own headless Edge on port 9333, and starting the next one before the previous browser has closed makes it print nothing.
