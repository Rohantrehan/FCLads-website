import { cn } from "@/lib/cn";

// Shown the moment a link is clicked, while the server builds the page (loading.tsx). The header and
// menu stay in place; only the page area pulses.

function Block({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-white/[0.06]", className)} />;
}

/** Heading, a line of text and a grid of cards: close to most pages, so nothing jumps much on arrival. */
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col gap-8", className)}>
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-3">
        <Block className="h-4 w-28 rounded-full" />
        <Block className="h-10 w-full max-w-lg" />
        <Block className="h-4 w-full max-w-2xl rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Block key={index} className="h-48" />
        ))}
      </div>
    </div>
  );
}
