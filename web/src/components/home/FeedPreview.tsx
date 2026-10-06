import Link from "next/link";
import { Gamepad2, IdCard, Network, RefreshCw, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Panel";
import { ladsPlus } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";

const topics = [
  {
    title: "Gameplay",
    href: "/feed?topic=gameplay",
    icon: Gamepad2,
    color: "text-primary",
    tag: "New",
    tagClass: "bg-pitch-green text-primary",
    text: "Animation cancels, skill nerfs and sprint acceleration tested live.",
  },
  {
    title: "Players",
    href: "/feed?topic=players",
    icon: IdCard,
    color: "text-azure",
    tag: "Daily",
    text: "Real in-game testing, custom animations and playstyle limits.",
  },
  {
    title: "Trading",
    href: "/feed?topic=trading",
    icon: TrendingUp,
    color: "text-gold",
    tag: "High vol",
    tagClass: "bg-gold/10 text-gold",
    text: "Market trends, SBC requirements and fodder supply cycles.",
  },
  {
    title: "Updates",
    href: "/feed?topic=updates",
    icon: RefreshCw,
    color: "text-mint",
    tag: "Patch day",
    text: "Patch notes translated into plain English, fast.",
  },
  {
    title: "FUT Champs",
    href: "/feed?topic=fut-champs",
    icon: Trophy,
    color: "text-[#93c5fd]",
    tag: "Weekends",
    text: "Weekend League meta, best queue times and tactical counters.",
  },
  {
    title: "Squads",
    href: "/feed?topic=squads",
    icon: Network,
    color: "text-secondary",
    tag: "Synced",
    text: "Full-chemistry builds for every budget, from 50K to unlimited.",
  },
];

export function FeedPreview() {
  return (
    <section aria-labelledby="feed-heading" className="page-container py-20">
      <SectionHeading
        title={<span id="feed-heading">The FC Lads feed</span>}
        description="Everything happening in FC without spending your entire day doomscrolling forums."
      />
      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {topics.map(({ title, href, icon: Icon, color, tag, tagClass, text }) => (
            <li
              key={title}
              className="relative flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#0f141b] p-5 transition-all hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase">
                  <Icon aria-hidden className={cn("size-5", color)} />
                  <Link href={href} className="after:absolute after:inset-0">
                    {title}
                  </Link>
                </h3>
                <span className={cn("tabular rounded px-2 py-0.5 text-[10px] uppercase", tagClass ?? "text-white/40")}>
                  {tag}
                </span>
              </div>
              <p className="text-sm text-muted">{text}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold uppercase">Free community</h3>
              <span className="tabular text-sm font-bold text-white/60">$0 forever</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Read public FC Lads articles, browse meta rankings and watch free tactical breakdown videos.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/60 bg-gradient-to-b from-pitch-green to-canvas p-6 shadow-[0_0_30px_rgb(56_225_146/0.25)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-display text-base font-extrabold uppercase">
                <ShieldCheck aria-hidden className="size-5 text-primary" />
                FC Lads+ membership
              </h3>
              <span className="tabular shrink-0 font-bold text-primary">{ladsPlus.priceLabel} / mo</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Premium content, the private Discord, direct creator access, the weekly trading brief and a monthly 1-on-1
              gameplay review.
            </p>
            <Button href="/lads-plus" variant="primary" className="mt-2 w-full">
              Upgrade to FC Lads+
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
