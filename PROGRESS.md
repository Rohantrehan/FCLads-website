# FC Lads — Build Progress

> Living tracker. Updated at the end of every work session.
> Full analysis & architecture: [`FC_LADS_PROJECT_REPORT.md`](FC_LADS_PROJECT_REPORT.md)
> Designs (reference only): [`all_pages_design/`](all_pages_design/)

**Last updated:** 6 Oct 2026
**Current phase:** Frontend-first. ✅ The 4 planned public pages are built. Now at the **Step 6 review checkpoint**.
**Next action:** User to review Trading (`/trading`). Before that: Feed, Squads, Meta Players + player pages. Next design pages: Terms/Privacy, member dashboard, account/billing. Trading, Terms, member dashboard, account/billing. Earlier: members-only Learn + FC Lads+ page (`/lads-plus`) and Log in / Sign up (`/login`, `/signup`, `/signup?plan=plus`). Then: Lighthouse speed pass (recommended), more pages (Players, Squads, Feed, Trading, Terms/Privacy), or Step 7 (open questions, hosting, backend).

---

## Decisions made

| Date | Decision |
|---|---|
| 2026-10-06 | Hosting (AWS vs Vercel), backend framework, database, auth and payments are **deferred** until 2–4 pages are built. Code must stay host-neutral (no Vercel- or AWS-only features). |
| 2026-10-06 | Start as a **single Next.js app in `web/`**. Move to a monorepo (`apps/web`, `apps/api`, …) when the backend starts. |
| 2026-10-06 | Stack for the frontend: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**, icons via **lucide-react** (replaces Google Material Symbols). npm as the package manager. |
| 2026-10-06 | Design tokens: Home page palette is the source of truth, plus gold / azure / iridescent / glass from `DESIGN.md`. All tokens live in `web/src/app/globals.css`. |
| 2026-10-06 | Mock data lives in `web/src/data/*` and is shaped like the future database tables. |
| 2026-10-08 | **Order of work: finish the frontend design first.** Backend, real links (Loom/YouTube IDs, socials) and data come after. |
| 2026-10-08 | **All Learn content is FC Lads+ (paid).** Every guide and every collection is members-only, because the free videos are already on YouTube. Free tier = YouTube, meta players, squads, creators, public feed. |
| 2026-10-08 | **Collection videos are Loom (mostly) or unlisted YouTube**, played on the site by members only. Add per episode in `data/collections.ts` with `video: loom("<share id>")` or `video: youtube("<video id>")`. Video IDs are never sent to non-members (`lib/collectionAccess.ts`, `lib/guideAccess.ts`). |
| 2026-10-08 | Code is on GitHub: **https://github.com/Rohantrehan/FCLads-website** (`origin`, branch `main`). Push after each approved session. |

## Open questions (deferred — answer before the phase that needs them)

| # | Question | Needed before |
|---|---|---|
| 1 | Refund policy: 14-day guarantee or non-refundable? (designs conflict) | Payments (Phase 2) |
| 2 | Game & price data source; legal OK to show real players / EA card art? | Players, Squads, Trading pages |
| 3 | Annual plan? Will the $29 founder rate change? | Payments |
| 4 | Currencies: USD only, or GBP/EUR too? | Payments |
| 5 | Coach capacity for monthly reviews | Reviews feature |
| 6 | Premium video hosting: YouTube unlisted / Mux / AWS MediaConvert | Gameplay vault |
| 7 | Existing Discord server size & bot ownership | Discord integration |
| 8 | Who designs mobile layouts? (we are adapting desktop designs ourselves for now) | Ongoing |
| 9 | Do creators publish content themselves (CMS) or via staff? | CMS |
| 10 | Keep fake "telemetry" decoration (18MS, BUILD 28.1.0)? Remove "bots / glitch / exploit" wording? | Before launch |
| 11 | Hosting: all-AWS or Vercel for frontend? | After 2–4 pages |

