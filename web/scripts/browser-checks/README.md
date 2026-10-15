# Browser checks

Quick end-to-end checks that drive a real (headless) Microsoft Edge through the Chrome DevTools
Protocol: they move the mouse, click, type and press keys, then read the page back.

```bash
cd web
npm run dev                                     # in another terminal
node scripts/browser-checks/home.mjs  ./.checks # 10 checks: hero creator cards, no Players/Squads links, hard-truth tabs
node scripts/browser-checks/learn.mjs ./.checks #  9 checks: search, categories, load more
node scripts/browser-checks/guide.mjs ./.checks #  5 checks: TOC, copy code, paywall link
node scripts/browser-checks/creators.mjs ./.checks # 7 checks: roster hover panel, TFV hidden, profile tabs
node scripts/browser-checks/collections.mjs ./.checks # 8 checks: tabs, path, episodes, next step
node scripts/browser-checks/plus-auth.mjs ./.checks # 18 checks: FC Lads+ perks/FAQ/Join, sign-up + log-in validation (talks to Supabase; sends no email)
node scripts/browser-checks/auth.mjs ./.checks      # 24 checks: real log in / log out with the QA test accounts (QA_* in .env.local): wrong password, ?next=, free plan + trial offer, members unlock posts, header states, reset pages
node scripts/browser-checks/feed.mjs ./.checks      # 10 checks: topic tabs, load more, locked trading targets not sent, trending links
node scripts/browser-checks/trading.mjs ./.checks   # 16 checks: date filters (default 7 days, today, yesterday, 3 days, custom, empty, bad value), image right of text, locked Lads+ posts not sent, tax calculator. Add `member` (DEV_VIEWER=member) to check members see full posts
node scripts/browser-checks/legal.mjs ./.checks     # 11 checks: /legal redirect, tabs, contents scroll-spy + jump, copy email, phone contents
node scripts/browser-checks/dashboard.mjs ./.checks         # 13 checks: members-only gate on all 6 tabs, no member data sent
node scripts/browser-checks/dashboard.mjs ./.checks member  #  9 checks (needs DEV_VIEWER=member in web/.env.local): tabs, filters, review tab preview note
node scripts/browser-checks/reviews.mjs ./.checks           # 24 checks: real gameplay review with the QA free/member/creator accounts (needs SUPABASE_SECRET_KEY to reset the QA member): access, send a match (no booking), change link, creator starts it, asks for a new link, member fixes it, review + plan sent, month used. Leaves nothing behind.
node scripts/browser-checks/board.mjs ./.checks             # 31 checks (+4 with SUPABASE_SECRET_KEY): hidden posting board with the QA member/creator/admin accounts and BOARD_PATH: 404 for everyone else, creator has no admin pages, publish / schedule / draft / delete, bad input refused, admin guide with blocks. Leaves nothing behind.
node scripts/browser-checks/account.mjs ./.checks            # 5 checks: sign-in gate on account pages, no account data sent
node scripts/browser-checks/account.mjs ./.checks member     # 17 checks (member mode): membership, cancel dialog (focus, Esc, outside click), billing
```

The argument is a folder for the temporary browser profile and screenshots (`.checks/` is git-ignored).
Edge path is hard-coded for Windows (`EDGE` constant). Each line prints `PASS` or `FAIL`.

`trading.mjs`'s date-filter counts assume the **sample content** ("today" = 12 Oct 2026). With the content
database connected (`SUPABASE_SECRET_KEY` in `.env.local`) the site uses the real date, so 4 of those counts
differ. Comment out that line to run the suites on the sample content.

The database rules behind the board are checked without a browser:

```bash
node scripts/security-checks/content.mjs   # 29 checks: visitors and members can't read or write content or images, creators only their own posts, admins everything but their own role
node scripts/security-checks/reviews.mjs   # 29 checks: gameplay review rules end to end (members only, one a month, one open, edit/cancel until started, creators only theirs or any-Lad, plan required)
```

These are a stop-gap. When the project grows, replace them with Playwright tests.

Run the scripts **one at a time** — each starts its own headless Edge on port 9333, and starting the next one before the previous browser has closed makes it print nothing.

## Phone overflow scan

Checks that pages don't scroll sideways at 375px (real mobile emulation). Pass page paths after the folder.
On Git Bash, prefix with `MSYS_NO_PATHCONV=1` so `/paths` aren't turned into Windows paths.

```bash
MSYS_NO_PATHCONV=1 node scripts/browser-checks/overflow.mjs ./.checks / /learn /lads-plus /login /signup
```

Prints `ok` per page, or `OVERFLOW` plus the elements sticking out and which section causes it.
