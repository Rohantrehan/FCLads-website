"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const GAP_PX = 20; // keep in sync with `gap-5`
const RESUME_AFTER_TOUCH_MS = 3000;

interface AutoScrollRowProps {
  children: ReactNode;
  /** Number of items. Auto-scroll only runs with 2 or more. */
  count: number;
  /** Pixels per second. */
  speed?: number;
  label: string;
  className?: string;
}

/**
 * Horizontal row that scrolls by itself in a seamless loop.
 * Pauses on mouse hover, keyboard focus and touch; has a Pause/Play button (WCAG 2.2.2);
 * stays still when off-screen or when the user prefers reduced motion.
 * The items are rendered twice so the loop has no visible jump; the copy is hidden from
 * screen readers and keyboard (`inert`).
 */
export function AutoScrollRow({ children, count, speed = 40, label, className }: AutoScrollRowProps) {
  const reducedMotion = usePrefersReducedMotion();
  const canAnimate = !reducedMotion && count >= 2;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const running = canAnimate && !userPaused && !interacting;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const firstSet = firstSetRef.current;
    if (!running || !scroller || !firstSet) return;

    let frame = 0;
    let last = performance.now();
    let visible = true;
    // Float position: browsers round scrollLeft, which would stall slow speeds.
    let position = scroller.scrollLeft;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(scroller);

    const tick = (now: number) => {
      const delta = Math.min(now - last, 64); // avoid a jump after the tab was hidden
      last = now;
      if (visible) {
        const loopWidth = firstSet.offsetWidth + GAP_PX;
        position += (speed * delta) / 1000;
        if (position >= loopWidth) position -= loopWidth;
        scroller.scrollLeft = position;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [running, speed]);

  // Touch: pause while the finger is down, resume a few seconds after release.
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(resumeTimer.current), []);
  const scheduleResume = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), RESUME_AFTER_TOUCH_MS);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        className="scrollbar-none -mx-4 flex gap-5 overflow-x-auto px-4 pt-1 pb-4 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-48px),transparent)] md:-mx-8 md:px-8 lg:mx-0 lg:px-1"
        onPointerEnter={(event) => event.pointerType === "mouse" && setInteracting(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && setInteracting(false)}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return;
          clearTimeout(resumeTimer.current);
          setInteracting(true);
        }}
        onPointerUp={scheduleResume}
        onPointerCancel={scheduleResume}
        onFocus={() => setInteracting(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
        }}
      >
        <div ref={firstSetRef} className="flex shrink-0 gap-5">
          {children}
        </div>
        {canAnimate && (
          <div aria-hidden inert className="flex shrink-0 gap-5">
            {children}
          </div>
        )}
      </div>

      {canAnimate && (
        <button
          type="button"
          onClick={() => setUserPaused((value) => !value)}
          aria-pressed={userPaused}
          className="tabular absolute -top-10 right-0 flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-muted uppercase transition-colors hover:border-mint/50 hover:text-white"
        >
          {userPaused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
          {userPaused ? "Play" : "Pause"}
          <span className="sr-only"> automatic scrolling</span>
        </button>
      )}
    </div>
  );
}
