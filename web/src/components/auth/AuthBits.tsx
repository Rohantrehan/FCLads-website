"use client";

import Link from "next/link";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/cn";

/** Log in | Sign up switch at the top of the auth card. */
export function AuthTabs({ active, plan }: { active: "login" | "signup"; plan?: string }) {
  const query = plan ? `?plan=${plan}` : "";
  return (
    <nav aria-label="Account" className="grid grid-cols-2 rounded-xl border border-white/10 bg-[#090d14] p-1">
      {(
        [
          ["login", "Log in", `/login${query}`],
          ["signup", "Sign up", `/signup${query}`],
        ] as const
      ).map(([key, label, href]) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={cn(
            "flex h-10 items-center justify-center rounded-lg font-display text-sm font-extrabold uppercase transition-colors",
            active === key ? "bg-gradient-to-r from-primary-bright to-mint text-on-primary" : "text-muted hover:text-white",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  icon?: ReactNode;
  /** Extra element on the right of the label row, e.g. "Forgot password?". */
  aside?: ReactNode;
}

/** Labelled text input with inline error, wired up with aria-invalid / aria-describedby. */
export function Field({ label, hint, error, icon, aside, className, type, ...input }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-label flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        {icon && (
          <span aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-lg border bg-[#090d14] text-on-surface placeholder:text-muted/60 focus:outline-none",
            icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            error ? "border-danger focus:border-danger" : "border-white/10 focus:border-mint",
          )}
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-white"
          >
            {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger-soft">
          {error}
        </p>
      )}
      {hint && !error && (
        <div id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </div>
      )}
    </div>
  );
}

/** Google / Discord buttons. Until auth exists they report that sign-in isn't connected yet. */
export function SocialButtons({ onPress }: { onPress: (provider: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-muted">
        <span aria-hidden className="h-px flex-1 bg-white/10" />
        <span className="tabular text-xs uppercase">or</span>
        <span aria-hidden className="h-px flex-1 bg-white/10" />
      </div>
      <button
        type="button"
        onClick={() => onPress("Google")}
        className="flex h-12 items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] font-semibold transition-colors hover:border-white/25"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
        </svg>
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => onPress("Discord")}
        className="flex h-12 items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] font-semibold transition-colors hover:border-[#5865F2]/60"
      >
        <span aria-hidden className="flex size-5 items-center justify-center rounded bg-[#5865F2] text-[10px] font-black text-white">
          D
        </span>
        Continue with Discord
      </button>
    </div>
  );
}

/** Polite status box shown after submitting (e.g. "accounts aren't switched on yet"). */
export function StatusNote({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex gap-3 rounded-lg border border-azure/40 bg-azure/10 p-4 text-sm">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-[#93c5fd]" />
      <div>{children}</div>
    </div>
  );
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 0–4 score: length ≥ 8, ≥ 12, mixed case, digit or symbol. */
export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
