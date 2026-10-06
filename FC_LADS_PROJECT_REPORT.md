# FC LADS: Project Analysis & Technical Architecture Report

> **Status:** Research and planning only. No website code written yet.
> **Prepared:** 6 Oct 2026
> **Source analysed:** `all_pages_design/` (26 folders: 24 page/state designs, 1 design-system showcase, 1 logo) plus `apex_pitch_ui/DESIGN.md`

---

## 1. What FC Lads is (my understanding)

FC Lads is a **community and education platform for EA SPORTS FC Ultimate Team players**. It's run by a group of football-gaming YouTubers ("the Lads"). The tagline is **"Play Better. Together."** The pitch: *"Made by people who actually play the game."*

### The creators (the "Lads")
| Creator | Role | Region | Reach (per designs) |
|---|---|---|---|
| **TFV Gaming** | Founding creator, gameplay coach, pro circuit | UK | 520K+ subscribers |
| **Stefan** | Tactics analyst, Top 100 | Germany | 240K YT, 115K / 180K socials |
| **Hobs** | Pro competitor, "20-0 Rank 1" | NL/UK | n/a |
| **Wessam** | Market and trading lead, economist | Middle East | n/a |
| *Open slot* | "More Lads coming", creator application | n/a | n/a |

The designs claim a total audience of **1.2M+**, so traffic will arrive in **spikes**. When a creator posts a video and links the site, thousands of users can land at the same moment. The architecture has to be built for that.

