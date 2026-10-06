import { Lock, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ladsPlus } from "@/data/ladsPlus";
import { socialLinks } from "@/lib/site";

/** Sidebar widget: ask the analysts for a guide on Discord. */
export function DiscordRequest() {
  return (
    <aside className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5">
      <p className="text-label flex items-center gap-2 text-mint">
        <MessagesSquare aria-hidden className="size-4" />
        Guide requests
      </p>
      <h2 className="font-display text-lg leading-snug font-extrabold">Need a specific breakdown?</h2>
      <p className="text-sm text-muted">
        Ask the Lads to test a counter-tactic, slider setup or SBC solution on Discord.
      </p>
      <Button href={socialLinks.discord} variant="glass" size="sm" className="mt-1 rounded-lg">
        Request in Discord
      </Button>
    </aside>
  );
}

/** Wide upsell banner placed between rows of the guide grid. */
export function PlusBanner() {
  return (
    <aside className="flex flex-col items-start gap-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-pitch-green to-[#08160f] p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-[0_0_24px_rgb(43_217_139/0.4)]">
          <Lock aria-hidden className="size-6" />
        </span>
        <div>
          <p className="text-label text-mint">Pro tier</p>
          <h2 className="mt-1 font-display text-lg leading-snug font-extrabold">
            Want the deeper breakdowns? Premium guides are in FC Lads+.
          </h2>
          <p className="mt-1 text-sm text-muted">Slider codes, full VOD breakdowns and a monthly 1-on-1 review.</p>
        </div>
      </div>
      <Button href="/lads-plus" variant="glass" size="sm" className="shrink-0">
        See FC Lads+ ({ladsPlus.priceLabel}/mo)
      </Button>
    </aside>
  );
}
