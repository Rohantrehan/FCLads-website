import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Layer-1 glass substrate: translucent dark panel, 1px light border, blur. */
export function GlassPanel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass rounded-2xl shadow-rim", className)} {...props} />;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Eyebrow (mint mono label with dot) + uppercase Sora title + optional description and right-side action. */
export function SectionHeading({ eyebrow, title, description, action, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-mint">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            {eyebrow}
          </span>
        )}
        <Tag className="text-headline">{title}</Tag>
        {description && <p className="max-w-2xl text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
