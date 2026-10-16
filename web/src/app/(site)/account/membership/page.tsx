import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, CheckCircle2, MessagesSquare, Video } from "lucide-react";
import { AccountHeading, fmtDate, FreePlan, SignInToManage } from "@/components/account/AccountBits";
import { StatusNote } from "@/components/auth/AuthBits";
import { MembershipPlan } from "@/components/account/MembershipPlan";
import { DashPanel, ProgressBar } from "@/components/dashboard/DashboardBits";
import { Button } from "@/components/ui/Button";
import { getContent, getPlus } from "@/lib/content";
import { withSeason } from "@/lib/format";
import { getMembership } from "@/lib/membership";
import { getReviewSummary } from "@/lib/reviews";
import { ukShortDay } from "@/lib/ukTime";
import { getViewer } from "@/lib/viewer";
import type { PerkKey } from "@/types";

export const metadata: Metadata = { title: "Membership" };

const perkTags = (guideCount: number): Record<PerkKey, string> => ({
  guides: `${guideCount} guides`,
  discord: "Members role",
  creators: "Ask the Lads",
  trading: "Members posts",
  review: "1 a month",
});

const losses: Record<PerkKey, string> = {
  guides: "Members-only guides, slider codes and the {season} video collections",
  discord: "The members channels and Q&As with the creators",
  creators: "Weekly squad and chemistry fixes from the Lads",
  trading: "Members-only trading posts and screenshots",
  review: "Your 1-on-1 review (any unused review this month is lost)",
};

export default async function MembershipPage({ searchParams }: PageProps<"/account/membership">) {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return <SignInToManage />;

  const passwordNote = (await searchParams).password === "updated" && (
    <StatusNote tone="success">Your password has been changed.</StatusNote>
  );

  if (!viewer.isMember) {
    return (
      <>
        <AccountHeading title="Membership" description="Your plan and what FC Lads+ adds." />
        {passwordNote}
        <FreePlan name={viewer.name} email={viewer.email} />
      </>
    );
  }

  const [review, content, plus, membership] = await Promise.all([
    getReviewSummary(viewer),
    getContent(),
    getPlus(),
    getMembership(viewer),
  ]);
  const reviewsLeft = review.left;
  const tags = perkTags(content.guides.length);
  const season = content.settings.currentSeason;
  const discordInvite = content.settings.socials.discord;
  const onTrial = membership?.status === "trialing";
  const renewsOn = onTrial ? (membership?.trialEnd ?? membership?.currentPeriodEnd) : membership?.currentPeriodEnd;

  return (
    <>
      <AccountHeading title="Membership" description="Your FC Lads+ plan, what's included and your Discord link." />
      {passwordNote}

      <MembershipPlan
        plan="FC Lads+"
        subscriptionId={membership?.subscriptionId}
        priceLabel={plus.priceLabel}
        statusLabel={membership?.statusLabel ?? "Active membership"}
        autoRenew={!membership?.cancelAtPeriodEnd}
        dateLabel={onTrial ? "Trial ends" : "Next payment"}
        nextPayment={renewsOn ? fmtDate(renewsOn) : "Not set yet"}
        nextPaymentShort={renewsOn ? fmtDate(renewsOn, "short") : "soon"}
        memberSince={membership ? fmtDate(membership.memberSince, "month") : "this month"}
        losses={plus.perks.map((perk) => ({ title: perk.title, detail: withSeason(losses[perk.key], season) }))}
      >
        <DashPanel id="included-heading" title="What's included">
          <ul className="flex flex-col gap-2">
            {plus.perks.map((perk) => (
              <li key={perk.key} className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4">
                <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{perk.title}</span>
                  <span className="text-sm text-muted">{withSeason(perk.description, season)}</span>
                </span>
                <span className="tabular hidden shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-mint uppercase sm:inline">
                  {tags[perk.key]}
                </span>
              </li>
            ))}
          </ul>
        </DashPanel>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashPanel
            id="review-quota-heading"
            title="Gameplay review"
            icon={<Video aria-hidden className="size-5 text-primary" />}
            action={
              <span className="tabular rounded-md border border-white/10 px-2 py-1 text-[11px] text-muted uppercase">
                {review.month}
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl leading-none font-extrabold">{reviewsLeft} left this month</p>
              <p className="text-sm text-muted">
                {review.left > 0 ? `Use it by ${ukShortDay(review.lastDay)}. ` : ""}You get a new one on the 1st of every month.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <p className="tabular flex justify-between text-[11px] text-muted uppercase">
                <span>Used</span>
                <span className="text-mint">
                  {review.used} / {review.total}
                </span>
              </p>
              <ProgressBar
                value={(review.used / review.total) * 100}
                label={`${review.used} of ${review.total} reviews used`}
              />
            </div>
            <Button href="/dashboard/review" variant="glass" size="md" className="w-full">
              {review.open ? "See my review" : "Send my match"}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </DashPanel>

          <DashPanel
            id="discord-link-heading"
            title="Discord"
            icon={<MessagesSquare aria-hidden className="size-5 text-primary" />}
            action={
              <span className="tabular rounded-md border border-white/10 px-2 py-1 text-[11px] text-muted uppercase">
                Not linked
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl leading-none font-extrabold">Join the server</p>
              <p className="text-sm text-muted">
                Automatic linking of your Discord account and the FC Lads+ role is coming soon. Until then, join with
                the invite and ask a Lad for the members role.
              </p>
            </div>
            {discordInvite ? (
              <Button href={discordInvite} target="_blank" rel="noopener noreferrer" variant="glass" size="md" className="mt-auto w-full">
                Open Discord
                <ArrowUpRight aria-hidden className="size-4" />
              </Button>
            ) : (
              <p className="mt-auto text-sm text-muted">The invite link will appear here soon.</p>
            )}
          </DashPanel>
        </div>
      </MembershipPlan>
    </>
  );
}
