// Review times are shown and entered in UK time (Europe/London), whatever the viewer's own time zone.

const UK = "Europe/London";

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: UK, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: UK, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const longDay = new Intl.DateTimeFormat("en-GB", { timeZone: UK, weekday: "long", day: "numeric", month: "long" });
const shortDay = new Intl.DateTimeFormat("en-GB", { timeZone: UK, day: "numeric", month: "short" });
const monthName = new Intl.DateTimeFormat("en-GB", { timeZone: UK, month: "long" });

/** "2026-10-20" (the UK date of a moment) */
export const ukDay = (iso: string | Date) => dayFormat.format(new Date(iso));
/** "18:30" */
export const ukTime = (iso: string | Date) => timeFormat.format(new Date(iso));
/** "Tuesday 20 October" */
export const ukLongDay = (iso: string | Date) => longDay.format(new Date(iso));
/** "20 Oct" */
export const ukShortDay = (iso: string | Date) => shortDay.format(new Date(iso));
/** "October" */
export const ukMonthName = (iso: string | Date) => monthName.format(new Date(iso));
/** "2026-10-01": first day of the UK month a moment is in. */
export const ukMonthStart = (iso: string | Date) => `${ukDay(iso).slice(0, 7)}-01`;
/** "2026-11-01": first day of the following UK month. */
export function ukNextMonthStart(iso: string | Date) {
  const [year, month] = ukDay(iso).split("-").map(Number);
  return month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

const inputParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: UK,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** A moment → "2026-10-20T18:30" in UK time, for a datetime-local input. Same on server and browser. */
export function ukInputValue(iso: string | Date) {
  const parts = Object.fromEntries(inputParts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** "2026-10-20T18:30" read as UK time → ISO moment (UTC). Undefined if it isn't a valid value. */
export function ukInputToIso(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match.map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // UK is UTC+0 or UTC+1: try both and keep the one that reads back as the same wall time.
  for (const offset of [0, 60]) {
    const moment = new Date(wall - offset * 60_000);
    if (ukInputValue(moment) === value) return moment.toISOString();
  }
  return new Date(wall).toISOString();
}
