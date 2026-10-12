"use client";

import Link from "next/link";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, Info, MailCheck } from "lucide-react";
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

const noteTones = {
  info: { box: "border-azure/40 bg-azure/10", icon: Info, iconClass: "text-[#93c5fd]" },
  error: { box: "border-danger/50 bg-danger/10", icon: CircleAlert, iconClass: "text-danger-soft" },
  success: { box: "border-primary/40 bg-primary/10", icon: CircleCheck, iconClass: "text-primary" },
};

/** Status box shown after submitting: errors are announced straight away, the rest politely. */
export function StatusNote({ children, tone = "info" }: { children: ReactNode; tone?: keyof typeof noteTones }) {
  const { box, icon: Icon, iconClass } = noteTones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg border p-4 text-sm", box)}>
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
      <div>{children}</div>
    </div>
  );
}

/** Replaces a form once a confirmation or reset email has gone out. */
export function CheckEmail({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <MailCheck aria-hidden className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-display text-xl font-extrabold">Check your email</p>
        <p className="text-sm text-muted">
          We sent a link to <span className="font-semibold break-all text-on-surface">{email}</span>. {children}
        </p>
      </div>
      <p className="text-xs text-muted">Nothing there after a few minutes? Check your spam folder.</p>
    </div>
  );
}

/** 0–4 score: length ≥ 8, ≥ 12, mixed case, digit or symbol. */
export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
