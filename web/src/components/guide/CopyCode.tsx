"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Tactic share code with a one-click copy button. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is still visible and selectable.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#090d14] p-3">
      <div className="min-w-0">
        <p className="tabular text-[10px] text-muted uppercase">Share code</p>
        <p className="tabular truncate font-bold text-primary select-all">{code}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="tabular flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-bold text-on-primary uppercase transition-colors hover:bg-mint"
      >
        {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        {copied ? "Copied" : "Copy code"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Share code copied" : ""}
      </span>
    </div>
  );
}
