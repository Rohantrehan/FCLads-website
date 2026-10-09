"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Printer } from "lucide-react";

/** Email address with a copy button. Falls back to a normal mailto link. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}`}
        className="tabular rounded-lg border border-white/10 bg-[#090d14] px-3 py-2.5 text-sm text-on-surface transition-colors hover:border-primary/50"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="text-label flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-primary transition-colors hover:border-primary/50"
      >
        {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}

/** Opens the browser's print dialog, where people can also save the page as a PDF. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-label flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-muted transition-colors hover:border-primary/50 hover:text-white"
    >
      <Printer aria-hidden className="size-4" />
      Print or save as PDF
    </button>
  );
}
