"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/** Uses the phone's native share sheet when available, otherwise copies the link. */
export function ShareButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User closed the share sheet or clipboard is blocked: nothing to do.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : "Share this guide"}
      className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted transition-colors hover:border-mint/50 hover:text-white"
    >
      {copied ? <Check aria-hidden className="size-5 text-mint" /> : <Share2 aria-hidden className="size-5" />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}
