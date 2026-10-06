"use client";

import { cn } from "@/lib/cn";

interface FilterPillsProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/**
 * Row of filter pills. The active pill becomes the skewed green parallelogram from the designs.
 * Uses radio-group semantics so it works with keyboard and screen readers.
 */
export function FilterPills<T extends string>({ options, value, onChange, label, className }: FilterPillsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 px-4 font-mono text-xs font-bold uppercase transition-colors",
              active
                ? "skew-tag bg-gradient-to-r from-[#007a5a] to-primary text-white shadow-[0_0_15px_rgb(0_122_90/0.5)]"
                : "rounded bg-surface-high/60 text-muted hover:bg-surface-highest hover:text-on-surface",
            )}
          >
            <span className={cn("inline-block", active && "unskew")}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
