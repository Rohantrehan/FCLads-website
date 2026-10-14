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
