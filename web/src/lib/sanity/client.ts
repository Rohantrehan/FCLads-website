import "server-only";

import { createClient, type QueryParams } from "@sanity/client";

// Sanity (the CMS where creators and admins post). The dataset is private: every read uses a
// server-only token, so members-only text can't be fetched from the browser.

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_READ_TOKEN;

/** False until the Sanity keys are set: the site then shows the sample content in src/data. */
export const isCmsConfigured = Boolean(projectId && token);

export const sanityProject = { projectId: projectId ?? "", dataset };

const client = isCmsConfigured
  ? createClient({
      projectId,
      dataset,
      token,
      apiVersion: "2025-02-19",
      // Fresh data from the API; Next caches it until a publish clears the cache (app/api/revalidate).
      useCdn: false,
      perspective: "published",
    })
  : null;

/** Every Sanity read is tagged with this, so one publish webhook refreshes the whole site. */
export const CONTENT_TAG = "sanity";

/** Runs a GROQ query. Cached by Next; refreshed on publish, and at least every 5 minutes as a fallback. */
export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  if (!client) throw new Error("Sanity isn't configured: set SANITY_PROJECT_ID and SANITY_READ_TOKEN.");
  return client.fetch<T>(query, params, { next: { tags: [CONTENT_TAG], revalidate: 300 } });
}
