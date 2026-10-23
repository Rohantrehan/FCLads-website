import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/server";

// Server-only Supabase client with the secret key and no caching. It skips row-level security, so it's
// only used for the memberships table, which nobody can write to themselves: the payment webhook and the
// checkout return copy the subscription from Dodo Payments into it. Never import this from a Client
// Component.

const secretKey = process.env.SUPABASE_SECRET_KEY;

export const adminDb =
  supabaseUrl && secretKey
    ? createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
