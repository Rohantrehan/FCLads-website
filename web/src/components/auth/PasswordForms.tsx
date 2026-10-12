"use client";

import { useActionState, useState, type FormEvent } from "react";
import { AtSign, KeyRound, Lock, Send } from "lucide-react";
import { requestPasswordReset, updatePassword, type AuthFormState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { emailError, newPasswordError } from "@/lib/auth/validation";
import { CheckEmail, Field, StatusNote } from "./AuthBits";

/** Asks for the account email and sends a reset link. */
export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [error, setError] = useState<string>();
  const [state, formAction, pending] = useActionState(async (prev: AuthFormState, data: FormData) => {
    const result = await requestPasswordReset(prev, data);
    setError(result.errors?.email);
    return result;
  }, {});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const found = emailError(String(new FormData(event.currentTarget).get("email") ?? "").trim());
    if (found) {
      event.preventDefault();
      setError(found);
    }
  };

  if (state.sentTo) {
    return (
      <CheckEmail email={state.sentTo}>
        If there&apos;s an FC Lads account for that address, the link lets you choose a new password.
      </CheckEmail>
    );
  }

  return (
    <form noValidate action={formAction} onSubmit={handleSubmit} onChange={() => setError(undefined)} className="flex flex-col gap-5">
      {notice && !state.message && <StatusNote tone="error">{notice}</StatusNote>}
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={<AtSign className="size-4" />}
        error={error}
      />
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
        <Send aria-hidden className="size-4" />
      </Button>
      {state.message && <StatusNote tone="error">{state.message}</StatusNote>}
    </form>
  );
}

/** Sets a new password. Reached from the reset email, which signs the user in first. */
export function ResetPasswordForm() {
  const [error, setError] = useState<string>();
  const [state, formAction, pending] = useActionState(async (prev: AuthFormState, data: FormData) => {
    const result = await updatePassword(prev, data);
    setError(result.errors?.password);
    return result;
  }, {});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const found = newPasswordError(String(new FormData(event.currentTarget).get("password") ?? ""));
    if (found) {
      event.preventDefault();
      setError(found);
    }
  };

  return (
    <form noValidate action={formAction} onSubmit={handleSubmit} onChange={() => setError(undefined)} className="flex flex-col gap-5">
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        icon={<Lock className="size-4" />}
        error={error}
      />
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
        <KeyRound aria-hidden className="size-4" />
      </Button>
      {state.message && <StatusNote tone="error">{state.message}</StatusNote>}
    </form>
  );
}
