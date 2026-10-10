import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, CheckCircle2, Hash, MessagesSquare, Video } from "lucide-react";
import { AccountHeading, fmtDate, SignInToManage } from "@/components/account/AccountBits";
import { MembershipPlan } from "@/components/account/MembershipPlan";
import { DashPanel, ProgressBar } from "@/components/dashboard/DashboardBits";
import { Button } from "@/components/ui/Button";
import { membership } from "@/data/account";
import { guides } from "@/data/guides";
import { ladsPlus, ladsPlusPerks, type PerkKey } from "@/data/ladsPlus";
import { currentReview, discordAccount } from "@/data/memberDashboard";
import { socialLinks } from "@/lib/site";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Membership" };

const perkTags: Record<PerkKey, string> = {
  guides: `${guides.length} guides`,
  discord: "Members role",
  creators: "Ask the Lads",
  trading: "Every Monday",
  review: "1 a month",
};

const losses: Record<PerkKey, string> = {
  guides: "Members-only guides, slider codes and the FC 27 video collections",
  discord: "The members channels and Q&As with the creators",
  creators: "Weekly squad and chemistry fixes from the Lads",
  trading: "Monday buy targets and exit prices",
  review: "Your 1-on-1 review (any unused review this month is lost)",
};

export default async function MembershipPage() {
  const viewer = await getViewer();
  if (!viewer.isSignedIn) return <SignInToManage />;

  const reviewsLeft = currentReview.credits.total - currentReview.credits.used;

  return (
    <>
      <AccountHeading title="Membership" description="Your FC Lads+ plan, what's included and your Discord link." />

      <MembershipPlan
        plan={membership.plan}
        subscriptionId={membership.subscriptionId}
        priceLabel={ladsPlus.priceLabel}
        nextPayment={fmtDate(membership.nextPayment)}
        nextPaymentShort={fmtDate(membership.nextPayment, "short")}
        memberSince={fmtDate(membership.memberSince, "month")}
        losses={ladsPlusPerks.map((perk) => ({ title: perk.title, detail: losses[perk.key] }))}
      >
        <DashPanel id="included-heading" title="What's included">
          <ul className="flex flex-col gap-2">
            {ladsPlusPerks.map((perk) => (
              <li key={perk.key} className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4">
                <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{perk.title}</span>
                  <span className="text-sm text-muted">{perk.description}</span>
                </span>
                <span className="tabular hidden shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-mint uppercase sm:inline">
                  {perkTags[perk.key]}
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
                {currentReview.month}
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl leading-none font-extrabold">{reviewsLeft} left this month</p>
              <p className="text-sm text-muted">
                Book before {fmtDate(currentReview.deadline, "short")}. You get a new one on the 1st of every month.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <p className="tabular flex justify-between text-[11px] text-muted uppercase">
                <span>Used</span>
                <span className="text-mint">
                  {currentReview.credits.used} / {currentReview.credits.total}
                </span>
              </p>
              <ProgressBar
                value={(currentReview.credits.used / currentReview.credits.total) * 100}
                label={`${currentReview.credits.used} of ${currentReview.credits.total} reviews used`}
              />
            </div>
            <Button href="/dashboard/review" variant="glass" size="md" className="w-full">
              Book my review
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </DashPanel>

          <DashPanel
            id="discord-link-heading"
            title="Discord"
            icon={<MessagesSquare aria-hidden className="size-5 text-primary" />}
            action={
              <span className="tabular flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-mint uppercase">
                <span aria-hidden className="size-1.5 rounded-full bg-mint" />
                {discordAccount.connected ? "Connected" : "Not connected"}
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl leading-none font-extrabold">
                {discordAccount.connected ? "You're in" : "Link Discord"}
              </p>
              <p className="text-sm text-muted">
                Linked as <strong className="text-white">{discordAccount.username}</strong> with the FC Lads+ role, so
                the members channels are open to you.
              </p>
            </div>
            <p className="mt-auto flex items-center gap-3 rounded-xl border border-white/8 bg-surface p-3 text-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-azure/15 text-[#93c5fd]">
                <Hash aria-hidden className="size-4" />
              </span>
              <span>
                <span className="block font-semibold">FC Lads · #general</span>
                <span className="text-xs text-muted">Members role active</span>
              </span>
            </p>
            <Button
              href={socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              variant="glass"
              size="md"
              className="w-full"
            >
              Open Discord
              <ArrowUpRight aria-hidden className="size-4" />
            </Button>
          </DashPanel>
        </div>
      </MembershipPlan>
    </>
  );
}
