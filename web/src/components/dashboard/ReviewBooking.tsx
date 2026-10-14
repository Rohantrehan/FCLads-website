"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock, Info, Link2 } from "lucide-react";
import { bookReview, type ReviewFormState } from "@/app/(site)/dashboard/review/actions";
import { cn } from "@/lib/cn";

export interface ReviewerOption {
  slug: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  ovr: number;
}

/** A free time, already turned into UK date and time on the server. */
export interface SlotOption {
  id: string;
  creatorSlug: string;
  /** UK date, e.g. "2026-10-20" */
  day: string;
  /** UK time, e.g. "18:30" */
  time: string;
}

interface ReviewBookingProps {
  reviewers: ReviewerOption[];
  slots: SlotOption[];
  /** Today in the UK (ISO date). */
  today: string;
  /** First days ("2026-10-01") of months that already have a review. */
  usedMonths: string[];
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const monthOf = (day: string) => `${day.slice(0, 7)}-01`;

/** Days of a month as a Monday-first grid, with blanks before the 1st. */
function monthGrid(firstDay: string) {
  const first = utc(firstDay);
  const blanks = (first.getUTCDay() + 6) % 7;
  const days: (string | null)[] = Array.from({ length: blanks }, () => null);
  const cursor = new Date(first);
  while (cursor.getUTCMonth() === first.getUTCMonth()) {
    days.push(iso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { label: monthLabel.format(first), days };
}

function shiftMonth(firstDay: string, by: number) {
  const date = utc(firstDay);
  date.setUTCMonth(date.getUTCMonth() + by);
  return iso(date);
}

const field =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm placeholder:text-muted/60 focus:border-primary/60 focus:outline-none";

/**
 * Book the monthly review: choose a Lad, a day and a time, then share the match.
 * Saved with a server action; the database re-checks every rule.
 */
export function ReviewBooking({ reviewers, slots, today, usedMonths }: ReviewBookingProps) {
  const id = useId();
  const used = useMemo(() => new Set(usedMonths), [usedMonths]);
  const bookable = useMemo(() => slots.filter((slot) => !used.has(monthOf(slot.day))), [slots, used]);
  const firstWithSlots = reviewers.find((item) => bookable.some((slot) => slot.creatorSlug === item.slug));

  const [reviewerSlug, setReviewerSlug] = useState(firstWithSlots?.slug ?? reviewers[0]?.slug);
  const reviewerSlots = useMemo(() => bookable.filter((slot) => slot.creatorSlug === reviewerSlug), [bookable, reviewerSlug]);
  const firstMonth = monthOf(today);
  const lastMonth = reviewerSlots.length ? monthOf(reviewerSlots.at(-1)!.day) : firstMonth;
  const [month, setMonth] = useState(reviewerSlots[0] ? monthOf(reviewerSlots[0].day) : firstMonth);
  const [day, setDay] = useState<string>();
  const [slotId, setSlotId] = useState<string>();
  const [errors, setErrors] = useState<ReviewFormState["errors"]>();
  const [state, formAction, pending] = useActionState(async (prev: ReviewFormState, data: FormData) => {
    const result = await bookReview(prev, data);
    setErrors(result.errors);
    return result;
  }, {});

  const reviewer = reviewers.find((item) => item.slug === reviewerSlug);
  const { label, days } = useMemo(() => monthGrid(month), [month]);
  const timesOn = (date: string) => reviewerSlots.filter((slot) => slot.day === date);
  const times = day ? timesOn(day) : [];
  const chosen = slots.find((slot) => slot.id === slotId);

  const chooseReviewer = (slug: string) => {
    setReviewerSlug(slug);
    setDay(undefined);
    setSlotId(undefined);
    const next = bookable.find((slot) => slot.creatorSlug === slug);
    setMonth(next ? monthOf(next.day) : firstMonth);
  };

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        const url = String(data.get("matchUrl") ?? "").trim();
        const found = {
          slot: slotId ? undefined : "Pick a day and a time.",
          matchUrl: /^https:\/\/\S+$/.test(url) ? undefined : "Paste a link to your match that starts with https://",
        };
        if (found.slot || found.matchUrl) {
          event.preventDefault();
          setErrors(found);
        }
      }}
      className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6"
    >
      <input type="hidden" name="slot" value={slotId ?? ""} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4">
          <span className="text-label block text-mint">Step 1a</span>
          <span className="font-display text-xl font-extrabold uppercase">Choose a Lad</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {reviewers.map((item) => {
            const selected = item.slug === reviewerSlug;
            const free = bookable.filter((slot) => slot.creatorSlug === item.slug).length;
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
                  <span className="text-muted">Free times</span>
                  <span className={cn("font-bold", free ? "text-mint" : "text-muted")}>{free || "None yet"}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col gap-4 md:col-span-7">
          <h3>
            <span className="text-label block text-mint">Step 1b</span>
            <span className="font-display text-xl font-extrabold uppercase">Pick a day</span>
          </h3>
          <div className="rounded-xl border border-white/8 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, -1))}
                disabled={month <= firstMonth}
                aria-label="Previous month"
                className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <p className="font-display font-extrabold" aria-live="polite">
                {label}
              </p>
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, 1))}
                disabled={month >= lastMonth}
                aria-label="Next month"
                className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>
            <div role="group" aria-label={`Days in ${label}`} className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} aria-hidden className="tabular py-1 text-[11px] text-muted">
                  {weekday}
                </span>
              ))}
              {days.map((date, index) => {
                if (!date) return <span key={`blank-${index}`} aria-hidden />;
                const count = timesOn(date).length;
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
                      setSlotId(undefined);
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
              {reviewerSlots.length
                ? `${reviewer?.name} has free times`
                : `${reviewer?.name ?? "This Lad"} has no free times right now. Try another Lad or check back soon.`}
            </p>
          </div>
        </div>

        <fieldset className="flex flex-col gap-4 md:col-span-5">
          <legend className="mb-4">
            <span className="text-label block text-mint">Step 1c</span>
            <span className="font-display text-xl font-extrabold uppercase">Pick a time</span>
          </legend>
          {day ? (
            <div className="flex flex-col gap-2">
              <p className="tabular flex justify-between text-[11px] text-muted uppercase">
                <span>{dayLabel.format(utc(day))}</span>
                <span>UK time</span>
              </p>
              {times.map((slot) => {
                const selected = slot.id === slotId;
                return (
                  <label
                    key={slot.id}
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
                      value={slot.id}
                      checked={selected}
                      onChange={() => {
                        setSlotId(slot.id);
                        setErrors((current) => ({ ...current, slot: undefined }));
                      }}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 font-semibold">
                      <Clock aria-hidden className="size-4" />
                      {slot.time}
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
          {errors?.slot && (
            <p role="alert" className="text-sm text-danger-soft">
              {errors.slot}
            </p>
          )}
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4">
          <span className="text-label block text-mint">Step 1d</span>
          <span className="font-display text-xl font-extrabold uppercase">Share your match</span>
        </legend>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-match`} className="text-sm font-semibold">
            Link to your match
          </label>
          <div className="relative">
            <Link2 aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input
              id={`${id}-match`}
              name="matchUrl"
              type="url"
              inputMode="url"
              placeholder="https://youtu.be/…"
              aria-invalid={errors?.matchUrl ? true : undefined}
              aria-describedby={`${id}-match-hint${errors?.matchUrl ? ` ${id}-match-error` : ""}`}
              onChange={() => setErrors((current) => ({ ...current, matchUrl: undefined }))}
              className={cn(field, "pl-11", errors?.matchUrl && "border-danger/70")}
            />
          </div>
          <p id={`${id}-match-hint`} className="text-xs text-muted">
            An unlisted YouTube video, a Google Drive or Medal link: anything the Lad can open. Full match, if you can.
          </p>
          {errors?.matchUrl && (
            <p id={`${id}-match-error`} role="alert" className="text-sm text-danger-soft">
              {errors.matchUrl}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-focus`} className="text-sm font-semibold">
            What should we look at? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={`${id}-focus`}
            name="focus"
            rows={3}
            maxLength={500}
            placeholder="e.g. I keep getting caught on cutbacks and lose the ball in transition."
            className={field}
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        {state.message && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger-soft">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-display font-extrabold text-on-primary uppercase shadow-[0_0_24px_rgb(43_217_139/0.25)] transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          <CalendarCheck aria-hidden className="size-5 shrink-0" />
          {pending
            ? "Booking…"
            : chosen && reviewer
              ? `Book with ${reviewer.name} · ${shortDay.format(utc(chosen.day))}, ${chosen.time}`
              : "Book my session"}
        </button>
        <p className="text-center text-xs text-muted">
          A 30-minute screen share, recorded so you can watch it again. You can cancel or move it up to 12 hours before.
        </p>
      </div>
    </form>
  );
}
