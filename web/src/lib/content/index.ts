import "server-only";

import { cache } from "react";
import { createContent } from "@/lib/content/content";
import { fetchCatalog, fetchGuideContent } from "@/lib/content/db";
import { priceLabel } from "@/lib/format";

// Where every page gets its content: the Supabase content tables, written on the posting board.
// There is no built-in sample content: without SUPABASE_SECRET_KEY the pages fail with a clear error.
// Server only. FC Lads+ text is in here; the lib/*Access.ts helpers decide what each viewer gets.

/** All content except guide bodies. Loaded once per request (and cached by Next between requests). */
export const getContent = cache(async () => createContent(await fetchCatalog(), new Date().toISOString()));

/** FC Lads+ price, trial and perks (Site settings), with the price ready to show, e.g. "$29". */
export const getPlus = cache(async () => {
  const { plus } = (await getContent()).settings;
  return { ...plus, priceLabel: priceLabel(plus) };
});

export type Plus = Awaited<ReturnType<typeof getPlus>>;

/** FC Lads' own channels from Site settings. An empty link means "not set up yet": hide that button. */
export const getSocials = cache(async () => (await getContent()).settings.socials);

/** A guide's article (intro + body), or undefined when it hasn't been written yet. */
export const getGuideContent = cache(async (slug: string) => fetchGuideContent(slug));

export type { Content } from "@/lib/content/content";
