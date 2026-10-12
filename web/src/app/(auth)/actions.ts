"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { displayNameError, emailError, newPasswordError, safeNext } from "@/lib/auth/validation";
import { createClient, isAuthConfigured } from "@/lib/supabase/server";
import { isMemberStatus } from "@/lib/viewer";

export interface AuthFormState {
  errors?: Partial<Record<"name" | "email" | "password" | "terms", string>>;
  /** Problem that isn't tied to one field. */
  message?: string;
  /** Email that a confirmation or reset link was sent to. */
  sentTo?: string;
}

const NOT_CONFIGURED: AuthFormState = { message: "Accounts aren't switched on yet. Nothing was sent or saved." };

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

/** Public address of the site, for links inside emails. */
async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const head = await headers();
  return `${head.get("x-forwarded-proto") ?? "http"}://${head.get("host")}`;
}

/** Supabase errors in plain words. */
function friendly(error: AuthError) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Confirm your email first: open the link we sent when you signed up.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "weak_password":
      return "Pick a stronger password: longer, with a mix of letters, numbers and symbols.";
    case "email_address_invalid":
      return "That email address can't be used. Check it, or try a different one.";
    case "email_address_not_authorized":
      return "We couldn't send the confirmation email to that address yet. Please try again later.";
    case "user_already_exists":
    case "email_exists":
      return "There's already an account with that email. Log in instead.";
    case "same_password":
      return "Your new password must be different from the old one.";
    default:
      return "Something went wrong on our side. Please try again.";
  }
}

export async function logIn(_prev: AuthFormState, data: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured) return NOT_CONFIGURED;
  const email = text(data, "email");
  const password = String(data.get("password") ?? "");
  const errors = { email: emailError(email), password: password ? undefined : "Enter your password." };
  if (errors.email || errors.password) return { errors };

  const supabase = await createClient();
  const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: friendly(error) };

  // Without a ?next=, members go to their dashboard and everyone else to their account.
  let home = "/account";
  if (!data.get("next")) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("status")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (membership && isMemberStatus(membership.status)) home = "/dashboard";
  }

  revalidatePath("/", "layout");
  redirect(safeNext(data.get("next"), home));
}

export async function signUp(_prev: AuthFormState, data: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured) return NOT_CONFIGURED;
  const name = text(data, "name");
  const email = text(data, "email");
  const password = String(data.get("password") ?? "");
  const errors = {
    name: displayNameError(name),
    email: emailError(email),
    password: newPasswordError(password),
    terms: data.get("terms") ? undefined : "Please accept the Terms and Privacy Policy to continue.",
  };
  if (Object.values(errors).some(Boolean)) return { errors };

  const next = safeNext(data.get("next"));
  const supabase = await createClient();
  const { data: result, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${await siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { message: friendly(error) };

  // Email confirmation switched off in Supabase: the user is signed in straight away.
  if (result.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }
  // Same answer whether or not the email already has an account, so the form can't reveal who's registered.
  return { sentTo: email };
}

export async function logOut() {
  if (isAuthConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(_prev: AuthFormState, data: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured) return NOT_CONFIGURED;
  const email = text(data, "email");
  const error = emailError(email);
  if (error) return { errors: { email: error } };

  const supabase = await createClient();
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/reset-password`,
  });
  // Rate limits are worth telling people about; anything else gets the same "check your email" answer.
  if (resetError?.code === "over_email_send_rate_limit" || resetError?.code === "over_request_rate_limit") {
    return { message: friendly(resetError) };
  }
  return { sentTo: email };
}

export async function updatePassword(_prev: AuthFormState, data: FormData): Promise<AuthFormState> {
  if (!isAuthConfigured) return NOT_CONFIGURED;
  const password = String(data.get("password") ?? "");
  const error = newPasswordError(password);
  if (error) return { errors: { password: error } };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return { message: "This reset link has expired. Ask for a new one." };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { message: friendly(updateError) };

  revalidatePath("/", "layout");
  redirect("/account/membership?password=updated");
}
