"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PerkIcon } from "@/components/home/PerkIcon";
import { ladsPlusPerks, type PerkKey } from "@/data/ladsPlus";
import { cn } from "@/lib/cn";

const HOVER_INTENT_MS = 120;
const ease = [0.22, 1, 0.36, 1] as const;

interface PerkPreview {
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
  link: { label: string; href: string };
  visual: ReactNode;
}

function MiniPassMap() {
  return (
    <svg viewBox="0 0 300 110" role="img" aria-label="Example passing route diagram" className="w-full rounded-lg bg-[#090d14]">
      <g fill="none" stroke="#8FF0C9" strokeOpacity="0.2">
        <rect x="4" y="4" width="292" height="102" />
        <line x1="150" y1="4" x2="150" y2="106" />
      </g>
      <path d="M40 80 Q110 20 180 40 T265 75" fill="none" stroke="#2BD98B" strokeWidth="2" strokeDasharray="5 5" />
      {[40, 110, 180, 265].map((x, i) => (
        <circle key={x} cx={x} cy={[80, 42, 40, 75][i]} r="5" fill="#2BD98B" />
      ))}
      {[[130, 70], [200, 62], [225, 30]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="#ff5c6c" opacity="0.8" />
      ))}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#090d14] p-3">
      <p className="tabular text-[10px] text-muted uppercase">{label}</p>
      <p className="tabular mt-1 font-bold text-mint">{value}</p>
    </div>
  );
}

const previews: Record<PerkKey, PerkPreview> = {
  guides: {
    eyebrow: "Tactical vault",
    title: "Every guide & video series",
    text: "All our guides and FC 27 video collections live here, for members only: custom tactics, player picks and frame-by-frame breakdowns that aren't on YouTube.",
    bullets: ["Full guide library", "FC 27 video series", "Full slider sets"],
    link: { label: "Browse the library", href: "/learn" },
    visual: <MiniPassMap />,
  },
  discord: {
    eyebrow: "Community",
    title: "The private FC Lads Discord",
    text: "Talk tactics, show your squad, debate patches and get help from experienced players any time of day.",
    bullets: ["Strategy rooms", "Squad feedback", "Live market chat"],
    link: { label: "See how it works", href: "#discord" },
    visual: (
      <div className="flex flex-col gap-2 rounded-lg bg-[#090d14] p-3 text-sm">
        <p>
          <span className="font-bold text-mint">Stefan</span> <span className="text-muted">· coach</span>
          <br />
          Drop direct passing to 45 after today&apos;s patch.
        </p>
        <p>
          <span className="font-bold">Marcus_WL</span>
          <br />
          Tried it in qualifiers, went 10-0. Thanks!
        </p>
      </div>
    ),
  },
  creators: {
    eyebrow: "Direct line",
    title: "Access to the FC Lads creators",
    text: "The Lads are in the server every day. Ask questions, get second opinions and learn what works at the top.",
    bullets: ["Weekly Q&A", "Squad second opinions", "Custom slider help"],
    link: { label: "Meet the Lads", href: "/creators" },
    visual: (
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Creators" value="On call" />
        <Stat label="Q&A" value="Weekly" />
        <Stat label="Channel" value="#ask" />
      </div>
    ),
  },
  trading: {
    eyebrow: "Market intel",
    title: "The weekly trading brief",
    text: "Every Monday: what we're watching, potential opportunities, upcoming promos and players to monitor.",
    bullets: ["Buy & exit targets", "Promo calendar", "Market trends"],
    link: { label: "Open the trading page", href: "/trading" },
    visual: (
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Released" value="Mondays" />
        <Stat label="Sections" value="5 panels" />
      </div>
    ),
  },
  review: {
    eyebrow: "1-on-1",
    title: "A monthly gameplay review",
    text: "Upload one match a month. A coach breaks it down and sends you a personal plan to fix your biggest mistakes.",
    bullets: ["Video breakdown", "Timestamped notes", "Personal practice plan"],
    link: { label: "How reviews work", href: "#review" },
    visual: (
      <div className="rounded-lg border-l-4 border-primary bg-[#090d14] p-3 text-sm">
        <p className="text-label text-mint">Coach note · 24:15</p>
        <p className="mt-1 text-muted">&ldquo;Your CB stepped out to press. Hold jockey with your CDM instead.&rdquo;</p>
      </div>
    ),
  },
};

/**
 * "Your membership includes": perk list + preview panel. Resting the cursor on a perk (or
 * tabbing / tapping) shows its preview, which stays after the cursor leaves.
 */
export function PerkShowcase() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const select = (index: number, delay = HOVER_INTENT_MS) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(index), delay);
  };

  const perk = ladsPlusPerks[active];
  const preview = previews[perk.key];

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Membership benefits"
          className="flex flex-col gap-2 lg:col-span-5"
          onMouseLeave={() => clearTimeout(timer.current)}
        >
          {ladsPlusPerks.map((item, index) => {
            const isActive = index === active;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`perk-tab-${item.key}`}
                aria-selected={isActive}
                aria-controls="perk-panel"
                tabIndex={isActive ? 0 : -1}
                onMouseEnter={() => select(index)}
                onFocus={() => select(index, 0)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
                  if (!step) return;
                  event.preventDefault();
                  const next = (index + step + ladsPlusPerks.length) % ladsPlusPerks.length;
                  setActive(next);
                  document.getElementById(`perk-tab-${ladsPlusPerks[next].key}`)?.focus();
                }}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-primary/60 bg-pitch-green shadow-[0_0_24px_rgb(43_217_139/0.15)]"
                    : "border-white/8 bg-[#0f141b] hover:border-white/20",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-primary text-on-primary" : "bg-surface-highest text-mint",
                  )}
                >
                  <PerkIcon perk={item.key} className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-display font-extrabold">
                    {index + 1}. {item.title}
                  </span>
                  <span className="text-sm text-muted">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          id="perk-panel"
          role="tabpanel"
          aria-labelledby={`perk-tab-${perk.key}`}
          className="relative min-h-[22rem] rounded-2xl border border-primary/30 bg-surface/80 p-6 lg:col-span-7"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={perk.key}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease } }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.18 } }}
              className="flex flex-col gap-4"
            >
              <p className="text-label text-mint">{preview.eyebrow}</p>
              <h3 className="font-display text-2xl leading-tight font-extrabold">{preview.title}</h3>
              <p className="text-muted">{preview.text}</p>
              {preview.visual}
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {preview.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-1.5">
                    <CheckCircle2 aria-hidden className="size-4 text-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href={preview.link.href}
                className="text-label mt-1 flex items-center gap-1.5 self-start text-primary hover:text-white"
              >
                {preview.link.label}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
