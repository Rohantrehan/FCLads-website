import type { EmailOtpType, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/validation";
import { notifyWelcome } from "@/lib/email/notify";
import { createClient, isAuthConfigured } from "@/lib/supabase/server";

const OTP_TYPES = new Set<string>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

/**
 * Where the links in sign-up and password reset emails land. Signs the user in, then sends them on
 * to `next` without the one-time token in the address bar. Handles both link styles Supabase sends:
 * `?token_hash=…&type=…` (works on any device) and `?code=…` (same browser only).
 */
/** The link from the sign-up email, opened for the first time (not a password reset or a later login). */
function isFirstConfirm(type: string | null, user: User | null | undefined) {
  if (!user?.email_confirmed_at || (type && type !== "signup" && type !== "email")) return false;
  // Confirmed just now: the link was opened within the last two minutes of confirming.
  return Date.now() - new Date(user.email_confirmed_at).getTime() < 2 * 60_000;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");

  if (isAuthConfigured && ((tokenHash && type && OTP_TYPES.has(type)) || code)) {
    const supabase = await createClient();
    const { data, error } =
      tokenHash && type
        ? await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash })
        : await supabase.auth.exchangeCodeForSession(code!);
    if (!error) {
      if (isFirstConfirm(type, data.user)) notifyWelcome(data.user!.id);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const failed = new URL(next === "/reset-password" ? "/forgot-password" : "/login", request.url);
  failed.searchParams.set("error", "link");
  return NextResponse.redirect(failed);
}
