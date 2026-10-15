import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarPlus, ClipboardList, History, Trash2, Users } from "lucide-react";
import { removeSlot } from "@/app/(site)/creator/actions";
import { AddTimes } from "@/components/creator/AddTimes";
import { SessionCard, type SessionView } from "@/components/creator/SessionCard";
import { DashboardHeading, DashPanel } from "@/components/dashboard/DashboardBits";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getContent } from "@/lib/content";
import { getCreatorReviews } from "@/lib/reviews";
import { ukDay, ukLongDay, ukShortDay, ukTime } from "@/lib/ukTime";
import { canRunReviews, getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Creator hub", robots: { index: false } };

function Gate({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="page-container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-headline">{title}</h1>
      <p className="max-w-md text-muted">{text}</p>
      {action}
    </div>
  );
}

/** Creators run their gameplay reviews here: free times, booked sessions, plans. Admins can pick any creator. */
export default async function CreatorHubPage({ searchParams }: PageProps<"/creator">) {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) {
    return (
      <Gate
        title="Creator hub"
        text="Log in with your creator account to manage your gameplay reviews."
        action={<Button href="/login?next=/creator">Log in</Button>}
      />
    );
  }
  if (!canRunReviews(viewer)) {
    return <Gate title="Creators only" text="This page is for the FC Lads creators who run gameplay reviews." />;
  }

  const content = await getContent();
  const isAdmin = viewer.role === "admin";
  const reviewers = content.creators.filter((creator) => creator.reviewSpecialty);
  const requested = (await searchParams).creator;
  const slug =
    isAdmin && typeof requested === "string" && content.getCreator(requested)
      ? requested
      : (viewer.creatorSlug ?? (isAdmin ? reviewers[0]?.slug : undefined));

  if (!slug) {
    return (
      <Gate
        title="Almost there"
        text="Your account isn't linked to a creator profile yet. Ask an admin to link it, then come back."
      />
    );
  }

  const creator = content.getCreator(slug);
  const { freeSlots, toRun, past, now } = await getCreatorReviews(slug);
  const today = ukDay(new Date(now));
  const lastDay = ukDay(new Date(now + 90 * 86_400_000));
  // Admins acting for someone else pass the creator to the actions.
  const actingFor = isAdmin && slug !== viewer.creatorSlug ? slug : undefined;

  const sessions: SessionView[] = toRun.map((booking) => ({
    id: booking.id,
    memberName: booking.memberName,
    when: `${ukLongDay(booking.startsAt)} · ${ukTime(booking.startsAt)}`,
    started: new Date(booking.startsAt).getTime() <= now,
    matchUrl: booking.matchUrl,
    focus: booking.focus,
    meetingUrl: booking.meetingUrl,
  }));

  const slotsByDay = freeSlots.reduce<Record<string, typeof freeSlots>>((groups, slot) => {
    (groups[ukDay(slot.startsAt)] ??= []).push(slot);
    return groups;
  }, {});

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Creator hub"
        title={
          <>
            Gameplay reviews{creator && <span className="text-primary"> · {creator.name}</span>}
          </>
        }
        description="Add the times you're free, run your sessions, then send each member a short plan. All times are UK time."
      />

      {isAdmin && (
        <nav aria-label="Choose a creator" className="flex flex-wrap items-center gap-2">
          <span className="text-label text-muted">Admin · viewing</span>
          {reviewers.map((item) => (
            <Link
              key={item.slug}
              href={`/creator?creator=${item.slug}`}
              aria-current={item.slug === slug ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-bold uppercase",
                item.slug === slug
                  ? "border-primary bg-primary text-on-primary"
                  : "border-white/10 text-muted hover:text-white",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {!creator?.reviewSpecialty && (
        <p className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
          Members can&apos;t pick you yet: add &ldquo;what you review best&rdquo; to your creator profile on the posting board
          (an admin can do it under Creators).
        </p>
      )}

      <section aria-labelledby="sessions-heading" className="flex flex-col gap-4">
        <h2 id="sessions-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
          <Users aria-hidden className="size-5 text-primary" />
          Booked sessions
          <span className="tabular text-xs text-muted">{sessions.length}</span>
        </h2>
        {sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 p-6 text-sm text-muted">
            No sessions booked yet. Members can book any free time you add below.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <DashPanel
          id="add-times-heading"
          title="Add free times"
          icon={<CalendarPlus aria-hidden className="size-5 text-primary" />}
          className="lg:col-span-7"
        >
          <AddTimes today={today} lastDay={lastDay} creator={actingFor} />
        </DashPanel>

        <DashPanel
          id="free-times-heading"
          title="Your free times"
          icon={<CalendarDays aria-hidden className="size-5 text-primary" />}
          className="lg:col-span-5"
        >
          {freeSlots.length === 0 ? (
            <p className="text-sm text-muted">None yet. Add some on the left.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {Object.entries(slotsByDay).map(([day, slots]) => (
                <li key={day} className="flex flex-col gap-2">
                  <p className="text-label text-mint">{ukLongDay(slots[0].startsAt)}</p>
                  <ul className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <li key={slot.id}>
                        <form action={removeSlot} className="flex">
                          <input type="hidden" name="slot" value={slot.id} />
                          <span className="tabular rounded-l-lg border border-r-0 border-white/10 bg-surface px-3 py-1.5 text-sm">
                            {ukTime(slot.startsAt)}
                          </span>
                          <button
                            type="submit"
                            aria-label={`Remove ${ukShortDay(slot.startsAt)} ${ukTime(slot.startsAt)}`}
                            className="flex items-center rounded-r-lg border border-white/10 px-2 text-muted hover:border-danger/50 hover:text-danger-soft"
                          >
                            <Trash2 aria-hidden className="size-3.5" />
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </DashPanel>
      </div>

      <section aria-labelledby="past-heading" className="flex flex-col gap-4">
        <h2 id="past-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
          <History aria-hidden className="size-5 text-primary" />
          Done in the last 90 days
          <span className="tabular text-xs text-muted">{past.length}</span>
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted">Finished sessions show up here.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {past.map((booking) => (
              <li key={booking.id} className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0f141b] p-4 text-sm">
                <p className="flex items-center justify-between gap-2">
                  <span className="font-bold">{booking.memberName}</span>
                  <span
                    className={cn(
                      "tabular rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      booking.status === "missed" ? "bg-danger/15 text-danger-soft" : "bg-primary/15 text-mint",
                    )}
                  >
                    {booking.status === "missed" ? "Missed" : "Done"}
                  </span>
                </p>
                <p className="tabular text-xs text-muted">
                  {ukShortDay(booking.startsAt)} · {ukTime(booking.startsAt)}
                </p>
                {booking.plan.length > 0 && (
                  <p className="flex items-start gap-1.5 text-muted">
                    <ClipboardList aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {booking.plan.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
