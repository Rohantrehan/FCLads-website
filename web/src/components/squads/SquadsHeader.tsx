import type { ReactNode } from "react";
import { CURRENT_PATCH } from "@/data/meta";

export function SquadsHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="page-container relative flex flex-col gap-6 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
      <div className="flex flex-col gap-3">
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          FC 27 squad blueprints {"//"} patch {CURRENT_PATCH}
        </p>
        <h1 className="text-hero">Squads</h1>
        <p className="max-w-xl text-lg font-semibold text-primary">
          Meta teams for every budget. Built and tested by the Lads.
        </p>
      </div>
      {children}
    </header>
  );
}
