"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, BadgeCheck, BookOpen, Clock, Plus, Trophy, Users } from "lucide-react";
import { CreatorCard } from "@/components/cards/CreatorCard";
import { Button } from "@/components/ui/Button";
import type { Creator, Guide } from "@/types";

export interface RosterEntry {
  creator: Creator;
  guideCount: number;
  yearsActive?: number;
  latestGuide?: Pick<Guide, "slug" | "title" | "excerpt" | "minutes" | "format">;
}

const HOVER_INTENT_MS = 120;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Creator cards + detail panel. Resting the cursor on (or tabbing to) a card shows that
 * creator in the panel below, and it stays after the cursor leaves. Clicking opens the profile.
 */
export function CreatorRoster({ entries }: { entries: RosterEntry[] }) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const select = (index: number, delay = HOVER_INTENT_MS) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(index), delay);
  };

  const entry = entries[active];
  const youtube = entry.creator.audience?.find((item) => item.platform === "youtube");

  return (
    <MotionConfig reducedMotion="user">
      {/* Phones: swipeable row. Tablet+: grid. */}
      <div
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5"
        onMouseLeave={() => clearTimeout(timer.current)}
      >
        {entries.map(({ creator }, index) => (
          <div
            key={creator.slug}
            onMouseEnter={() => select(index)}
            onFocus={() => select(index, 0)}
            className={`w-[78%] shrink-0 snap-start transition-transform duration-300 sm:w-auto ${index === active ? "lg:-translate-y-3" : ""}`}
          >
            <CreatorCard creator={creator} featured={index === active} className="h-full" />
          </div>
        ))}

        <article className="flex w-[78%] shrink-0 snap-start flex-col justify-between gap-4 rounded-xl border border-dashed border-white/15 p-4 sm:col-span-2 sm:w-auto lg:col-span-1">
          <div className="flex items-start justify-between">
            <span className="text-label text-muted">Open slot</span>
            <span className="tabular rounded bg-white/5 px-2 py-0.5 text-[10px] text-muted uppercase">Scouting</span>
          </div>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-primary/40 text-primary">
              <Plus aria-hidden className="size-6" />
            </span>
            <h3 className="font-display font-extrabold uppercase">More Lads coming</h3>
            <p className="text-sm text-muted">Make FC content and want to join the crew?</p>
          </div>
          <Link
            href="/creators/apply"
            className="text-label flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5 text-primary transition-colors hover:border-primary/50"
          >
            Submit application
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </article>
      </div>

      <section
        aria-label="Selected creator"
        className="relative mt-10 rounded-2xl border border-primary/30 bg-surface/80 p-5 shadow-[0_0_40px_rgb(43_217_139/0.08)] md:p-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={entry.creator.slug}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease } }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.18 } }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="flex flex-col gap-4 lg:col-span-5">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl font-extrabold uppercase">{entry.creator.name}</span>
                <span className="text-label rounded bg-primary px-2 py-0.5 text-on-primary">Lad #{active + 1}</span>
              </p>
              <p className="text-sm font-bold text-mint">{entry.creator.tagline}</p>
              <p className="leading-relaxed text-muted">{entry.creator.bio}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <BadgeCheck aria-hidden className="size-4 text-primary" />
                Verified FC Lads creator
              </p>
            </div>

            <ul className="flex flex-col gap-3 lg:col-span-3">
              {[
                { icon: Users, label: "YouTube subscribers", value: youtube?.count ?? "—" },
                { icon: BookOpen, label: "Guides on FC Lads", value: String(entry.guideCount) },
                {
                  icon: Trophy,
                  label: "Competing for",
                  value: entry.yearsActive ? `${entry.yearsActive} years` : "—",
                },
              ].map(({ icon: Icon, label, value }) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-container p-4"
                >
                  <span className="flex flex-col">
                    <span className="text-[11px] text-muted uppercase">{label}</span>
                    <span className="tabular mt-1 font-bold text-mint">{value}</span>
                  </span>
                  <Icon aria-hidden className="size-5 text-primary" />
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#0f141b] p-4 lg:col-span-4">
              <p className="text-label flex items-center gap-2 text-mint">
                <span aria-hidden className="size-1.5 rounded-full bg-mint" />
                Latest guide
              </p>
              {entry.latestGuide ? (
                <>
                  <h3 className="font-display text-lg leading-snug font-extrabold">
                    <Link href={`/guides/${entry.latestGuide.slug}`} className="hover:text-mint">
                      {entry.latestGuide.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted">{entry.latestGuide.excerpt}</p>
                  <p className="tabular flex items-center gap-1.5 text-xs text-muted">
                    <Clock aria-hidden className="size-3.5" />
                    {entry.latestGuide.minutes} min {entry.latestGuide.format === "video" ? "video" : "read"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">No guides yet.</p>
              )}
              <Button href={`/creators/${entry.creator.slug}`} variant="glass" size="sm" className="mt-auto rounded-lg">
                View full profile
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
