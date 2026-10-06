import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollectibleCard } from "@/components/cards/PlayerCard";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";
import type { Player } from "@/types";

const topics = [
  { label: "Tactics", href: "/learn?category=tactics" },
  { label: "Gameplay", href: "/learn?category=gameplay" },
  { label: "Trading", href: "/trading" },
  { label: "Meta players", href: "/players" },
  { label: "FC updates", href: "/learn?category=fc-updates" },
  { label: "FUT Champs", href: "/learn?category=fut-champs" },
];

interface HeroProps {
  /** [front, back-left, back-right] */
  cards: [Player, Player, Player];
  patch: string;
}

export function Hero({ cards, patch }: HeroProps) {
  const [front, left, right] = cards;
  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Floodlight atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_40%,rgb(14_42_34/0.7),transparent)]" />
        <div className="absolute -top-32 left-1/4 h-[1200px] w-px rotate-[32deg] bg-gradient-to-b from-transparent via-mint/25 to-transparent" />
        <div className="absolute -top-40 left-1/2 h-[1300px] w-0.5 rotate-[34deg] bg-gradient-to-b from-transparent via-azure/20 to-transparent blur-[1px]" />
        <div className="absolute -top-20 right-1/4 h-[1000px] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-primary-bright/15 to-transparent" />
        <div className="absolute -top-1/4 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-primary-bright/10 blur-[140px]" />
      </div>

      <div className="page-container relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <p className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-white/10 bg-surface-container/80 px-3.5 py-1.5 backdrop-blur-md">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-label text-primary">FC competitive labs</span>
            <span aria-hidden className="tabular text-xs text-white/20">
              /
            </span>
            <span className="tabular text-xs text-muted">Meta patch {patch} live</span>
          </p>

          <h1 className="text-hero leading-[0.95]">
            Made by people who{" "}
            <span className="bg-gradient-to-r from-primary via-mint to-[#d5e3ff] bg-clip-text text-transparent">
              actually play
            </span>{" "}
            the game.
          </h1>

          <p className="max-w-xl text-lg text-muted">
            FC Lads is a community of FC players, creators and esports analysts who spend way too much time testing the
            engine so you don&apos;t have to.
          </p>

          <ul className="flex flex-wrap gap-2" aria-label="Topics">
            {topics.map((topic) => (
              <li key={topic.label}>
                <Link
                  href={topic.href}
                  className="text-label block rounded-md border border-white/5 bg-surface-high/60 px-3.5 py-1.5 text-on-surface backdrop-blur-md transition-colors hover:border-mint/40 hover:bg-surface-highest"
                >
                  [{topic.label}]
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button href="/learn" size="lg">
              Start learning free
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="/lads-plus" variant="glass" size="lg">
              Join FC Lads+
              <span className="tabular rounded border border-primary/20 bg-canvas/80 px-2 py-0.5 text-xs text-primary">
                {ladsPlus.priceLabel}/MO
              </span>
            </Button>
          </div>
        </div>

        {/* Fanned collectible cards */}
        <div className="relative mx-auto flex h-[400px] w-full max-w-md items-center justify-center sm:h-[460px] lg:col-span-5">
          <div aria-hidden className="pointer-events-none absolute size-72 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative h-[390px] w-64 scale-[0.85] sm:scale-100">
            <CollectibleCard
              player={left}
              tier="gold"
              className="absolute top-4 -left-14 -rotate-12 opacity-80 hover:z-20 hover:opacity-100 sm:-left-28"
            />
            <CollectibleCard
              player={right}
              tier="special"
              className="absolute top-4 -right-14 rotate-12 opacity-80 hover:z-20 hover:opacity-100 sm:-right-28"
            />
            <CollectibleCard player={front} className="absolute inset-0 z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
