"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { hardTruth } from "@/data/hardTruth";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const HOVER_INTENT_MS = 120;

const panel: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease, staggerChildren: 0.035, delayChildren: 0.05 },
  },
  exit: { opacity: 0, y: -14, filter: "blur(6px)", transition: { duration: 0.18, ease: "easeIn" } },
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

/**
 * Interactive "hard truth" list. Resting the cursor on a problem shows its answer, and it stays
 * after the cursor leaves. Tap (phones) and arrow keys (keyboard) do the same.
 * Built as ARIA tabs: the problems are tabs, the answer is the tab panel.
 */
export function HardTruth() {
  const baseId = useId();
  const [active, setActive] = useState(2);
  const item = hardTruth[active];
  const creator = getCreator(item.creatorSlug);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Hover intent: switch only when the cursor rests on a row, so sweeping across the list
  // doesn't flash every answer. The last answer stays after the cursor leaves the list.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const onHover = (index: number) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActive(index), HOVER_INTENT_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = hardTruth.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (index + 1) % hardTruth.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (index - 1 + hardTruth.length) % hardTruth.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby={`${baseId}-heading`} className="border-y border-white/6 bg-canvas py-20 lg:py-24">
        <div className="page-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <h2 id={`${baseId}-heading`} className="sr-only">
              The problems FC Lads solves
            </h2>
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="Common FC problems"
              className="flex flex-col gap-2"
              onMouseLeave={() => clearTimeout(hoverTimer.current)}
            >
              {hardTruth.map((entry, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={entry.problem}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${index}`}
                    aria-selected={isActive}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActive(index)}
                    onMouseEnter={() => onHover(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className="group relative px-5 py-3.5 text-left outline-offset-4"
                  >
                    {/* Sliding skewed highlight follows the active row. */}
                    {isActive && (
                      <motion.span
                        layoutId={`${baseId}-highlight`}
                        aria-hidden
                        className="absolute inset-0"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      >
                        {/* Skew lives on an inner element: motion owns `transform` on the outer one. */}
                        <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-[#007a5a] via-[#1e40af] to-[#6366f1] shadow-[0_0_30px_rgb(0_122_90/0.4)]" />
                      </motion.span>
                    )}
                    <span
                      className={cn(
                        "relative flex items-center gap-3 font-display text-lg font-extrabold tracking-wide uppercase transition-all duration-300 lg:text-2xl",
                        isActive ? "translate-x-1 text-white" : "text-white/45 group-hover:text-white/80",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex w-6 shrink-0 justify-center transition-all duration-300",
                          isActive ? "scale-100 opacity-100" : "scale-50 opacity-0",
                        )}
                      >
                        <Zap className="size-6 text-mint" />
                      </span>
                      <span>
                        {index + 1}. {entry.problem}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="tabular mt-4 pl-5 text-xs text-muted">Point at a problem to see how we solve it.</p>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-6 lg:pl-6">
            <p className="flex items-center gap-2">
              <span aria-hidden className="h-6 w-1.5 rounded-full bg-primary" />
              <span className="font-logo text-xs font-bold tracking-widest uppercase">The hard truth</span>
            </p>
            <p className="text-lg leading-relaxed text-muted">
              Most players don&apos;t have the time to spend hundreds of hours figuring everything out. We do.
            </p>
            <p className="font-display text-3xl leading-none font-extrabold text-mint uppercase drop-shadow-[0_0_25px_rgb(143_240_201/0.3)] lg:text-4xl">
              You just get the answer.
            </p>

            <div
              role="tabpanel"
              id={`${baseId}-panel`}
              aria-labelledby={`${baseId}-tab-${active}`}
              className="relative min-h-[19rem] sm:min-h-64"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  variants={panel}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-rim"
                >
                  <motion.p variants={fadeUp} className="tabular text-[11px] font-bold tracking-widest text-mint uppercase">
                    Problem 0{active + 1} {"//"} Our answer
                  </motion.p>
                  <h3 className="font-display text-xl leading-tight font-extrabold uppercase lg:text-2xl">
                    {/* Real spaces between word spans so screen readers and copy/paste read normal text. */}
                    {item.answerTitle.split(" ").map((part, index) => (
                      <span key={`${part}-${index}`}>
                        {index > 0 && " "}
                        <motion.span variants={word} className="inline-block">
                          {part}
                        </motion.span>
                      </span>
                    ))}
                  </h3>
                  <motion.p variants={fadeUp} className="leading-relaxed text-muted">
                    {item.answer}
                  </motion.p>
                  <motion.div
                    variants={fadeUp}
                    className="mt-1 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4"
                  >
                    {creator && (
                      <span className="flex items-center gap-2.5">
                        <Avatar initials={creator.initials} size="sm" tone="mint" />
                        <span className="flex flex-col">
                          <span className="text-xs leading-none font-bold">{creator.name}</span>
                          <span className="text-[11px] text-muted">{creator.role}</span>
                        </span>
                      </span>
                    )}
                    <Link
                      href={item.cta.href}
                      className="text-label flex items-center gap-1.5 text-primary transition-colors hover:text-white"
                    >
                      {item.cta.label}
                      <ArrowRight aria-hidden className="size-3.5" />
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