### Business model: freemium plus one subscription
- **Free tier:** guides, the public feed, meta player rankings (partial), squads, and a public teaser of the trading brief.
- **FC Lads+ costs $29/month** (described as a "founder rate", cancel anytime). Members get five things:
  1. **Premium guides:** 82+ tactics, slider codes, frame-by-frame breakdowns
  2. **Private Discord:** VIP channels (#tactics-room, #show-your-squad, #ask-the-lads, #market-talk, #help)
  3. **Creator access:** Q&A and squad reviews with the Lads
  4. **Weekly Trading Brief:** published Monday 08:00 UTC, with buy/sell targets, an events calendar and a market index
  5. **Monthly 1-on-1 gameplay review:** the user uploads a match VOD, books a slot with a coach, and gets back a video analysis plus an action plan (1 credit per month, resets on the 1st)

The whole product is built around **free content that converts users to Lads+**. Almost every public page ends in a paywall or upsell block.

---

## 2. Design analysis

### 2.1 Design system: "Apex Pitch UI" (from `DESIGN.md`)
The theme is a **dark, premium esports and console look**. It feels like an FC game menu or a broadcast HUD.

| Token | Value / rule |
|---|---|
| Canvas | `#07090D` pitch black, with navy `#0B1220` and teal `#0A1F1C` radial glows |
| Primary | Athletic green `#2BD98B`, mint `#8FF0C9` / `#54F6A5` (focus, ratings, CTAs) |
| Azure | `#1E8BFF` (positions, tags, rank emblems) |
| Gold | `#D8B25A` (coin prices, legendary tiers, promos) |
| Master CTA | Iridescent gradient `#FFFFFF → #E4DCFF → #C9F5E6` with black text |
| Glass panels | `rgba(15,20,27,0.8)` + `backdrop-blur(20px)` + 1px `rgba(255,255,255,0.08)` border |
| Fonts | **Sora** (uppercase display headings), **Manrope** (body), **JetBrains Mono** (all numbers, stats, coins), **Unbounded** (logo) |
| Radius | Tight, 4–8px only. Technical rather than bubbly. |
| Signature shapes | `skewX(-12deg)` parallelogram tabs, shield-shaped player cards with chamfered corners |
| Focus state | `scale(1.03)` + mint glow, styled like a gamepad selection |
| Grid | 12 columns, built for 1440px+. 8 columns at 1024px, single column on mobile. |
| Icons | Google Material Symbols Outlined |
| Logo | SVG shield with the "FCL" monogram and a green→teal gradient (`fc_lads_shield_logo`) |

**Recurring UI patterns** that should become reusable components:
- FUT-style **player card** (OVR, position, nation, 6 stats: PAC/SHO/PAS/DRI/DEF/PHY)
- **Creator card** (styled like a player card, with GAM/TAC/TRD/META ratings)
- **Guide/video card** (FREE or LADS+ badge, duration, category, author avatar)
- **Squad pitch view** (formation with 11 player chips, chemistry 33/33)
- **Stat bars, price chips, trend arrows** (▲ +8.2% green / ▼ red)
- **Paywall block** ("Unlock with FC Lads+ $29/mo")
- **Console HUD decoration**: "L1 / R1 TAB SWITCH", "X SELECT", "EU-CENTRAL 18MS", "BUILD 28.1.0" footers

### 2.2 Page inventory (26 design folders)

#### A. Public / marketing
| # | Folder | Page | Key content |
|---|---|---|---|
| 1 | `fc_lads_home_page` | **Home** | Hero with 3D floating player cards. "This week's most broken players" carousel with position filter. "The hard truth" narrative. Free guides grid. $29 Lads+ block. Meet the Lads. Feed preview. Final CTA. |
| 2 | `fc_lads_fc_lads_membership` | **FC Lads+ pricing / sales page** (very long, 6230px) | 5 benefits each explained in depth. Mock Discord chat. Trading brief preview. Creator roster. Review flow. FAQ. |
| 3 | `fc_lads_meet_the_lads_creators` | **Meet the Lads** | Creator "squad card vault", featured creator detail, "submit application" slot |
| 4 | `fc_lads_creator_profile_stefan` | **Creator profile** (template) | Stats and socials. Tabs: Latest / Guides / Player Picks / Squads. Endorsed players with verdict quotes. Tested squads. Review CTA. |
| 5 | `fc_lads_design_system_showcase` | Design-system / alternate landing | Reference only. Shows the components in context. |

#### B. Content
| # | Folder | Page | Key content |
|---|---|---|---|
| 6 | `fc_lads_learn_free_guides_library` | **Learn: guides library** | Search. 8 categories with counts (Gameplay, Skill moves, Tactics, Meta players, FUT Champs, FC updates, Beginner, Squad building). Featured guide. Grid. "Load more". |
| 7 | `fc_lads_guide_article_beat_the_high_press` | **Guide article** (template) | Breadcrumbs, author, read time, embedded YouTube, numbered steps, pro-tip callouts, controller-input diagrams, embedded player card. **Partial paywall** halfway through the article. |
| 8 | `fc_lads_the_feed` | **The Feed** | Social-style stream of creator "pulses". Mixed post types: video, player verdict, patch notes, trading (locked), squad, quote, **poll**. Filters, trending top 5, follow links. |

#### C. Game data
| # | Folder | Page | Key content |
|---|---|---|---|
| 9 | `fc_lads_meta_players` | **Meta players** | Weekly ranking, filters by position, budget, tier and playstyle. Top 3 cards. Ranked table (#4–15) with matches, trend and price. Ranks #11–50 locked for Lads+. Pro pick. Patch nerfs list. |
| 10 | `fc_lads_player_detail_marco_velardi` | **Player detail** (template) | Card, all 29 attributes, weak foot / skills, body type, AcceleRATE, playstyles, chem-style recommendations, usage telemetry, **price history chart (7D/14D/30D/ALL)**, pro review, budget alternatives |
| 11 | `fc_lads_squads_50k_meta_starter` | **Squad builder view** (template) | Budget tabs (50K/100K/250K/500K/1.5M). Interactive pitch. Selected player dossier. Bench. Tactics profile (width/depth). "Copy squad code". Upgrade path. More squads. |

#### D. Trading
| # | Folder | Page | Key content |
|---|---|---|---|
| 12 | `fc_lads_trading_public_view` | **Trading (logged out / free)** | Free market summary, ticker, locked 5-panel brief → upsell |
| 13 | `fc_lads_trading_member_view` | **Trading (Lads+)** | Full Week-4 brief. What we're watching. Opportunities (buy/exit targets, confidence). Events calendar. 14-day index chart. Players to monitor. Tax calculator, fodder matrix. Past briefs archive. |

#### E. Auth
| # | Folder | Page |
|---|---|---|
| 14 | `fc_lads_log_in` | **Log in**: email + password, "stay signed in", Google, Discord |
| 15 | `fc_lads_sign_up` | **Sign up**: display name (gamertag), email, password strength, ToS consent, Google, Discord, upsell to Lads+ |

#### F. Member dashboard: "MY LADS+ / CONSOLE HQ" (separate app shell with its own top nav)
Header shows: **LADS+ ACTIVE**, **REVIEW: 1 LEFT**, the user avatar and division ("Arjun, Elite Div").

| # | Folder | Tab | Key content |
|---|---|---|---|
| 16 | `fc_lads_member_dashboard_my_feed` | **My Feed** (dashboard home) | "Welcome back, Arjun". WL form and trading reserve stats. Dispatch cards (new guide / brief / squad / Discord post). **Continue watching** with progress. This week in FC. Review status widget. |
| 17 | `fc_lads_member_dashboard_trading` | **Trading** | Full trading brief inside the dashboard |
| 18 | `fc_lads_member_dashboard_gameplay` | **Gameplay** | Premium "Tactical vault", 82 drills by category, current drill progress %, featured masterclass, downloadable sliders PDF, save to library |
| 19 | `fc_lads_member_dashboard_my_review` | **My Review** | 3-step flow: **Upload gameplay** (mp4, 284MB) → **Choose expert + calendar slot** → **Get plan**. Past reviews archive with action blueprint. Progress chart. |
| 20 | `fc_lads_member_dashboard_discord` | **Discord** | Connected as `arjun#1234`, online count, priority channels with live stats, creators online, server rules, voice lounge |
| 21 | `fc_lads_member_dashboard_creators` | **Creators** | Creator post stream (filter per creator), reactions, "Discuss in Discord", "Copy tactics code", scout radar (endorsed cards) |

#### G. Account & billing (inside the dashboard shell, left side nav: Profile / Membership / Billing / Connected accounts / Notifications / Log out)
| # | Folder | Page |
|---|---|---|
| 22 | `fc_lads_account_billing_membership` | **Membership**: plan, next payment, entitlements list, review quota, Discord link status, cancel link |
| 23 | `fc_lads_account_billing_billing` | **Billing**: card on file (Stripe), auto-renew, invoice history with PDF download, tax destination, currency |
| 24 | `fc_lads_account_billing_cancel_modal` | **Cancel modal**: retention screen listing what you lose, "Keep my membership" |

#### H. Legal / brand
| # | Folder | Page |
|---|---|---|
| 25 | `fc_lads_terms_of_service` | **Terms of Service**: 10 sections plus tabs for Privacy Policy and Trading & Market Disclaimer |
| 26 | `fc_lads_shield_logo` | Logo SVG |

### 2.3 Pages that are implied but NOT designed yet
These will be needed even for v1:
- Privacy Policy, Trading Disclaimer, Cookie policy (tabs exist on the ToS page)
- Forgot / reset password, email verification, OAuth callback / error
- Checkout success / welcome-to-Lads+ onboarding
- Account → **Profile**, **Connected accounts**, **Notifications** (in the nav, not designed)
- Squads index (all 24 blueprints), other positions on Meta Players
- Global search results, 404 / 500 / maintenance
- Creator application form
- **Coach-side tools**: a coach dashboard to see assigned reviews, watch uploaded VODs, upload the analysis video and write the action plan
- **Admin / CMS**: creators and staff publish guides, feed posts, trading briefs, players, squads and meta rankings

### 2.4 Problems and inconsistencies found in the designs
These are exports from **Google Stitch** (AI design tool). They are **visual references, not production code**:

1. **Tech in the exports isn't production-grade.** They use the Tailwind **CDN script**, inline configs per page, and all links are `href="#"`. **103 images are hotlinked from `lh3.googleusercontent.com`** (AI-generated placeholders). These must be replaced with our own licensed assets.
2. **Token drift between pages.** Colour values differ slightly page to page (e.g. `surface-container-lowest` is `#07090D` vs `#0c0e12`), and font loading varies. The login screenshot even renders in a fallback **serif** font. We need to build **one** token file from `DESIGN.md`.
3. **Mock data contradicts itself.** Patch "1.04" vs "1.08". Dates mix 2025 and 2026. The card on file is Visa 4242 on Billing but Mastercard 9012 in the cancel modal. Member counts vary (42.8K / 2,418 / 3,482 online). All of this becomes real data from the DB.
4. **Refund policy conflict.** The membership page says **"14-day refund guarantee"**, but the ToS says **"non-refundable once a billing cycle has processed"**. The business has to decide.
5. **Decorative "fake telemetry".** "EU-CENTRAL 18MS", "256-bit", "TICK: 60Hz", "BUILD 28.1.0", "PCI-DSS Level 1". We need to decide whether to keep these purely as decoration, make them real (e.g. a real Discord online count), or remove them. Fake latency numbers can look gimmicky.
6. **Gamepad hints** ("L1/R1 tab switch", "X select"). Nice touch. We can make them **real keyboard shortcuts** (Q/E to switch tabs, etc.) and add actual Gamepad API support later.
7. **Risky marketing and legal copy.**
   - "Trading bots", "automated market execution algorithms" and "transfer market sniping" appear in the ToS and showcase. **EA's terms ban automation**, so this wording should be removed. Keep it "educational analysis" (the disclaimer is already there).
   - "Glitch" / "exploit" wording, and claims like "98.4% WL winrate boost" and "1.2B coins generated", need real data or softening.
   - Some real footballers appear (Alisson, Kobel, Paredes, "ahead of Mbappé & Haaland") while others are fictional. **Player names, likenesses and card art are licensed by EA, clubs and FIFPro.** We need a legal decision on what can be shown. Using official EA card images is especially risky.
8. **Mobile is barely designed.** Everything is 1440px desktop. Mobile layouts must be designed during build. Most YouTube traffic is **mobile**, so this matters a lot.

---

## 3. Features → system modules

| Module | What it covers | Pages |
|---|---|---|
| **Identity & Auth** | Email/password, Google OAuth, Discord OAuth, sessions, roles (guest / free / member / creator / coach / admin) | Login, Sign up, Account |
| **Billing & Entitlements** | Stripe subscription $29/mo, invoices, card update, cancel/reactivate, VAT, webhooks → `is_member` flag | Membership, Billing, Cancel |
| **Content (CMS)** | Guides (article + video), categories, tags, authors, FREE/LADS+ gating, partial paywall, feed posts (many types), polls, reactions | Learn, Guide, Feed, Creators, Gameplay vault |
| **Creators** | Creator profiles, stats, socials, endorsements, applications | Meet the Lads, Creator profile |
| **Game Data** | Players, attributes, playstyles, chem styles, patches, weekly meta rankings, nerfs | Meta Players, Player detail |
| **Squads** | Squad blueprints, formation, 11 + 7 slots, tactics, budget tier, upgrade path, copy code | Squads |
| **Trading** | Weekly briefs (5 panels), opportunities, events calendar, market index time series, player price history, tax calculator, past briefs | Trading public/member, Player price chart |
| **Gameplay Reviews** | Monthly credit, VOD upload (large files), coach selection, availability calendar, booking, review delivery (video + action items), history | My Review, coach dashboard |
| **Discord Integration** | Link account, auto-assign and remove the Lads+ role, channel stats, creators online | Discord tab, Membership |
| **Engagement** | Watch progress ("continue watching"), saved library, notifications (email / in-app), polls | My Feed |
| **Admin** | Staff tools for everything above, moderation, metrics | (to design) |

---

## 4. Recommended tech stack

Guiding principles: **one language end to end (TypeScript)**, **SEO-first public pages**, **handles YouTube traffic spikes**, **everything managed in one AWS account**, and **a small team can actually maintain it**.

### 4.1 Frontend
| Choice | Why |
|---|---|
| **Next.js (App Router) + React + TypeScript** | SSR/SSG/ISR is critical. Guides, player pages and meta rankings are the **SEO traffic engine** (people Google "best 50K squad FC 27"). Server Components keep pages fast. |
| **Tailwind CSS v4** | The designs are already Tailwind. We port `DESIGN.md` tokens into one theme file. |
| **shadcn/ui + Radix primitives** | Accessible modals, tabs, dropdowns, restyled to Apex Pitch |
| **Framer Motion** | Card hovers, 3D tilt on hero cards, focus glows, page transitions |
| **Recharts or visx** | Price history and market index charts |
| **TanStack Query** | Client data fetching and caching in the dashboard |
| **React Hook Form + Zod** | Forms and validation (shared schemas with the backend) |
| **next/font** | Self-host Sora / Manrope / JetBrains Mono / Unbounded. Fixes the font inconsistency and is faster. |

### 4.2 Backend
**Recommendation: a modular monolith API in NestJS (Node.js + TypeScript)**, deployed separately from the frontend.

Why NestJS, and why a separate backend instead of putting everything inside Next.js API routes:
- The domain is large (billing, reviews, Discord, trading, data). NestJS **modules** map 1:1 to the modules in section 3, which keeps code organised as the team grows.
- Long-running work runs in background **workers** rather than serverless functions with time limits: Stripe webhooks, Discord bot, VOD processing, scheduled brief publishing, price imports.
- The same API can later power a **mobile app** (very likely for this audience) and the Discord bot.
- It's still TypeScript, so types are shared with the frontend.

| Layer | Choice |
|---|---|
| API framework | **NestJS** (REST + OpenAPI docs; GraphQL not needed initially) |
| ORM | **Prisma** (or Drizzle). Migrations, type-safe queries. |
| Validation | **Zod**, shared in a package between web and API |
| Background jobs | **BullMQ** on Redis: emails, webhooks, Discord role sync, Monday 08:00 brief release, monthly review-credit reset, cron imports |
| Auth | **Better Auth** (or Auth.js) with users stored in **our own Postgres**: email/password, Google, Discord. Avoids vendor lock-in and keeps "everything in one place". *Alternative: AWS Cognito, which is AWS-native but clunkier to customise.* |
| Payments | **Stripe Billing**: Checkout, Customer Portal (update card, invoices PDF), Stripe Tax (UK/EU VAT), webhooks → our DB. Founder-rate pricing via Stripe price IDs. |
| CMS | **Payload CMS** (TypeScript, runs on the **same Postgres**, self-hosted). Creators get a proper editor for guides, feed posts, briefs, squads and players, with roles and drafts / scheduled publish. *Alternative: Sanity (hosted, very good editor, but data lives outside AWS).* |
| Discord | **discord.js** bot as its own small service: assigns and removes the "Lads+" role on subscription events, reads guild member and online counts, channel activity |
| Search | Start with **Postgres full-text search**. Move to **Meilisearch / OpenSearch** when the guide and player catalogue grows. |
| Email | **AWS SES** (cheap) with React Email templates. *Alternative: Resend, which is easier to set up.* |
| Video | **Public guides:** embed **YouTube** (the creators' channels, which also helps their growth). **Premium videos and review VODs:** **Mux** (simple, signed playback, analytics) *or* the AWS-only route of **S3 + MediaConvert + CloudFront signed URLs**. |
| VOD uploads | Browser → **S3 multipart presigned upload** directly (284MB+ files never touch our servers) → S3 event → worker → transcode → notify coach |
| Booking | Own tables for coach availability and bookings. Send `.ics` invites / Google Calendar links. *Alternative: embed **Cal.com** to save time.* |

### 4.3 Database & storage
| Need | Choice |
|---|---|
| Main DB | **PostgreSQL** on **Amazon RDS** (or Aurora Serverless v2 for auto-scaling). Relational data fits perfectly: users ↔ subscriptions ↔ reviews ↔ creators ↔ content. |
| Time-series (prices, market index) | Same Postgres to start (partitioned tables). Add the TimescaleDB extension or a separate store only if the volume justifies it. |
| Cache / queues / rate limits | **Redis** on **Amazon ElastiCache** (or Valkey) |
| Files (images, VODs, PDFs, slider sheets) | **Amazon S3**, served through **CloudFront** |
| Analytics | **PostHog** (product analytics, funnels free → Lads+) + GA4 for marketing |
| Errors / monitoring | **Sentry** + **CloudWatch** logs and alarms |

### 4.4 Important: where does game data come from?
Player stats, meta rankings and **live transfer market prices** don't exist yet. **EA has no public API**, and scraping sites like FUTBIN / FUT.GG breaks their terms. Options:
1. **Manual / editorial (recommended for v1):** creators and staff enter players, rankings and briefs in the CMS, with **CSV import** for bulk updates. This matches the brand ("tested by the Lads").
2. **Licensed data partner:** pay a provider for player DB and price feeds, if one is available.
3. **Community-submitted prices:** later, with moderation.

**A business decision is needed before building the data features.**

---

## 5. Hosting & infrastructure (AWS)

### 5.1 Recommended AWS architecture

```
                         Users (mobile + desktop, traffic spikes from YouTube)
                                              │
                                   Route 53 (fclads.com DNS)
                                              │
                          CloudFront CDN  +  AWS WAF (bot / DDoS protection)
                     ┌────────────────────────┼─────────────────────────┐
                     │                        │                         │
              static assets / S3     Next.js web (ECS Fargate)     api.fclads.com
              images, VOD, PDFs       SSR + ISR cached at edge     NestJS API (ECS Fargate)
                                              │                         │
                                              └──────────┬──────────────┘
                                                         │
                          ┌───────────────┬──────────────┼──────────────┬───────────────┐
                          │               │              │              │               │
                    RDS PostgreSQL   ElastiCache     Worker service   Discord bot    Payload CMS
                    (Multi-AZ)       Redis           (BullMQ jobs)    (ECS task)     (admin.fclads.com)
                                                         │
                          External: Stripe · Discord API · Mux/MediaConvert · SES · YouTube · Sentry · PostHog
```

| AWS service | Purpose |
|---|---|
| **Route 53** | DNS for fclads.com, api., admin. |
| **CloudFront** | CDN. Caches public pages and assets globally (users are in UK, EU, Middle East, worldwide). This is what absorbs YouTube spikes. |
| **AWS WAF** | Rate limiting, bot protection, blocks scrapers on player and price pages |
| **ECS Fargate** | Runs containers for web, api, worker, discord-bot and cms. Auto-scales on CPU/requests. No servers to patch. |
| **ECR** | Docker image registry |
| **RDS PostgreSQL** | Main database, Multi-AZ in production, automated backups and point-in-time restore |
| **ElastiCache Redis** | Cache, sessions, rate limits, job queues |
| **S3** | Media, user uploads (VODs), invoices, backups |
| **SES** | Transactional emails (welcome, receipts, review booked, brief published) |
| **Secrets Manager** | Stripe keys, Discord token, DB passwords |
| **CloudWatch** | Logs, metrics, alarms |
| **EventBridge Scheduler** | Cron triggers (Monday brief, monthly credit reset) |
| **Infrastructure as Code** | **AWS CDK (TypeScript)** or **Terraform**, so the whole setup is versioned and reproducible |

**Region:** `eu-west-2` (London) or `eu-central-1` (Frankfurt). The audience and the company (FC LADS Media Ltd, London) are UK/EU-centred, and it simplifies GDPR.

### 5.2 Environments & CI/CD
- **3 environments:** `dev` → `staging` → `production`, each a separate AWS account or at least a separate VPC/stack.
- **GitHub + GitHub Actions:** lint, typecheck, test → build Docker → push to ECR → deploy to ECS (blue/green). Preview deploys for PRs.
- DB migrations run automatically in the pipeline (Prisma migrate).

### 5.3 Simpler alternative (if speed to market matters more than "all on AWS")
- **Frontend on Vercel** (best Next.js hosting, zero config, built-in edge caching), and **backend, DB and storage on AWS** as above.
- *Or* **SST** (OpenNext) to deploy Next.js serverlessly onto AWS Lambda + CloudFront.
- Trade-off: Vercel is fastest to ship but costs grow with traffic, and you'd have two vendors to manage.

### 5.4 Rough monthly cost (estimate only; depends heavily on traffic and video)
| Stage | Approx. AWS cost / month |
|---|---|
| Launch (small instances, single-AZ staging) | **$150 – $400** |
| Growth (Multi-AZ RDS, more Fargate tasks, heavy CDN) | **$800 – $2,500** |
| Plus | Stripe fees (~1.5–2.9% + fee per charge), Mux/video by minutes watched, Sentry/PostHog plans |

---

## 6. Core data model (first draft)

```
users ─┬─ accounts (oauth: google, discord)        creators ─┬─ creator_socials
       ├─ sessions                                            ├─ endorsements (player, quote)
       ├─ profiles (gamertag, platform, division)             └─ creator_applications
       ├─ subscriptions (stripe ids, status, period_end)
       ├─ invoices (mirror of Stripe)                content ─┬─ guides (type: article|video, access: FREE|PLUS,
       ├─ entitlements (is_member, review_credits)            │          body, paywall_break, patch_id)
       ├─ discord_links (discord_id, role_synced)             ├─ categories, tags
       ├─ watch_progress (guide_id, seconds, %)               ├─ feed_posts (type: video|verdict|patch|trade|squad|quote|poll)
       ├─ saved_items                                         ├─ polls, poll_options, poll_votes
       ├─ notifications                                       └─ reactions
       └─ review_requests ─┬─ vod_uploads (s3_key, size, status)
                           ├─ bookings (coach_id, slot_start, tz)        game data ─┬─ patches
                           └─ review_results (vod_url, action_items[])              ├─ players, player_attributes
coaches ── coach_availability                                                      ├─ playstyles, chem_styles
                                                                                   ├─ meta_rankings (week, position, rank, score)
trading ─┬─ trading_briefs (week, panels, publish_at, access)                      ├─ player_prices (time series)
         ├─ brief_opportunities (player, buy, exit, confidence)                    └─ squads ── squad_slots, squad_tactics
         ├─ market_events (date, title, action)
         └─ market_index_points (time series)
```

**Paywall rule:** gating is always enforced **on the server** (the API never sends locked content to free users). It's never just a blur in CSS.

---

## 7. Proposed folder structure (monorepo)

One repository, managed with **Turborepo + pnpm workspaces**, so frontend, backend and shared code live together and share types.

```
fclads/
├── apps/
│   ├── web/                        # Next.js (public site + member dashboard)
│   │   ├── app/
│   │   │   ├── (marketing)/        # home, lads-plus, creators, creators/[slug], legal/*
│   │   │   ├── (content)/          # learn, learn/[category], guides/[slug], feed
│   │   │   ├── (data)/             # players, players/[slug], squads, squads/[slug]
│   │   │   ├── trading/            # public + member view (same route, gated server-side)
│   │   │   ├── (auth)/             # login, signup, forgot-password, verify
│   │   │   ├── my-lads/            # MEMBER DASHBOARD shell (own layout + top nav)
│   │   │   │   ├── feed/  trading/  gameplay/  review/  discord/  creators/
│   │   │   ├── account/            # profile, membership, billing, connections, notifications
│   │   │   └── api/                # only small BFF routes (e.g. revalidate hooks)
│   │   ├── components/             # page-specific components
│   │   ├── lib/                    # api client, auth helpers, gating helpers
│   │   └── public/                 # logo, og-images, favicons
│   │
│   ├── api/                        # NestJS backend
│   │   └── src/modules/
│   │       ├── auth/  users/  billing/  entitlements/
│   │       ├── content/  creators/  feed/  polls/
│   │       ├── players/  squads/  meta/  patches/
│   │       ├── trading/  reviews/  bookings/  uploads/
│   │       ├── discord/  notifications/  search/  admin/
│   │       └── webhooks/           # stripe, mux, s3 events
│   │
│   ├── worker/                     # BullMQ job processors (emails, sync, cron jobs)
│   ├── discord-bot/                # discord.js bot (role sync, stats)
│   └── cms/                        # Payload CMS admin (admin.fclads.com)
│
├── packages/
│   ├── ui/                         # Apex Pitch design system: Button, GlassPanel, PlayerCard,
│   │                               #   CreatorCard, GuideCard, SquadPitch, StatBar, PriceChip,
│   │                               #   Paywall, SkewTab, HudFooter ...
│   ├── tokens/                     # design tokens from DESIGN.md → Tailwind theme + CSS vars
│   ├── db/                         # Prisma schema, migrations, seed data
│   ├── validation/                 # shared Zod schemas
│   ├── types/                      # shared TS types / API contracts
│   ├── emails/                     # React Email templates
│   └── config/                     # eslint, tsconfig, prettier presets
│
├── infra/                          # AWS CDK / Terraform (VPC, ECS, RDS, Redis, S3, CloudFront, WAF)
├── docs/
│   ├── designs/                    # ← current all_pages_design/ moves here (reference)
│   ├── DESIGN.md                   # design system spec
│   └── FC_LADS_PROJECT_REPORT.md   # this report
├── .github/workflows/              # CI/CD
├── docker-compose.yml              # local Postgres + Redis + Mailpit for dev
└── turbo.json / pnpm-workspace.yaml
```

---

## 8. Non-functional requirements ("big level" checklist)

| Area | Plan |
|---|---|
| **Performance** | ISR + CDN for all public pages, image optimisation (AVIF/WebP), self-hosted fonts. Target Lighthouse 90+ on mobile and LCP < 2.5s. The heavy glass blur effects must be tested on low-end phones. |
| **Traffic spikes** | CDN absorbs read traffic, Fargate auto-scaling, Redis cache on hot endpoints, load test (k6) before launches |
| **SEO** | Clean URLs (`/players/marco-velardi`, `/guides/beat-the-high-press`), metadata, Open Graph images per guide/player (dynamic OG), sitemap, JSON-LD (Article, VideoObject, FAQ) |
| **Security** | OWASP basics, rate limiting, WAF, CSRF-safe sessions, Stripe handles cards (we never store card data → PCI SAQ-A), signed URLs for premium media, role-based access, audit logs for admin actions |
| **Content protection** | Premium content only served server-side to members. Signed and expiring video URLs. Watermark review VODs. |
| **Privacy / legal** | GDPR + UK GDPR (cookie consent, data export/delete), EA non-affiliation disclaimer (already in ToS), trading "educational only" disclaimer, VAT via Stripe Tax |
| **Accessibility** | WCAG AA contrast (check mint-on-dark and grey text), keyboard nav (fits the "gamepad focus" style), reduced-motion support |
| **Observability** | Sentry errors, CloudWatch alarms, uptime monitor, PostHog funnels (visit → signup → Lads+) |
| **Backups / DR** | RDS automated backups + PITR, S3 versioning, infra re-creatable from code |

---

## 9. Suggested build roadmap

| Phase | Scope | Outcome |
|---|---|---|
| **0. Foundation** | Monorepo, CI/CD, AWS staging, design tokens + core `ui` components, DB schema v1, CMS setup | Team can ship |
| **1. Public site (MVP)** | Home, Learn library, Guide article, Feed, Meet the Lads, Creator profile, Lads+ pricing page, ToS/Privacy, Auth (email + Google + Discord) | Live site, SEO starts, free signups collected |
| **2. Monetisation** | Stripe subscription, entitlements, paywalls, Account (membership / billing / cancel), Discord role sync, My Lads dashboard shell + My Feed + Gameplay vault | **Revenue live** |
| **3. Trading & data** | Trading brief (public + member), Meta Players, Player detail with price chart, Squads, admin tools / CSV import | Full content product |
| **4. Gameplay reviews** | VOD upload, coach availability and booking, coach dashboard, review delivery, credits | Highest-value member perk live |
| **5. Scale & extras** | Search upgrade, notifications, polls, keyboard/gamepad shortcuts, mobile app (React Native / Expo reusing API) | Growth |

---

## 10. Open questions for the client / team

1. **Refund policy:** 14-day guarantee or non-refundable? (The designs conflict.)
2. **Game data source:** manual entry by creators, a licensed provider, or something else? Can we legally show real player names, likenesses and card images?
3. **Annual plan?** ToS mentions "annual equivalents". Is the $29 "founder rate" going to rise later?
4. **Currencies:** USD only (as designed) or GBP/EUR too?
5. **Coach capacity:** how many reviews per month can the 4 coaches handle? This affects booking logic and whether the review perk scales.
6. **Video hosting for premium content:** YouTube unlisted (free but weak protection), Mux, or AWS MediaConvert?
7. **Existing Discord server:** how many members today? Who owns the bot and server permissions?
8. **Mobile designs:** who designs the mobile layouts? Most traffic will be phones.
9. **Admin users:** do creators publish content themselves or via staff?
10. **Brand/legal:** keep the console "telemetry" decoration (fake ms / build numbers)? Remove the "bots / glitch / exploit" wording?
11. **Hosting preference:** strictly all-AWS, or is Vercel for the frontend acceptable?

---

## 11. One-paragraph summary

FC Lads is a **freemium EA FC community platform** run by football-gaming YouTubers. Free guides, meta players, squads and a feed pull users in, and a **$29/month FC Lads+** subscription unlocks premium guides, a private Discord, creator access, a weekly trading brief and a monthly 1-on-1 VOD review. The 24 designed pages use a consistent **dark console/esports "Apex Pitch" design system**. They're Stitch-generated references that need to be rebuilt properly, and mobile, admin and coach tooling still need designing. Recommended build: a **TypeScript monorepo** with **Next.js** (SEO-heavy public site + member dashboard), a **NestJS** API, workers and a Discord bot, **PostgreSQL + Redis**, **Payload CMS** for creators, **Stripe** for billing, all on **AWS** (CloudFront + WAF, ECS Fargate, RDS, ElastiCache, S3, SES), managed with infrastructure-as-code and GitHub Actions. Before building data features, the biggest decisions are **where game and price data come from** and the **legal use of player and EA assets**.
