import type { Metadata } from "next";
import { Gamepad2, MessagesSquare, Users, Zap } from "lucide-react";
import { CreatorRoster, type RosterEntry } from "@/components/creators/CreatorRoster";
import { Button } from "@/components/ui/Button";
import { creators } from "@/data/creators";
import { getGuidesByAuthor } from "@/data/guides";
import { ladsPlus } from "@/data/ladsPlus";

export const metadata: Metadata = {
  title: "Meet the Lads",
  description: `The FC creators, analysts and competitors behind FC Lads: ${creators.map((creator) => creator.name).join(", ")}.`,
  alternates: { canonical: "/creators" },
};

// TODO: replace with real combined audience once the client confirms numbers.
const TOTAL_AUDIENCE = "1.2M+";

export default function CreatorsPage() {
  const year = new Date().getFullYear();
  const entries: RosterEntry[] = creators.map((creator) => {
    const authored = getGuidesByAuthor(creator.slug);
    const latest = authored[0];
    return {
      creator,
      guideCount: authored.length,
      yearsActive: creator.since ? year - creator.since : undefined,
      latestGuide: latest && {
        slug: latest.slug,
        title: latest.title,
        excerpt: latest.excerpt,
        minutes: latest.minutes,
        format: latest.format,
      },
    };
  });

  const stats = [
    { icon: Gamepad2, label: "Creator roster", value: `${creators.length} pro creators` },
    { icon: Users, label: "Community reach", value: `${TOTAL_AUDIENCE} total audience` },
    { icon: Zap, label: "Lads+ network", value: "Private Discord access" },
  ];

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgb(14_42_34/0.8),transparent)]" />

      <header className="page-container relative grid grid-cols-1 items-end gap-10 pt-12 pb-12 lg:grid-cols-12 lg:pt-16">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            Creator roster {"//"} verified
          </p>
          <h1 className="text-hero">
            Meet the <span className="text-primary">Lads</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            FC Lads isn&apos;t built around one person. It&apos;s a crew of creators, meta analysts and competitive players
            from different countries, all testing the same game.
          </p>
        </div>
        <ul className="flex flex-col gap-3 lg:col-span-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <li key={label} className="glass flex items-center gap-4 rounded-xl px-4 py-3">
              <Icon aria-hidden className="size-5 shrink-0 text-primary" />
              <span className="flex flex-col">
                <span className="text-[11px] text-muted uppercase">{label}</span>
                <span className="font-display text-sm font-extrabold uppercase">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="roster-heading" className="page-container relative pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 id="roster-heading" className="font-display text-xl font-extrabold uppercase">
            The roster
          </h2>
          <p className="tabular hidden text-xs text-muted uppercase lg:block">Point at a card to see more · click for profile</p>
        </div>
        <CreatorRoster entries={entries} />
      </section>

      <section aria-label="Our mission" className="page-container py-16 text-center">
        <p className="tabular mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />A global crew
        </p>
        <p className="mt-6 font-display text-2xl leading-tight font-extrabold text-white/60 uppercase md:text-4xl">
          Different players.
          <br />
          Different playstyles.
          <br />
          Different countries.
          <br />
          <span className="text-mint">One obsession.</span>
        </p>
      </section>

      <section aria-labelledby="discord-cta" className="page-container pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-surface-high to-pitch-green p-6 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <p className="text-label flex items-center gap-2 text-mint">
              <MessagesSquare aria-hidden className="size-4" />
              Direct access
            </p>
            <h2 id="discord-cta" className="mt-2 font-display text-xl font-extrabold uppercase md:text-2xl">
              Talk to the Lads directly in the private Discord
            </h2>
            <p className="mt-2 text-muted">
              The creators hang out daily in Lads+ voice rooms, squad reviews, meta testing and Weekend League channels.
            </p>
          </div>
          <Button href="/lads-plus" variant="primary" size="lg" className="shrink-0">
            Join FC Lads+ ({ladsPlus.priceLabel}/mo)
            <Zap aria-hidden className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
