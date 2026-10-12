"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { AtSign, Lock, LogIn } from "lucide-react";
import { logIn, type AuthFormState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { emailError } from "@/lib/auth/validation";
import { Field, StatusNote } from "./AuthBits";

type Errors = NonNullable<AuthFormState["errors"]>;

/** Log-in form. Checks the fields in the browser first, then signs in on the server. */
export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [state, formAction, pending] = useActionState(async (prev: AuthFormState, data: FormData) => {
    const result = await logIn(prev, data);
    setErrors(result.errors ?? {});
    return result;
  }, {});

  // Editing a field clears its error straight away.
  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as keyof Errors;
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  // Catch obvious mistakes without a round trip; the server checks again.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const found: Errors = {
      email: emailError(String(data.get("email") ?? "").trim()),
      password: data.get("password") ? undefined : "Enter your password.",
    };
    if (found.email || found.password) {
      event.preventDefault();
      setErrors(found);
    }
  };

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={handleSubmit}
      onChange={clearFieldError}
      className="flex flex-col gap-5"
    >
      {next && <input type="hidden" name="next" value={next} />}
      {notice && !state.message && <StatusNote tone="error">{notice}</StatusNote>}
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
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
        <LogIn aria-hidden className="size-4" />
      </Button>
      {state.message && <StatusNote tone="error">{state.message}</StatusNote>}
    </form>
  );
}
