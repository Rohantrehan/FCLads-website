"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AtSign, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EMAIL_PATTERN, Field, SocialButtons, StatusNote } from "./AuthBits";

/**
 * Log-in form. Validates in the browser only: there is no backend yet, so nothing is sent
 * anywhere. Replace `handleSubmit` with the real sign-in call when auth exists (Phase 2).
 */
export function LoginForm() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<string | null>(null);

  // Editing a field clears its error straight away (so hints like password strength reappear).
  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as keyof typeof errors;
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next = {
      email: !email ? "Enter your email address." : !EMAIL_PATTERN.test(email) ? "That email doesn't look right." : undefined,
      password: !password ? "Enter your password." : undefined,
    };
    setErrors(next);
    if (next.email || next.password) {
      setStatus(null);
      return;
    }
    setStatus("Log in isn't switched on yet. Accounts arrive with the next stage of the site — nothing was sent or saved.");
  };

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearFieldError} className="flex flex-col gap-5">
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={<AtSign className="size-4" />}
        error={errors.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        icon={<Lock className="size-4" />}
        error={errors.password}
        aside={
          <Link href="/forgot-password" className="text-sm text-primary hover:text-white">
            Forgot password?
          </Link>
        }
      />
      <label className="flex items-center gap-2.5 text-sm text-muted">
        <input type="checkbox" name="remember" className="size-4 accent-[#2bd98b]" defaultChecked />
        Stay signed in on this device
      </label>
      <Button type="submit" variant="primary" size="lg" className="w-full">
        Log in
        <LogIn aria-hidden className="size-4" />
      </Button>
      {status && <StatusNote>{status}</StatusNote>}
      <SocialButtons
        onPress={(provider) =>
          setStatus(`Signing in with ${provider} isn't switched on yet. It arrives with accounts in the next stage.`)
        }
      />
    </form>
  );
}
