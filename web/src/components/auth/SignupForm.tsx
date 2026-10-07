"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AtSign, Gamepad2, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { EMAIL_PATTERN, Field, passwordScore, SocialButtons, StatusNote } from "./AuthBits";

const strengthLabels = ["Too short", "Weak", "OK", "Good", "Strong"];
const strengthColors = ["bg-danger", "bg-danger", "bg-gold", "bg-primary", "bg-mint"];

type Errors = Partial<Record<"name" | "email" | "password" | "terms", string>>;

/**
 * Sign-up form with live password strength. Browser-side validation only: there is no backend
 * yet, so nothing is sent or stored. Wire `handleSubmit` to real sign-up in Phase 2.
 */
export function SignupForm({ joiningPlus }: { joiningPlus: boolean }) {
  const [errors, setErrors] = useState<Errors>({});
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const score = passwordScore(password);

  // Editing a field clears its error straight away (so hints like password strength reappear).
  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as keyof typeof errors;
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next: Errors = {
      name: !name ? "Choose a display name." : name.length < 3 ? "Use at least 3 characters." : undefined,
      email: !email ? "Enter your email address." : !EMAIL_PATTERN.test(email) ? "That email doesn't look right." : undefined,
      password: password.length < 8 ? "Use at least 8 characters." : undefined,
      terms: data.get("terms") ? undefined : "Please accept the Terms and Privacy Policy to continue.",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setStatus(null);
      return;
    }
    setStatus(
      joiningPlus
        ? "Sign-up isn't switched on yet. When it is, you'll go straight to checkout for FC Lads+ from here. Nothing was sent or saved."
        : "Sign-up isn't switched on yet. Accounts arrive with the next stage of the site — nothing was sent or saved.",
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearFieldError} className="flex flex-col gap-5">
      <Field
        label="Display name"
        name="name"
        autoComplete="nickname"
        placeholder="Your gamertag"
        maxLength={24}
        icon={<Gamepad2 className="size-4" />}
        error={errors.name}
        hint="Shown on the site and in Discord."
      />
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        icon={<Lock className="size-4" />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint={
          password && (
            <span className="flex items-center gap-3">
              <span aria-hidden className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={cn("h-1 flex-1 rounded-full", step <= score ? strengthColors[score] : "bg-white/10")}
                  />
                ))}
              </span>
              <span className="tabular shrink-0">Strength: {strengthLabels[score]}</span>
            </span>
          )
        }
      />
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="terms"
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[#2bd98b]"
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-on-surface underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-on-surface underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="text-sm text-danger-soft">
            {errors.terms}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full">
        {joiningPlus ? "Create account & continue" : "Create free account"}
        <UserPlus aria-hidden className="size-4" />
      </Button>
      {status && <StatusNote>{status}</StatusNote>}
      <SocialButtons
        onPress={(provider) => setStatus(`Signing up with ${provider} isn't switched on yet. It arrives with accounts.`)}
      />
    </form>
  );
}
