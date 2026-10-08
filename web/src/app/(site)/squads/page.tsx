import type { Metadata } from "next";
import { Coins, ShieldCheck, Users } from "lucide-react";
import { BudgetTabs, SquadTile } from "@/components/squads/SquadBits";
import { SquadsHeader } from "@/components/squads/SquadsHeader";
import { getCreator } from "@/data/creators";
import { squads } from "@/data/squads";
import { squadRating } from "@/lib/squadStats";

export const metadata: Metadata = {
  title: "Meta squads for every budget",
  description: "EA SPORTS FC squad blueprints from 50K to 1.5M coins, built and tested by the FC Lads, with tactics and upgrade paths.",
  alternates: { canonical: "/squads" },
};

const howWeBuild = [
  { Icon: Coins, title: "Real budgets", text: "Every squad is priced from the market, starting XI and bench included." },
  { Icon: ShieldCheck, title: "Tested in Champs", text: "The Lads play these teams in Weekend League before they go up here." },
  { Icon: Users, title: "Upgrade paths", text: "Each squad shows where to spend your next coins first." },
];

export default function SquadsPage() {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.8),transparent)]" />

      <SquadsHeader>
        <BudgetTabs squads={squads} />
      </SquadsHeader>

      <section aria-labelledby="all-squads-heading" className="page-container relative pb-14">
        <h2 id="all-squads-heading" className="mb-6 font-display text-xl font-extrabold uppercase md:text-2xl">
          All squad blueprints
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {squads.map((squad) => (
            <SquadTile key={squad.slug} squad={squad} authorName={getCreator(squad.authorSlug)?.name} rating={squadRating(squad)} />
          ))}
        </div>
      </section>

      <section aria-labelledby="how-heading" className="page-container pb-20">
        <h2 id="how-heading" className="sr-only">
          How we build squads
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {howWeBuild.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="font-display font-extrabold uppercase">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
