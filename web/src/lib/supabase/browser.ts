"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase in the browser, acting as the signed-in user. Only used for image uploads on the posting
// board (storage policies allow creators and admins only).
export function createBrowserSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
