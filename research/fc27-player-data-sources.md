# FC 27 player data: where cards, stats and prices can come from

> **Decision (12 Oct 2026):** too hard to source legally for now, so the Players and Squads features were removed and Trading became text only (creators type card names and prices). Revisit if a licence from FUTBIN / FUT.GG / EA becomes possible.

Research done 10 Oct 2026, before starting the backend. Covers FC 27 only (released 25 Sep 2026; Web App opened 16 Sep 2026).

> Not legal advice. Some primary pages could not be opened during research (EA help centre timed out, FUTBIN terms returned 403, FutDB rate-limited). Re-check those before signing anything.

---

## 1. The short answer

- **There is no official public EA API** for Ultimate Team cards or prices. Nobody can sign up for one.
- **EA's FC Community API** exists, but only FUTBIN, FUT.GG and FUTWIZ are allowed in, and EA says it is **not accepting other sites** right now. It also gives a player's own club data (with their permission), not market prices.
- **Live prices** are collected by FUTBIN / FUT.GG / FUTWIZ themselves. FUTBIN has an official licensing deal with EA. None of them sell a public price API.
- **Biggest risk is not technical, it's EA's rules:** EA's content policy says putting EA game content **behind a paywall** (like Patreon) counts as commercial use and is not allowed. FC Lads+ is paid. Free pages with normal banner ads are allowed.

---

## 2. Every option we found

| Source | What it gives | FC 27? | Cost | Risk |
|---|---|---|---|---|
| **EA official ratings site** (ea.com/games/ea-sports-fc/ratings) | Base ratings for ~19,000 players: OVR, 6 face stats, position, club, nation, PlayStyles | ✅ Yes | Free | Only Gold/Silver/Bronze **launch** cards (no TOTW, Icons, Heroes, promos, no prices). No public API: data sits inside the page and changes without notice. EA marks some images "personal non-commercial use only". |
| **EA FC Community API** | A user's own club, formations, tactics (with permission) | ✅ | — | **Closed:** only FUTBIN, FUT.GG, FUTWIZ. EA not taking new sites. |
| **FUTBIN** (owned by Better Collective) | Every card incl. promos, prices (PS + PC), price history, SBCs, Evos | ✅ /27 | Ask them | No public API. Has an EA licence. Only legal route is a **business deal** with them. |
| **FUT.GG / FUTWIZ** | Same kind of data as FUTBIN | ✅ | Ask them | No public API found. Business deal only. |
| **FutDB** (futdatabase.com) | JSON API: players, prices, images | ❓ Site still says FC 26 | Free tier, premium ~€79/month | Not confirmed for FC 27. Prices update every 30 min to 24 h. Check their terms on paid sites and images. |
| **Unofficial FUTBIN scrapers** (parse.bot, Apify) | FUTBIN data copied by a third party | ✅ | Up to ~$1,000/month | Not from FUTBIN, likely against FUTBIN's terms, breaks every year when the site changes. **Avoid.** |
| **Our own bot on EA's Web App / transfer market** | Raw prices | ✅ | Dev time | **Against EA rules.** EA bans accounts for bots/automation. **Avoid.** |
| **Kaggle FC 27 ratings dataset** | Snapshot of EA's ratings (19,789 players, 12 Sep 2026) | ✅ | Free | Copy of EA data, frozen at launch, licence unclear. Fine for testing only. |

---

## 3. Card images and player faces

- Card art, player faces, club badges and league logos are owned by EA (and its licensors). FUTWIZ says this openly on its site.
- EA's policy allows fan sites to use game content **if not behind a paywall**. Passive banner ads are OK.
- So: showing EA card images inside **FC Lads+** pages is the risky part.

**Safer approach (already how the site is built):** draw cards with our **own design** (our CSS card component) using text data (name, rating, position, stats). No EA card art, no face photos. If we want faces/badges later, only on free pages, or after getting permission from EA.

---

## 4. How to keep it FC 27 only

