"use client";

import { useActionState, useId, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { addSlots, type CreatorFormState } from "@/app/(site)/creator/actions";
import { cn } from "@/lib/cn";

/** Every half hour from 09:00 to 23:30 (UK time). */
const TIMES = Array.from({ length: 30 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
});

/** Pick a day, tick the times you're free, save. Times are UK time, 30 minutes each. */
export function AddTimes({ today, lastDay, creator }: { today: string; lastDay: string; creator?: string }) {
  const id = useId();
  const [day, setDay] = useState(today);
  const [picked, setPicked] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState(async (prev: CreatorFormState, data: FormData) => {
    const result = await addSlots(prev, data);
    if (result.ok) setPicked([]);
    return result;
  }, {});

  const toggle = (time: string) =>
    setPicked((current) => (current.includes(time) ? current.filter((item) => item !== time) : [...current, time].sort()));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {creator && <input type="hidden" name="creator" value={creator} />}
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-day`} className="text-sm font-semibold">
          Day
        </label>
        <input
          id={`${id}-day`}
          name="day"
          type="date"
          required
          min={today}
          max={lastDay}
          value={day}
          onChange={(event) => setDay(event.target.value)}
          className="w-full max-w-xs rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm [color-scheme:dark] focus:border-primary/60 focus:outline-none"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">
          Times you&apos;re free <span className="font-normal text-muted">(UK time, 30 minutes each)</span>
        </legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {TIMES.map((time) => {
            const checked = picked.includes(time);
            return (
              <label
                key={time}
                className={cn(
                  "tabular flex cursor-pointer items-center justify-center rounded-lg border py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint/60",
                  checked
                    ? "border-primary bg-primary font-bold text-on-primary"
                    : "border-white/8 bg-surface hover:border-white/25",
                )}
              >
                <input
                  type="checkbox"
                  name="times"
                  value={time}
                  checked={checked}
                  onChange={() => toggle(time)}
                  className="sr-only"
                />
                {time}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || picked.length === 0}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-display font-extrabold text-on-primary uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-highest disabled:text-muted"
        >
          <CalendarPlus aria-hidden className="size-5" />
          {pending
            ? "Adding…"
            : picked.length
              ? `Add ${picked.length} ${picked.length === 1 ? "time" : "times"}`
              : "Pick some times"}
        </button>
        <p aria-live="polite" className={cn("text-sm", state.message ? "text-danger-soft" : "text-mint")}>
          {state.message ?? state.ok}
        </p>
      </div>
    </form>
  );
}
