import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CoinPrice } from "@/components/ui/DataBits";
import { cn } from "@/lib/cn";
import type { Squad } from "@/types";

/**
 * Horizontal pitch with one dot per player, laid out from the formation string
 * ("4-2-3-1" → GK, then lines of 4, 2, 3 and 1 moving towards goal). Works for any formation.
 */
export function FormationPitch({ formation, className }: { formation: string; className?: string }) {
  const lines = formation.split("-").map(Number).filter((n) => n > 0);
  const xs = lines.map((_, index) => 24 + (index * (88 - 24)) / Math.max(lines.length - 1, 1));
  const dots = [
    { x: 6, y: 50 },
    ...lines.flatMap((count, line) =>
      Array.from({ length: count }, (_, i) => ({ x: xs[line], y: ((i + 1) * 100) / (count + 1) })),
    ),
  ];

  return (
    <svg
      viewBox="0 0 100 60"
      role="img"
      aria-label={`${formation} formation`}
      className={cn("w-full rounded-lg bg-[#0a1a14]", className)}
    >
      <g fill="none" stroke="#8FF0C9" strokeOpacity="0.25" strokeWidth="0.4">
        <rect x="1" y="1" width="98" height="58" />
        <line x1="50" y1="1" x2="50" y2="59" />
        <circle cx="50" cy="30" r="7" />
        <rect x="1" y="16" width="12" height="28" />
        <rect x="87" y="16" width="12" height="28" />
      </g>
      {dots.map((dot, index) => (
        <circle key={index} cx={dot.x} cy={(dot.y * 58) / 100 + 1} r="2" fill="#2BD98B" stroke="#8FF0C9" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

/** Squad blueprint card: tier, name, formation pitch, tactics, cost and the creator's note. */
export function SquadCard({ squad, authorName, className }: { squad: Squad; authorName?: string; className?: string }) {
  return (
    <article className={cn("relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5", className)}>
      <div>
        <p className="text-label text-gold">{squad.tier}</p>
        <h3 className="mt-1 font-display text-xl font-extrabold uppercase">
          <Link href={`/squads/${squad.slug}`} className="after:absolute after:inset-0 hover:text-mint">
            {squad.name}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap gap-2">
          <Badge>{squad.formation}</Badge>
          <Badge tone="mint">
            {squad.chemistry}/33 chem
          </Badge>
        </p>
      </div>

      <FormationPitch formation={squad.formation} />

      <p className="tabular text-[11px] text-muted uppercase">
        Width {squad.width} {"//"} Depth {squad.depth} {"//"} {squad.buildUp}
      </p>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-container p-3">
          <dt className="tabular text-[10px] text-muted uppercase">Estimated cost</dt>
          <dd className="mt-1">
            <CoinPrice value={squad.budget} />
          </dd>
        </div>
        <div className="rounded-lg bg-surface-container p-3">
          <dt className="tabular text-[10px] text-muted uppercase">Key playstyles</dt>
          <dd className="tabular mt-1 text-sm font-bold text-mint">{squad.keyPlaystyles}</dd>
        </div>
      </dl>

      <blockquote className="flex gap-3 rounded-lg border border-primary/20 bg-pitch-green/50 p-3">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          {authorName && <p className="text-label text-primary">{authorName}&apos;s note</p>}
          <p className="mt-1 text-sm text-on-surface/90">&ldquo;{squad.note}&rdquo;</p>
        </div>
      </blockquote>
    </article>
  );
}
