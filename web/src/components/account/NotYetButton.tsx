"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, LogOut, Pencil } from "lucide-react";

const icons = { download: Download, logout: LogOut, edit: Pencil };

/**
 * A button for an action that needs the backend (payments or accounts).
 * Clicking it briefly says so instead of pretending to work.
 * TODO: swap each one for the real action when payments and accounts are built.
 */
export function NotYetButton({
  note,
  icon,
  className,
  children,
}: {
  note: string;
  icon?: keyof typeof icons;
  className?: string;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const Icon = icon ? icons[icon] : undefined;

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(false), 2600);
    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <button type="button" onClick={() => setShown(true)} className={className}>
      {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
      <span aria-live="polite">{shown ? note : children}</span>
    </button>
  );
}