---

## Roadmap & status

Legend: ✅ done · 🟡 in progress · ⬜ not started

### Step 1 — Project setup ✅
- ✅ Next.js app scaffolded in `web/` (TypeScript, Tailwind v4, ESLint, `src/` dir, `@/*` alias)
- ✅ Fonts self-hosted via `next/font`: Sora, Manrope, JetBrains Mono, Unbounded
- ✅ Design tokens + utilities in `globals.css` (`glass`, `bg-iridescent`, `bg-promo`, `skew-tag`, `text-hero`, `text-headline`, `text-label`, `tabular`, reduced-motion)
- ✅ Folder structure: `components/{ui,layout,cards}`, `data/`, `lib/`, `types/`
- ✅ `cn()` class helper (clsx + tailwind-merge), lucide-react icons
- ✅ Shield logo copied to `web/public/logo-shield.svg`
- ✅ Lint + production build pass
- ✅ Git repository initialised

### Step 2 — Design system components ✅
- ✅ `ui/Button` — variants: iridescent (master CTA), primary (green), glass, ghost, danger; sizes sm/md/lg; renders a Next `Link` when given `href`
- ✅ `ui/Badge` — `Badge` (tones: neutral, mint, azure, gold, danger, solid), `TierBadge` (FREE / LADS+), `CornerTag`, `SkewTag`
- ✅ `ui/FilterPills` — accessible radio group; active pill = skewed green parallelogram
- ✅ `ui/Panel` — `GlassPanel`, `SectionHeading` (eyebrow + title + description + action)
- ✅ `ui/DataBits` — `Trend` (▲/▼ %), `CoinPrice` (gold, compact option), `StatBar` (meter), `Avatar` (initials)
- ✅ `ui/Paywall` — FC Lads+ upsell block (presentation only; gating must be server-side)
- ✅ `cards/PlayerCard` — `CollectibleCard` (hero / gold / special frames) + `MetaPlayerCard` (ranking carousel, active glow)
- ✅ `cards/GuideCard` — thumbnail or pitch-lines placeholder, play icon for videos, FREE/LADS+ corner tag, author row, whole-card link
- ✅ `cards/CreatorCard` — FUT-style creator card with GAM/TAC/TRD/META, featured glow
- ✅ `layout/Logo` — inline shield SVG + wordmark
- ✅ `/design-system` preview page (noindex) — checked at 1440px and 375px, no horizontal overflow
- ✅ Utilities added: `scrollbar-none`; helpers `lib/format.ts` (numbers, compact, %, category labels)

### Step 3 — Site layout ✅
- ✅ `layout/SiteHeader` — sticky glass header, desktop nav with active state, FREE/LADS+ badges, Log in; phone/tablet menu (button with aria-expanded, Escape closes, closes on navigation, scroll lock); "Skip to content" link
- ✅ `layout/SiteFooter` — logo + tagline, footer nav, social icons, EA non-affiliation line (replaces the fake "SERVER: EU-CENTRAL / BUILD" text)
- ✅ `layout/SocialIcons` — generic icons as in the designs (lucide has no brand logos); real URLs still `#` in `lib/site.ts`
- ✅ `lib/site.ts` — single source for main nav, footer nav, social links
- ✅ `(site)` route group with shared layout (header + main + footer)
- ✅ Root `not-found.tsx` — styled "This page isn't built yet" 404 with header/footer (all nav links not built yet land here)
- ✅ `page-container` utility (16px phone gutter → 56px desktop)

### Step 4 — Mock data 🟡
- ✅ Types in `src/types/index.ts`: Player, Creator, Guide, AccessTier, Position (FeedPost still to add)
- ✅ `src/data/creators.ts` (4 Lads, with `highlight` stat), `guides.ts` (4 guides), `players.ts` (7 fictional players from the designs), `ladsPlus.ts` (price + 5 perks)
- ✅ Guides expanded to 16 across all categories (1 featured, 4 Lads+); `queryGuides()` mimics the future `GET /guides` API (category + search + limit)
- ⬜ Add feed posts (for the Feed page later)

