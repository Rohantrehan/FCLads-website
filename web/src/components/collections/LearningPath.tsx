import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Collection } from "@/types";

/**
 * The numbered "Start here" route. Desktop: one row of steps with arrows between them.
 * Phones: a vertical list. `current` highlights the step the user is viewing.
 */
export function LearningPath({ steps, current }: { steps: Collection[]; current?: string }) {
  return (
    <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {steps.map((step, index) => {
        const isCurrent = step.slug === current;
        return (
          <li key={step.slug} className="relative">
            <Link
              href={`/learn/collections/${step.slug}`}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "group flex h-full items-center gap-4 rounded-xl border p-4 transition-colors md:flex-col md:items-start md:gap-3",
                isCurrent
                  ? "border-primary/60 bg-pitch-green shadow-[0_0_24px_rgb(43_217_139/0.2)]"
                  : "border-white/8 bg-[#0f141b] hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-extrabold",
                  isCurrent ? "bg-primary text-on-primary" : "bg-surface-highest text-mint",
                )}
              >
                {step.pathStep}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-sm leading-snug font-extrabold group-hover:text-mint">{step.title}</span>
                <span className="tabular mt-1 text-[11px] text-muted uppercase">{step.videoCount} videos</span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-muted md:hidden" />
            </Link>
            {index < steps.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute top-1/2 -right-3 z-10 hidden size-4 -translate-y-1/2 text-primary md:block"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
