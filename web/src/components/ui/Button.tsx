import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "iridescent" | "primary" | "glass" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wider transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // Master CTA from DESIGN.md: white → lavender → mint, black text, mint ring + glow.
  iridescent:
    "bg-iridescent text-canvas rounded-full shadow-[0_0_0_2px_var(--color-mint),0_0_28px_rgb(143_240_201/0.45)] hover:scale-[1.03] hover:shadow-[0_0_0_3px_var(--color-mint),0_0_36px_rgb(143_240_201/0.7)]",
  primary:
    "rounded-xl bg-gradient-to-r from-primary-bright via-primary to-mint text-on-primary shadow-[0_0_24px_rgb(43_217_139/0.4)] hover:scale-[1.02]",
  glass:
    "rounded-full glass-subtle text-on-surface backdrop-blur-xl hover:border-primary/60 hover:shadow-[0_0_20px_rgb(56_225_146/0.2)]",
  ghost: "rounded-lg text-primary hover:text-on-surface",
  danger: "rounded-xl text-danger-soft hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-sm",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<ComponentProps<"button">, "className">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "iridescent", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as Omit<ButtonAsLink, keyof CommonProps>)}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
