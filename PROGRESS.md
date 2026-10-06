# FC Lads — Build Progress

> Living tracker. Updated at the end of every work session.
> Full analysis & architecture: [`FC_LADS_PROJECT_REPORT.md`](FC_LADS_PROJECT_REPORT.md)
> Designs (reference only): [`all_pages_design/`](all_pages_design/)

**Last updated:** 6 Oct 2026
**Current phase:** Frontend-first. Build 2–4 public pages with mock data, then decide hosting and answer the open questions.
**Next action:** Step 5b — Learn library page (`/learn`): search, category filters, featured guide, guide grid. Expand mock guides to the full set first. User to review the Home page.

---

## Decisions made

| Date | Decision |
|---|---|
| 2026-10-06 | Hosting (AWS vs Vercel), backend framework, database, auth and payments are **deferred** until 2–4 pages are built. Code must stay host-neutral (no Vercel- or AWS-only features). |
| 2026-10-06 | Start as a **single Next.js app in `web/`**. Move to a monorepo (`apps/web`, `apps/api`, …) when the backend starts. |
| 2026-10-06 | Stack for the frontend: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**, icons via **lucide-react** (replaces Google Material Symbols). npm as the package manager. |
| 2026-10-06 | Design tokens: Home page palette is the source of truth, plus gold / azure / iridescent / glass from `DESIGN.md`. All tokens live in `web/src/app/globals.css`. |
| 2026-10-06 | Mock data lives in `web/src/data/*` and is shaped like the future database tables. |

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
- ⬜ Expand guides to the full Learn library set; add feed posts

### Step 5 — First pages 🟡
Home sections (`components/home/`): Hero (fanned collectible cards), MetaPlayersSection (position filter, carousel, empty state), HardTruth, LearnSection, LadsPlusTeaser, MeetTheLads (+ `cards/CreatorTile`, `OpenSlotTile`), FeedPreview, MembershipCta (+ log-in strip). Checked at 1440px and 375px.

| Page | Design reference | Status |
|---|---|---|
| Home | `fc_lads_home_page` | ✅ built; feedback round 1 done (auto-scroll + interactive hard truth) |
| Learn library | `fc_lads_learn_free_guides_library` | ⬜ |
| Guide article | `fc_lads_guide_article_beat_the_high_press` | ⬜ |
| Meet the Lads (+ creator profile) | `fc_lads_meet_the_lads_creators`, `fc_lads_creator_profile_stefan` | ⬜ |

### Step 6 — Review checkpoint ⬜
- ⬜ Desktop + mobile (375px) review by user
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

## How to run locally

```bash
cd web
npm install        # first time only
npm run dev        # http://localhost:3000
npm run lint
npm run build
```

Pages so far: `/` (Home), `/design-system` (component preview). Every other nav link shows the styled 404 until built.
