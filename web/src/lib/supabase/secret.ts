import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/server";

// Server-only Supabase client with the secret key. It skips row-level security, so it's only used to
// read site content (the content tables have no access for visitors or members at all). Never import
// this from a Client Component, and never use it for writes made on someone's behalf.

const secretKey = process.env.SUPABASE_SECRET_KEY;

/** False until SUPABASE_SECRET_KEY is set: content reads then fail with a clear error. */
export const isContentDbConfigured = Boolean(supabaseUrl && secretKey);

/** Every content read is tagged with this; saving on the posting board clears it. */
export const CONTENT_TAG = "content";

export const contentDb = isContentDbConfigured
  ? createClient(supabaseUrl!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Cached by Next; cleared on every save, and refreshed at least every 5 minutes (scheduled posts).
        fetch: (input, init) => fetch(input, { ...init, next: { tags: [CONTENT_TAG], revalidate: 300 } }),
      },
    })
  : null;
