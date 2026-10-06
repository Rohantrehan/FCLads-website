# FC Lads — Build Progress

> Living tracker. Updated at the end of every work session.
> Full analysis & architecture: [`FC_LADS_PROJECT_REPORT.md`](FC_LADS_PROJECT_REPORT.md)
> Designs (reference only): [`all_pages_design/`](all_pages_design/)

**Last updated:** 6 Oct 2026
**Current phase:** Frontend-first. Build 2–4 public pages with mock data, then decide hosting and answer the open questions.
**Next action:** Step 3 — site layout: top nav (+ mobile menu) and footer, then start the Home page. User to review `/design-system` first.

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

### Step 3 — Site layout ⬜
- ⬜ Top nav (Learn, Players, Squads, Feed, Trading, Creators, FC Lads+, Log in) + mobile menu
- ⬜ Footer
- ⬜ Logo component

### Step 4 — Mock data 🟡
- ✅ Types in `src/types/index.ts`: Player, Creator, Guide, AccessTier, Position (FeedPost still to add)
- ✅ `src/data/creators.ts` (4 Lads), `guides.ts` (4 guides), `players.ts` (5 fictional players from the designs)
- ⬜ Expand guides to the full Learn library set; add feed posts

### Step 5 — First pages ⬜
| Page | Design reference | Status |
|---|---|---|
| Home | `fc_lads_home_page` | ⬜ |
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

## How to run locally

```bash
cd web
npm install        # first time only
npm run dev        # http://localhost:3000
npm run lint
npm run build
```

Pages so far: `/` (placeholder), `/design-system` (component preview).
