# FC Lads Studio (Sanity)

Where creators and the admin team post content. The website (`web/`) reads it on the server.

| In the Studio | On the site |
|---|---|
| Guides (card, article blocks, video, "Members-only from here" marker) | `/learn`, `/guides/[slug]`, creator profiles, dashboard |
| Collections (videos in watch order, "Start here" step) | `/learn/collections`, `/learn/collections/[slug]` |
| Feed posts (video clip, update, trading targets, tip, poll) | `/feed`, dashboard Creators tab |
| Trading posts (heading, text, screenshot, Free or FC Lads+) | `/trading`, dashboard Trading tab |
| Creators (profile, card, socials, hide switch, order) | everywhere a creator appears |
| Site settings (current patch, season, Trending this week) | Home, Learn, Collections, Feed |

The dataset is **private**: nothing can be read without a token, so FC Lads+ text never leaves
the server. The site decides what each visitor gets (`web/src/lib/*Access.ts`).

## Set up (once)

```bash
cd studio
npm install
npx sanity login                                   # opens the browser
npx sanity projects create "FC Lads" --dataset production --dataset-visibility private
cp .env.example .env                               # put the project ID in it
npx sanity cors add http://localhost:3333 --credentials
npm run seed && npm run seed:import                # the site's sample content as a starting point
npm run deploy                                     # hosts the Studio at https://fclads.sanity.studio
```

Then, for the website (`web/.env.local`, and the host's environment variables in production):

- `SANITY_PROJECT_ID`, `SANITY_DATASET=production`
- `SANITY_READ_TOKEN`: sanity.io/manage → API → Tokens → add a **Viewer** token
- `SANITY_WEBHOOK_SECRET`: sanity.io/manage → API → Webhooks → add one for
  `https://<site>/api/revalidate`, trigger on create/update/delete, with this secret. Without it,
  changes show within 5 minutes; with it, straight away.

Invite creators and admins in sanity.io/manage → Members.

## Day to day

```bash
npm run dev      # Studio on http://localhost:3333
npm run deploy   # publish Studio changes (schema edits)
```

Content types live in `schemaTypes/`. If you add a choice to a list (a guide category, a feed
topic), add it to the website too (`web/src/types/index.ts`, `web/src/lib/format.ts`).
