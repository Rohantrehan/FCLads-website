import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { CreatorCard } from "@/components/cards/CreatorCard";
import { GuideCard } from "@/components/cards/GuideCard";
import { CollectibleCard, MetaPlayerCard } from "@/components/cards/PlayerCard";
import { Logo } from "@/components/layout/Logo";
import { Badge, SkewTag, TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, CoinPrice, StatBar, Trend } from "@/components/ui/DataBits";
import { GlassPanel, SectionHeading } from "@/components/ui/Panel";
import { Paywall } from "@/components/ui/Paywall";
import { creators, getCreator } from "@/data/creators";
import { guides } from "@/data/guides";
import { players } from "@/data/players";
import { FilterPillsDemo } from "./FilterPillsDemo";

// Internal reference page for reviewing components. Not for the public or search engines.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const swatches = [
  ["canvas", "bg-canvas", "#07090D"],
  ["surface", "bg-surface", "#0C1017"],
  ["surface-container", "bg-surface-container", "#111722"],
  ["surface-high", "bg-surface-high", "#18202F"],
  ["surface-highest", "bg-surface-highest", "#212B3E"],
  ["primary", "bg-primary", "#2BD98B"],
  ["mint", "bg-mint", "#8FF0C9"],
  ["azure", "bg-azure", "#1E8BFF"],
  ["gold", "bg-gold", "#D8B25A"],
  ["danger", "bg-danger", "#FF5C6C"],
] as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-white/8 pt-10">
      <h2 className="text-label text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [kai, valere, san, silva, okonkwo] = players;

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 py-12 md:px-8 lg:px-14">
      <header className="flex flex-col gap-4">
        <Logo />
        <SectionHeading
          as="h1"
          eyebrow="Internal // Apex Pitch UI"
          title="Design system"
          description="Every shared component in one place. Review here before it goes into real pages."
        />
      </header>

      <Block title="Colours">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map(([name, cls, hex]) => (
            <li key={name} className="min-w-0 overflow-hidden rounded-lg border border-white/8">
              <div className={`h-16 ${cls}`} />
              <div className="flex flex-col bg-surface-container px-3 py-2">
                <span className="truncate text-xs font-semibold">{name}</span>
                <span className="tabular text-[11px] text-muted">{hex}</span>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typography">
        <div className="flex flex-col gap-4">
          <p className="text-hero">Dominate the pitch.</p>
          <p className="text-headline">Section headline (Sora)</p>
          <p className="max-w-2xl text-lg">
            Body large (Manrope). FC Lads is a community of FC players, creators and esports analysts who test the
            engine so you don&apos;t have to.
          </p>
          <p className="text-sm text-muted">Body small, muted. Used for descriptions and meta text.</p>
          <p className="tabular text-gold">1,450,000 coins · 94 OVR · 18:42 (JetBrains Mono)</p>
          <p className="text-label text-mint">Label badge // Sora 11px</p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button href="#">
            Start learning free <ArrowRight aria-hidden className="size-4" />
          </Button>
          <Button variant="glass" href="#">
            Join FC Lads+
            <span className="tabular rounded border border-primary/20 bg-canvas/80 px-2 py-0.5 text-xs text-primary">
              $29/MO
            </span>
          </Button>
          <Button variant="primary">Join FC Lads+ now</Button>
          <Button variant="ghost">
            See all meta players <ArrowRight aria-hidden className="size-4" />
          </Button>
          <Button variant="danger" size="sm">
            Cancel membership
          </Button>
          <Button size="sm" disabled>
            Disabled
          </Button>
        </div>
      </Block>

      <Block title="Badges, tags & filters">
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge tier="free" />
          <TierBadge tier="plus" />
          <Badge tone="mint">Meta S+</Badge>
          <Badge tone="azure">CAM</Badge>
          <Badge tone="gold">Gold tier</Badge>
          <Badge tone="danger">1.08 nerf</Badge>
          <Badge tone="solid">Founding</Badge>
          <SkewTag>Exclusive pro tier</SkewTag>
        </div>
        <FilterPillsDemo />
      </Block>

      <Block title="Data">
        <div className="grid gap-8 md:grid-cols-2">
          <GlassPanel className="flex flex-col gap-3 p-5">
            <StatBar label="PAC" value={96} />
            <StatBar label="SHO" value={84} />
            <StatBar label="PAS" value={72} />
            <StatBar label="DEF" value={42} />
          </GlassPanel>
          <GlassPanel className="flex flex-wrap items-center gap-6 p-5">
            <Trend value={8.2} />
            <Trend value={-2.8} />
            <Trend value={0} />
            <CoinPrice value={420000} />
            <CoinPrice value={1480000} compact />
            <Avatar initials="S" />
            <Avatar initials="TF" tone="mint" size="lg" />
          </GlassPanel>
        </div>
      </Block>

      <Block title="Player cards — collectible (hero)">
        <div className="flex flex-wrap gap-6">
          <CollectibleCard player={kai} />
          <CollectibleCard player={silva} tier="special" />
          <CollectibleCard player={okonkwo} tier="gold" />
        </div>
      </Block>

      <Block title="Player cards — meta ranking">
        <div className="scrollbar-none -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4">
          <MetaPlayerCard player={kai} active />
          <MetaPlayerCard player={valere} />
          <MetaPlayerCard player={san} />
        </div>
      </Block>

      <Block title="Guide cards">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} author={getCreator(guide.authorSlug)} />
          ))}
        </div>
      </Block>

      <Block title="Creator cards">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((creator, index) => (
            <CreatorCard key={creator.slug} creator={creator} featured={index === 0} />
          ))}
        </div>
      </Block>

      <Block title="Paywall">
        <Paywall />
      </Block>
    </main>
  );
}
