import { RANKING_PUBLISHED } from "@/data/meta";

const published = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
}).format(new Date(`${RANKING_PUBLISHED}T00:00:00Z`));

export function MetaPlayersHeader({ week }: { week: number }) {
  return (
    <header className="page-container relative flex flex-col gap-6 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
      <div className="flex flex-col gap-3">
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          FC 27 meta recon {"//"} week {week}
        </p>
        <h1 className="text-hero">
          Meta <span className="text-primary">players</span>
        </h1>
        <p className="text-lg font-semibold text-primary">Who&apos;s broken this week. Tested by the Lads.</p>
      </div>
      <p className="glass flex items-center gap-3 self-start rounded-xl px-4 py-3 lg:self-auto">
        <span aria-hidden className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="flex flex-col">
          <span className="tabular text-xs font-bold uppercase">
            Week of <time dateTime={RANKING_PUBLISHED}>{published}</time>
          </span>
          <span className="tabular text-[11px] text-muted">New ranking every Monday</span>
        </span>
      </p>
    </header>
  );
}