### Step 5 — First pages ✅
Home sections (`components/home/`): Hero (fanned collectible cards), MetaPlayersSection (position filter, carousel, empty state), HardTruth, LearnSection, LadsPlusTeaser, MeetTheLads (+ `cards/CreatorTile`, `OpenSlotTile`), FeedPreview, MembershipCta (+ log-in strip). Checked at 1440px and 375px.

| Page | Design reference | Status |
|---|---|---|
| Home | `fc_lads_home_page` | ✅ approved by user (2026-10-07) |
| Learn library | `fc_lads_learn_free_guides_library` | ✅ approved by user (2026-10-07) |
| Guide article | `fc_lads_guide_article_beat_the_high_press` | ✅ approved by user (2026-10-07) |
| Meet the Lads (+ creator profile) | `fc_lads_meet_the_lads_creators`, `fc_lads_creator_profile_stefan` | ✅ approved by user (2026-10-07) |

### Step 6 — Review checkpoint 🟡
- ✅ Desktop + mobile review by user — **approved 2026-10-07** ("all things good and show perfect"): Home, Learn (Guides + Collections), Guide articles, Meet the Lads, creator profiles
- ⬜ Lighthouse performance pass
- ⬜ Optional preview deploy for the client

### Step 7 — Deferred decisions ⬜
- ⬜ Answer open questions with client
- ⬜ Choose hosting
- ⬜ Start backend phase (monorepo, DB, auth, Stripe)

### Later phases (from the report)
- ⬜ Phase 2: Payments, Lads+ gating, account pages, member dashboard, Discord role sync
- ⬜ Phase 3: Trading, Meta Players, Player detail, Squads, admin/CMS
- ⬜ Phase 4: Gameplay reviews (VOD upload, booking, coach dashboard)
- ⬜ Phase 5: Search, notifications, polls, gamepad shortcuts, mobile app

---

## Session log

### 2026-10-06 — Session 1
- Analysed all 26 design folders → wrote `FC_LADS_PROJECT_REPORT.md`.
- Agreed to defer hosting + open questions until 2–4 pages exist.
- Completed **Step 1 (project setup)**.
- Notes: `npm audit` reports 5 "high" issues in dev-only tooling (`braces` via build/lint deps) — not shipped to users; revisit on next dependency update.

### 2026-10-06 — Session 1 (continued)
- Completed **Step 2 (design system components)** + `/design-system` preview page.
- Started Step 4 (types + small mock data sets).
- Placeholders used instead of player/creator photos (licensing + real photos pending).
- Testing note: the Chrome extension cannot reach `localhost` on this PC. Visual checks are done with headless Edge. Headless Edge's minimum viewport is 496px, so phone width (375px) is tested by loading the page inside a 375px iframe.

### 2026-10-06 — Session 1 (continued, Step 3 + Home)
- Completed **Step 3 (site layout)** and built the **Home page**.
- Mobile fix learned: grids that switch to 12 columns on desktop need `grid-cols-1` on phones, otherwise a horizontal carousel inside stretches the column and pushes headings off-screen.
- Copy changes vs. design (to avoid unverifiable claims): "0hr Time Wasted / 100% In-Game Tested" → "No hours wasted / Tested in-game"; "30 MIN SLA" → "Patch day"; footer fake server/build text → EA disclaimer; "Glitched in 1.08" → "elite in 1.08".
- Mock values still hard-coded on Home: patch "1.08", week 28 (`app/(site)/page.tsx`).