Every source keeps game years separate: EA ratings page is FC 27, FUTBIN uses `/27/`, FUT.GG and FUTWIZ use `fc27`. When we load data:

- Save a `game: "fc27"` field on every player/card and only show `fc27` on the site.
- Only accept cards from the FC 27 source (never mix in FC 26 IDs; card IDs restart each year).
- Next September, FC 28 becomes a new dataset; FC 27 is archived, not mixed in.

---

## 5. Recommendation

**At launch (safe, no deals needed):**
1. **Player list + base stats:** import FC 27 base ratings once (EA ratings data) into our own database, and our creators add/edit the special cards they talk about (TOTW, promos) by hand in an admin page. Store `game: "fc27"`.
2. **Card visuals:** our own card design, no EA art or face photos.
3. **Prices:** don't show live prices ourselves. Show a "Check live price on FUTBIN / FUT.GG" link on each player. Prices in the **trading brief** stay what they are now: the creators' own picks and targets, typed in by them.
4. **Keep free pages (Players, Squads, Feed) free** so EA game content sits on free pages; FC Lads+ sells the creators' own content (guides, videos, reviews, brief).

**Next, to get live prices and full card data properly:**
5. Email **FUTBIN (Better Collective)** and **FUT.GG** for a data partnership or licence (price feed + card list). Ask about using it on a site with a paid tier.
6. Ask **EA** for permission to use FC content on a site with a paid membership (EA help: "How to request permission for EA games content").
7. Check **FutDB** for FC 27 support and whether their terms allow a paid site.

**Do not:** run bots on EA's Web App, or pay for unofficial FUTBIN scrapers.

---

## 6. Questions for the client

- Is the client OK with **no live prices at launch** (links to FUTBIN/FUT.GG instead)?
- Does the client (or a creator) have **contacts at EA, FUTBIN or FUT.GG**? Creators with big channels often do.
- OK with our **own card design** instead of EA card art?
- Budget for a paid data feed if FUTBIN/FUT.GG offer one?

---

## Sources

- EA, FC Community API update: https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-community-api-update
- EA help, Community API: https://help.ea.com/en/articles/ea-sports-fc/community-api/
- EA content policy (paywalls, banner ads): https://help.ea.com/en/articles/security-and-rules/ea-content-policy/
- EA, request permission for game content: https://help.ea.com/en/help/faq/how-to-request-permission-for-ea-games-content/
- EA FC 27 ratings: https://www.ea.com/games/ea-sports-fc/ratings
- EA FC 27 Web/Companion App dates: https://help.ea.com/es/help/ea-sports-fc/early-web-and-companion-app-start/
- FC 27 release date: https://www.psu.com/news/ea-sports-fc-27-takes-to-the-pitch-with-official-reveal-trailer-confirms-sept-25-release-date/
- Sportico, EA–FUTBIN licensing: https://www.sportico.com/business/tech/2025/futbin-ea-sports-third-party-rights-1234852814/
- FUTBIN data hub (records its own prices): https://www.futbin.com/27/data-hub
- FUTBIN terms: https://www.futbin.com/tos
- FUT.GG players: https://www.fut.gg/players/
- FUTWIZ players: https://www.futwiz.com/fc27/players
- FutDB: https://www.futdatabase.com/
- Unofficial FUTBIN API (parse.bot): https://parse.bot/marketplace/1b6234f9-0dfb-4cca-99b4-2d6d37aec6a7/futbin-com-api
- GitHub note on EA ratings endpoint for FC 27: https://github.com/amitbreuer/fifa-draft/pull/1
- Kaggle FC 27 ratings dataset: https://www.kaggle.com/datasets/mikedpad/ea-sports-fc27-player-ratings
- EA FUT rules (no bots/unofficial clients): https://www.easports.com/fifa-rules
- EA forum, bot/automation ban notice: https://forums.ea.com/discussions/fc-26-ultimate-team-en/banned-from-the-transfer-market-on-the-web-app/13363836
