import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** False until the Supabase keys are in the environment. Auth then stays off and everyone is a visitor. */
export const isAuthConfigured = Boolean(supabaseUrl && supabaseKey);

/** Supabase client for Server Components, Server Actions and Route Handlers, acting as the signed-in user. */
export async function createClient() {
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase isn't configured (see web/.env.example).");
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
