import "server-only";

import { cache } from "react";
import { guideContents } from "@/data/guideContent";
import { SAMPLE_NOW, sampleContent } from "@/data/sample";
import { createContent } from "@/lib/content/content";
import { fetchCatalog, fetchGuideContent } from "@/lib/content/db";
import { isContentDbConfigured } from "@/lib/supabase/secret";

// Where every page gets its content: the Supabase content tables (written on the posting board) when
// SUPABASE_SECRET_KEY is set, otherwise the sample content in src/data.
// Server only. FC Lads+ text is in here; the lib/*Access.ts helpers decide what each viewer gets.

/** All content except guide bodies. Loaded once per request (and cached by Next between requests). */
export const getContent = cache(async () =>
  isContentDbConfigured
    ? createContent(await fetchCatalog(), new Date().toISOString())
    : createContent(sampleContent, SAMPLE_NOW),
);

/** A guide's article (intro + body), or undefined when it hasn't been written yet. */
export const getGuideContent = cache(async (slug: string) =>
  isContentDbConfigured ? fetchGuideContent(slug) : guideContents.find((content) => content.slug === slug),
);

export type { Content } from "@/lib/content/content";