### 2026-10-06 — Session 1 (continued, Home feedback round 1)
User feedback on Home → implemented:
- **Meta players carousel auto-scrolls** (`ui/AutoScrollRow`): seamless loop, stops on mouse hover, keyboard focus and touch (resumes 3s after touch), Pause/Play button (WCAG 2.2.2), stops off-screen, no auto-scroll with OS "reduce motion".
- **"The hard truth" 5 problems are interactive** (`home/HardTruth`, content in `data/hardTruth.ts`): hover previews the answer, click/tap/arrow keys pin it; green skewed bar slides to the active row; answer card animates out and in with word-by-word headline. Built as accessible ARIA tabs.
- Added dependency **`motion`** (v14, `motion/react`) for animations; `MotionConfig reducedMotion="user"` respects OS setting.
- Added `lib/useReducedMotion.ts` hook.
- Verified with an automated interaction test (headless Edge via DevTools protocol): 12/12 checks pass — scroll, hover-stop, resume, pause button, filter, hover preview, revert on leave, click pin, aria-selected, keyboard, skew kept.
- Bug found by the test and fixed: animated headline had no real spaces between words (screen readers/SEO read "Testedbeforeyouspend").

### 2026-10-06 — Home feedback round 2
- "Hard truth" is now **hover-only and sticky**: the answer changes where the cursor rests (120ms hover-intent, so sweeping across doesn't flash answers) and **stays** after the cursor leaves. No click-to-pin. Tap (phones) and arrow keys still work. Interaction test 13/13 pass.

### 2026-10-06 — Learn page
- Built **`/learn`** (`app/(site)/learn/page.tsx`, components in `components/learn/`):
  - Header: "Learn FC", patch badge, **search** (plain GET form → works without JS, shareable URLs) with popular terms and a clear button.
  - **Category nav**: sidebar with counts on desktop, horizontal pills on phones; empty categories hidden.
  - **Featured guide** (only on the unfiltered view) with Watch button and **Share** button (native share sheet on phones, copy link on desktop).
  - **Guide grid** (3/2/1 columns), Lads+ cards show a gold lock, **Pro-tier banner** after 6 cards, **Load more** (+9, keeps scroll position), empty state, Discord request widget.
  - All filter state lives in the URL: `?category=`, `?q=`, `?limit=`. Invalid values are ignored. Per-category page titles + canonical URLs for SEO.
- Home "Learn FC" row now shows only free, non-featured guides.
- Interaction test (headless Edge/CDP): **9/9 Learn checks pass** (count, load more, scroll kept, category filter + active state, search keeps category, results, clear search, deep link from Home chip). Home regression still 13/13.
- `/learn` renders on each request (reads URL filters). Fine now; add caching when the real API arrives.

### 2026-10-06 — Guide article page
- Built **`/guides/[slug]`** (`app/(site)/guides/[slug]/page.tsx`, components in `components/guide/`). All 16 guides **pre-built as static HTML** (`generateStaticParams`, `dynamicParams = false` → unknown slugs 404).
  - Breadcrumb, badges, title with green highlight words, author row, read time, date, Share.
  - `VideoFacade`: poster + play button, loads the **youtube-nocookie** player only on click. Shows "Video coming soon" until real YouTube IDs are added to `data/guides.ts` (`youtubeId`).
  - Body = **structured blocks** (`GuideBlock` type: p, section, steps, tip, controls, player) rendered by `GuideBlocks`. Content in `data/guideContent.ts` (full "Beat the high press", shorter "hybrid overload" and "FUT Champs first 10 games"); other guides show a "write-up coming soon" fallback.
  - Sidebar: **"In this guide"** with scroll-spy and locked sections, **players in this guide** with prices, **custom tactic code** with Copy button.
  - "Keep learning": 3 related guides (same category first). Article JSON-LD for Google.
- **Paywall is enforced on the server**: `lib/guideAccess.ts` (`server-only`) cuts blocks at `lockedFrom`; Lads+ guides lock from the start. `lib/viewer.ts` is a stub (`isMember: false`) — plug real auth in there later.
  - Verified in the production build: members-only text is absent from the HTML, the RSC payloads and all client JS. Only a deliberate one-paragraph teaser (≤180 chars) is sent.
- Added deps: `server-only`. Added `marco-velardi` to mock players.
- Browser checks: guide 5/5 (TOC, locked links, copy code + clipboard, scroll to paywall), 404 for unknown slug; Home 13/13 and Learn 9/9 still pass.
- **Browser check scripts saved to `web/scripts/browser-checks/`** (home, learn, guide) with a README, so they survive between sessions.

### 2026-10-06 — Meet the Lads + creator profiles (Step 5 complete)
- Built **`/creators`** (`app/(site)/creators/page.tsx`): hero with 3 stat tiles, **interactive roster** (`components/creators/CreatorRoster.tsx`) — resting the cursor on / tabbing to a card shows that creator in the detail panel (stays after leaving, same pattern as Home "hard truth"); click opens the profile. Phones: swipeable card row; tablet+: grid. Open-slot card links to `/creators/apply` (not built → 404). "One obsession" statement + Discord CTA.
- Built **`/creators/[slug]`** (4 profiles pre-built as static HTML): creator card, role/country/rank badges, bio, **audience stats** per platform, Ask-in-Discord + YouTube buttons, sticky quick-jump tabs, latest videos, **player picks with verdicts** (`PickCard`), all guides, **squads** (`SquadCard` + `FormationPitch` that draws any formation string), review CTA.
- New data: creator `audience`, `since`, `picks`, bios for Hobs/Wessam; `data/squads.ts` (4 squads); `getGuidesByAuthor()`.
- Real footballer in the design (Irene Paredes) replaced with fictional Darius Okonkwo.
- ⚠️ **Placeholder numbers**: follower counts for Hobs and Wessam, X/TikTok/Twitch counts, "1.2M+ total audience", start years — invented for layout. Need real numbers from the client before launch.
- Browser checks: creators 6/6 (hover panel, stays, click → profile, tabs jump below sticky bar). All suites: Home 13, Learn 9, Guide 5, Creators 6 = **33/33 pass**.

### 2026-10-07 — TFV hidden + Learn › Collections
**Client/user decisions:**
- **TFV Gaming hidden for now** (to be added back later). Implemented as `hidden: true` on the creator in `data/creators.ts` — remove that one line to bring him back. Hidden creators are filtered at the data level (`creators`, `guides`, `squads` exports), so every page updates automatically: Home "Meet the Lads" and `/creators` show 3 creators (Stefan first), `/creators/tfv-gaming` → 404, his **5 guides are hidden too** (option a; Learn now 11 guides, Stefan's "Beat the high press" became the featured guide via fallback), his squad hidden, Home "hard truth" problem 3 now credited to Hobs, `/creators` meta description built from the list.
- **Collections ≠ Guides, but both live under Learn.** Guides = single items by topic; Collections = ordered video series (YouTube playlists). Learn now has two tabs: **Guides** (`/learn`) and **Collections** (`/learn/collections`).
- **Only FC 27** collections for now (no FC 26/25/24). Names/descriptions rewritten in our own words from a reference channel's playlist list; no "School" branding, no external links (fifa.school, Futbin).

**Built:**
- `data/collections.ts`: 14 FC 27 collections (title, description, placeholder `videoCount`, badge, `pathStep`, matching guide category, first episodes; episodes link to guide pages when they exist). Types `Collection`, `CollectionEpisode`, `CollectionBadge`.
- `components/learn/LearnTabs.tsx` (Guides | Collections) on both pages.
- **`/learn/collections`**: header, **"Start here" path** (5 numbered steps: Start Here → Core Skills → Defending → Attacking → What's Working Now), grid of 14 playlist-style cards (`components/collections/CollectionCard.tsx`, `LearningPath.tsx`).
- **`/learn/collections/[slug]`** (14 pages, static): breadcrumb, playlist thumb, badges incl. "Step N of 5", Play first video / Open on YouTube, path with current step highlighted, ordered video list (guide links or YouTube), "+N more on YouTube", **Next in the path**, related guides from the matching category, more collections.
- Placeholders: video counts are from the reference list; YouTube links go to the channel until real playlist IDs are added (`youtubePlaylistId`).
- Browser checks: new `collections.mjs` 8/8; Learn 9/9 and Creators 7/7 updated for TFV hidden; Home 13/13; Guide 5/5.

### 2026-10-07 — FC Lads+ pricing page + Log in / Sign up
- **`/lads-plus`** (`app/(site)/lads-plus/page.tsx`, components in `components/plus/`): hero with price box + decorative membership card; **"Your membership includes"** perk list + preview panel (hover-and-stay, keyboard arrows, tap on phones); benefit rows for Private Discord, Creator access (from the visible creators list, so TFV stays hidden), Weekly trading brief (with educational disclaimer), Monthly gameplay review (3 steps + example coach note); "One membership" summary; **Free vs FC Lads+ table**; **FAQ** (native `<details>`, works without JS).
  - Left out / softened on purpose (open client questions): "14-day refund guarantee", "2,418 active champions / +4 WL wins", "review within 48 hours", specific payment methods (FAQ just says card via a secure provider).
  - All "Join FC Lads+" buttons on this page go to **`/signup?plan=plus`**.
- **Log in / Sign up** (`app/(auth)/` with a focused layout: logo + "Back to site", no full nav):
  - `/login`: email, password (show/hide), stay signed in, forgot-password link (`/forgot-password`, not built), Google + Discord buttons.
  - `/signup`: display name, email, password with **live strength meter**, terms + privacy checkbox. With `?plan=plus`: "Join FC Lads+ — step 1 of 2", plan box, "Create account & continue".
  - **No backend yet:** forms validate in the browser only; on a valid submit (or Google/Discord click) they show an honest "isn't switched on yet — nothing was sent or saved" message. Replace `handleSubmit` in `components/auth/LoginForm.tsx` / `SignupForm.tsx` when auth is built.
  - Bug found by tests and fixed: field errors now clear as soon as you edit that field (previously the password error hid the strength meter until the next submit).
- Phone fix: the comparison table pushed the page sideways and hid the FC Lads+ column at 375px; rebuilt to fit (narrow columns, shorter header on phones).
- New check scripts: `plus-auth.mjs` (18/18) and **`overflow.mjs`** (real 375px emulation; finds what makes a page scroll sideways). All suites pass: Home 13, Learn 9, Guide 5, Creators 7, Collections 8, Plus/Auth 18 = **60/60**; no sideways scrolling on 10 key pages.

### 2026-10-08 — Learn is members-only + Loom / unlisted YouTube videos
- Pushed the project to GitHub (`origin` = github.com/Rohantrehan/FCLads-website).
- Every guide is now `access: "plus"`: title, excerpt, intro and section names stay public as a preview; body, video and tactic code are members-only.
- Types: new `VideoSource { provider: "loom" | "youtube"; id }`. `Guide.youtubeId` became `Guide.video`; `CollectionEpisode.video` added; `Collection.youtubePlaylistId` removed (no public playlists).
- `VideoFacade` plays Loom (`loom.com/embed`) and YouTube (`youtube-nocookie`) videos, with a locked "FC Lads+ members only" state.
- Collection pages: "Join FC Lads+ to watch" / Log in buttons; new `CollectionPlayer` (player + episode list; members click an episode and it plays; non-members see locked titles); paywall; Lads+ tag on collection cards.
- Copy updated everywhere that said "free guides" (Home, Learn, Collections, FC Lads+ compare table + FAQ, perks, login, metadata).
- Tests: collections (13), guide (5) and plus-auth (18) updated, all pass; learn 9, home 13, creators 7 pass; no sideways scroll at 375px. Member view tested by temporarily switching `getViewer()` to member (Loom + YouTube embeds play, episode switching works), then reverted.
- ⚠️ Placeholder: no real Loom / YouTube IDs yet, so members would see "Video coming soon".

### 2026-10-08 — Meta Players + player detail pages
- **`/players`** (dynamic): header with ranking week, position sidebar with counts (phone: swipe pills), search (GET form), budget pills with counts, sort dropdown (works without JS), **top-3 podium**, ranking table (phone: stacked list), patch-impact note, **pro pick of the week** (Hobs → Kofi Mensah), **patch nerfs** card. Goalkeepers show an honest "rankings are coming" state.
- **Paywall:** everyone sees ranks 1–10 of any view; the rest is FC Lads+. Only the *count* of locked rows is sent to non-members (`lib/playerAccess.ts`, server only).
- **`/players/[slug]`** (static, 32 pages): card + face-stat bars + facts (weak foot, skill moves, height, foot, body type, AcceleRATE), **the Lads' verdict** (public creator picks + in-depth review locked for non-members; reviews live in server-only `data/playerReviews.ts`), usage tiles, **price chart** (7D/14D/30D, crosshair tooltip, arrow keys, screen-reader table), all 20+ attributes, PlayStyles, chemistry styles, budget alternatives, guides featuring the player.
- Data: 32 fictional players across all outfield positions (`data/players.ts`); `metaRank` worked out per position group from `metaScore`. New `data/meta.ts` (patch, week, pro pick, nerfs) now also used by Home/Learn. Shared position groups in `lib/positions.ts` (Home carousel uses them too).
- ⚠️ Placeholders: all players, stats, prices, match counts, win rates and price history are invented (price history is generated in `lib/priceHistory.ts`). Real data needs the game-data source decision (open question).
- Left out from the design: "Ranked ahead of Mbappé & Haaland" and other real-player names, "LIVE OPTA STATS FEED", server/build telemetry, the "Free tier / Lads+ preview" toggle.
- Tests: new `players.mjs` (22) pass; home 13, learn 9, guide 5, collections 13, creators 7, plus-auth 18 pass; no sideways scroll at 375px. Test scripts now resolve the output folder to an absolute path (Edge rejects a relative profile path), and lint ignores `.checks/`.

### 2026-10-08 — Squads
- Meta Players top-3 cards simplified after user feedback (rating tile, full name, 3 stats, 2-line verdict, price + View; whole card clickable).
- **`/squads`**: header, **budget tabs** (50K · 100K · 250K · 500K · 1.5M, each links to that squad), grid of squad tiles (budget, creator, formation, rating, note, mini pitch, cost), "how we build squads" strip.
- **`/squads/[slug]`** (static, 5 pages): summary panel (tier, record, creator, squad rating, chemistry, total cost split XI/bench, league & nation links, **custom tactic code** copy, breakdown guide link with Lads+ lock), **vertical pitch** with the starting XI (`lib/formations.ts`: 4-2-3-1, 4-3-2-1, 4-4-2, 4-3-3) and a **hover-and-stay player panel** (stats, PlayStyles, chem style, verdict, link), bench, "why this squad works" + custom tactics, **upgrade path**, more squads. Phones: pitch first, then player panel, then summary.
- Data: `Squad` type extended (lineup with chem styles, bench with roles, reasons, upgrades, tactics, tactic code). 5 visible squads (Stefan 50K + 500K, Hobs 100K + 1.5M, Wessam 250K); TFV's squad stays hidden. Costs are worked out from player prices. 14 cheap "budget squad" players added (no meta score, so not in the meta ranking). Goalkeepers show DIV/HAN/KIC/REF/SPD/POS (`statLabels` in `lib/positions.ts`).
- Design changes: "Copy squad code" became "Copy tactic code" (FC has tactic share codes, not squad codes); controller hints, "Verified WL rank 1 ready" and server/build labels left out.
- ⚠️ Placeholders: squads, records, tactic codes and prices are invented.
- Tests: new `squads.mjs` (14) pass; all other suites pass (home 13, learn 9, guide 5, collections 13, creators 7, plus-auth 18, players 22); no sideways scroll at 375px.

### 2026-10-08 — The Feed
- **`/feed`** (dynamic): header with "N new posts today", **topic tabs** with counts (All, Gameplay, Players, Trading, Updates, FUT Champs, Squads; `?topic=`), posts newest first, **Load more** (`?limit=`), sidebar with Free vs FC Lads+, **Trending this week**, Follow the Lads.
- **7 post types** (`FeedPost` union in `types`, data in `data/feed.ts`): video clip (YouTube facade + "Full breakdown (Lads+)" guide link), player verdict, patch update, **trading targets** (FC Lads+: non-members get 2 targets + a "1 more target" note; the locked price is never sent — `lib/feedAccess.ts`), squad, tip, poll (results only; "voting opens when accounts are switched on").
- Layout: videos and polls take the full width; runs of smaller posts pack into two balanced columns (no gaps). Phones: one column.
- Footer now also links Squads and Feed.
- Design changes: "Unread only" and bookmark buttons left out (need accounts); real footballer names in the trading card replaced with our fictional players; "Engine Rev", server/build labels and controller hints left out.
- ⚠️ Placeholders: all posts, view counts, likes and poll votes are invented; "Watch on YouTube" links go to "#" until the channel URL is known.
- Tests: new `feed.mjs` (10) pass; all other suites pass; no sideways scroll at 375px.

### 2026-10-08 — Trading
- **`/trading`** (one page; the server picks the view from `getViewer()`):
  - **Public view:** free weekly market note (Wessam) with action/risk/window, "cards to watch", a **free tax calculator** (5% EA tax, profit, break-even price; client-side), rising and falling players (from player trends), the **locked weekly brief** (section titles + upsell only), disclaimer.
  - **Member view:** brief header (dates, author, read time), what we're watching, **buy and sell targets** (confidence, now vs sell-at, reason), upcoming events calendar, **market trends** chart (FC Lads market index, 14 days, notes on key days), players to monitor; sidebar with trading Discord, tax calculator, past briefs.
- The brief lives in server-only `data/tradingBrief.ts` and is only rendered for members. `PriceChart` now also takes `ranges`, `unit: "index"` and day `notes`.
- Design changes: real footballer names replaced with our fictional players; "global market cap", "tax index", "Index 100: 1,842", "1,420 members active", controller hints and server labels left out; "Live fodder matrix" tool skipped for now.
- ⚠️ Placeholders: market note, brief, targets, events and the market index are invented.
- Tests: new `trading.mjs` (6) pass; member view checked by temporarily switching `getViewer()` to member (screenshots), then reverted; all other suites pass; no sideways scroll at 375px.

### Session: added creator Lizzy (2026-10-09)
- New creator profile **Lizzy** (`/creators/lizzy`, Australia) in `web/src/data/creators.ts`. Shows on the roster, home "Meet the Lads", FC Lads+ creator section and her own profile. Roster now shows 4 creators + the open slot (fills the 5-column row).
- ⚠️ Placeholder: Lizzy's role ("Content Creator"), card ratings, bio, start year and social links (`#`) are invented. No guides, squads or picks yet, so her profile shows only the header and review banner. Get real details from Lizzy/client.
- Tests: creators, home pass; no sideways scroll at 375px.

## How to run locally

```bash
cd web
npm install        # first time only
npm run dev        # http://localhost:3000
npm run lint
npm run build
```

Pages so far: `/` (Home), `/learn` (guides), `/learn/collections` + 14 collection pages, `/guides/[slug]` (11 visible guides), `/creators` (Meet the Lads), `/creators/[slug]` (4 visible profiles), `/lads-plus` (FC Lads+), `/login`, `/signup`, `/design-system` (component preview). Every other nav link shows the styled 404 until built.
