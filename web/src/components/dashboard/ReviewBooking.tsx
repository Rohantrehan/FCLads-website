"use client";

import { useId, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, Info } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ReviewerOption {
  slug: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  ovr: number;
  /** ISO date → open times (UK time). */
  slots: Record<string, string[]>;
}

interface ReviewBookingProps {
  reviewers: ReviewerOption[];
  /** First and last bookable days (ISO). */
  today: string;
  deadline: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Days of the month as a Monday-first grid, with blanks before the 1st. */
function monthGrid(anyDay: string) {
  const first = utc(anyDay);
  first.setUTCDate(1);
  const blanks = (first.getUTCDay() + 6) % 7;
  const days: (string | null)[] = Array.from({ length: blanks }, () => null);
  const cursor = new Date(first);
  while (cursor.getUTCMonth() === first.getUTCMonth()) {
    days.push(iso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { label: monthLabel.format(first), days };
}

/**
 * Book the monthly review: choose a Lad, then a day, then a time.
 * Bookings aren't saved yet (no backend); confirming shows the confirmed state only.
 */
export function ReviewBooking({ reviewers, today, deadline }: ReviewBookingProps) {
  const [reviewerSlug, setReviewerSlug] = useState(reviewers[0]?.slug);
  const [day, setDay] = useState<string>();
  const [time, setTime] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);
  const id = useId();

  const reviewer = reviewers.find((item) => item.slug === reviewerSlug);
  const { label, days } = useMemo(() => monthGrid(today), [today]);
  const openTimes = (date: string) => (date > today && date <= deadline ? (reviewer?.slots[date] ?? []) : []);
  const times = day ? openTimes(day) : [];

  const chooseReviewer = (slug: string) => {
    setReviewerSlug(slug);
    setDay(undefined);
    setTime(undefined);
  };

  if (confirmed && reviewer && day && time) {
    return (
      <section
        aria-labelledby={`${id}-done`}
        className="flex flex-col items-center gap-4 rounded-2xl border border-primary/40 bg-gradient-to-b from-pitch-green/60 to-[#0f141b] p-6 text-center md:p-10"
      >
        <CheckCircle2 aria-hidden className="size-12 text-primary" />
        <h2 id={`${id}-done`} className="font-display text-2xl font-extrabold uppercase">
          You&apos;re booked in
        </h2>
        <p className="max-w-md text-muted">
          {reviewer.name} will go through your match with you on{" "}
          <strong className="text-white">
            {dayLabel.format(utc(day))} at {time}
          </strong>{" "}
          (UK time). We&apos;ll email you a reminder and the session link the day before.
        </p>
        <button
          type="button"
          onClick={() => setConfirmed(false)}
          className="text-label rounded-lg border border-white/10 px-4 py-2.5 text-primary transition-colors hover:border-primary/50"
        >
          Change booking
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4">
          <span className="text-label block text-mint">Step 2a</span>
          <span className="font-display text-xl font-extrabold uppercase">Choose a Lad</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {reviewers.map((item) => {
            const selected = item.slug === reviewerSlug;
            return (
              <label
                key={item.slug}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
                  selected ? "border-primary bg-primary/10" : "border-white/8 bg-surface hover:border-white/25",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-reviewer`}
                  value={item.slug}
                  checked={selected}
                  onChange={() => chooseReviewer(item.slug)}
                  className="sr-only"
                />
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-highest font-display font-extrabold text-mint"
                  >
                    {item.initials}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display font-extrabold">{item.name}</span>
                    <span className="truncate text-xs text-muted">{item.role}</span>
                  </span>
                  {selected && <CheckCircle2 aria-hidden className="ml-auto size-5 shrink-0 text-primary" />}
                </span>
                <span className="text-sm text-muted">{item.specialty}</span>
                <span className="tabular flex justify-between rounded-lg bg-canvas/60 px-3 py-2 text-xs">
                  <span className="text-muted">Rating</span>
                  <span className="font-bold text-mint">{item.ovr} OVR</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col gap-4 md:col-span-7">
          <h3>
            <span className="text-label block text-mint">Step 2b</span>
            <span className="font-display text-xl font-extrabold uppercase">Pick a day</span>
          </h3>
          <div className="rounded-xl border border-white/8 bg-surface p-4">
            <p className="mb-3 flex items-center justify-between font-display font-extrabold">
              {label}
              <span className="tabular text-[11px] font-normal text-muted">
                Book by {shortDay.format(utc(deadline))}
              </span>
            </p>
            <div role="group" aria-label={`Days in ${label}`} className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} aria-hidden className="tabular py-1 text-[11px] text-muted">
                  {weekday}
                </span>
              ))}
              {days.map((date, index) => {
                if (!date) return <span key={`blank-${index}`} aria-hidden />;
                const count = openTimes(date).length;
                const selected = date === day;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={count === 0}
                    aria-pressed={selected}
                    aria-label={`${dayLabel.format(utc(date))}${count ? `, ${count} ${count === 1 ? "time" : "times"} free` : ", no times"}`}
                    onClick={() => {
                      setDay(date);
                      setTime(undefined);
                    }}
                    className={cn(
                      "tabular relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                      selected
                        ? "bg-primary font-bold text-on-primary"
                        : count
                          ? "bg-primary/10 font-semibold text-mint hover:bg-primary/20"
                          : "text-muted/40",
                    )}
                  >
                    {Number(date.slice(8))}
                    {count > 0 && !selected && (
                      <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
              <span aria-hidden className="size-2 rounded-full bg-primary" />
              {reviewer?.name} has free times
            </p>
          </div>
        </div>

        <fieldset className="flex flex-col gap-4 md:col-span-5">
          <legend className="mb-4">
            <span className="text-label block text-mint">Step 2c</span>
            <span className="font-display text-xl font-extrabold uppercase">Pick a time</span>
          </legend>
          {day ? (
            <div className="flex flex-col gap-2">
              <p className="tabular flex justify-between text-[11px] text-muted uppercase">
                <span>{dayLabel.format(utc(day))}</span>
                <span>UK time</span>
              </p>
              {times.map((slot) => {
                const selected = slot === time;
                return (
                  <label
                    key={slot}
                    className={cn(
                      "tabular flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-white/8 bg-surface hover:border-white/25",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-time`}
                      value={slot}
                      checked={selected}
                      onChange={() => setTime(slot)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 font-semibold">
                      <Clock aria-hidden className="size-4" />
                      {slot}
                    </span>
                    <span className={cn("text-[11px] uppercase", selected ? "font-bold" : "text-mint")}>
                      {selected ? "Selected" : "Free"}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="flex items-start gap-2 rounded-xl border border-dashed border-white/12 p-4 text-sm text-muted">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
              Pick a green day to see {reviewer?.name}&apos;s free times.
            </p>
          )}
        </fieldset>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!day || !time}
          onClick={() => setConfirmed(true)}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-display font-extrabold text-on-primary uppercase shadow-[0_0_24px_rgb(43_217_139/0.25)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-highest disabled:text-muted disabled:shadow-none"
        >
          <CalendarCheck aria-hidden className="size-5 shrink-0" />
          {day && time && reviewer
            ? `Confirm with ${reviewer.name} · ${shortDay.format(utc(day))}, ${time}`
            : "Pick a day and time to book"}
        </button>
        <p className="text-center text-xs text-muted">
          Sessions are a 30-minute screen share, recorded so you can watch it again.
        </p>
      </div>
    </div>
  );
}
