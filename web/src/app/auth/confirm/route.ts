import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/validation";
import { createClient, isAuthConfigured } from "@/lib/supabase/server";

const OTP_TYPES = new Set<string>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

/**
 * Where the links in sign-up and password reset emails land. Signs the user in, then sends them on
 * to `next` without the one-time token in the address bar. Handles both link styles Supabase sends:
 * `?token_hash=…&type=…` (works on any device) and `?code=…` (same browser only).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");

  if (isAuthConfigured && ((tokenHash && type && OTP_TYPES.has(type)) || code)) {
    const supabase = await createClient();
    const { error } =
      tokenHash && type
        ? await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash })
        : await supabase.auth.exchangeCodeForSession(code!);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  const failed = new URL(next === "/reset-password" ? "/forgot-password" : "/login", request.url);
  failed.searchParams.set("error", "link");
  return NextResponse.redirect(failed);
}
