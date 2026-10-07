import { CheckCircle2, MessagesSquare, SendHorizontal, Upload, Video, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/DataBits";
import { creators } from "@/data/creators";
import { cn } from "@/lib/cn";

/** Two-column benefit row: visual on one side, text on the other (alternating with `reverse`). */
function BenefitRow({
  id,
  eyebrow,
  title,
  children,
  visual,
  reverse,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 py-14 lg:py-20">
      <div className="page-container grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn(reverse && "lg:order-2")}>{visual}</div>
        <div className="flex flex-col gap-4">
          <p className="text-label text-mint">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="text-headline">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="tabular rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DiscordSection() {
  return (
    <BenefitRow
      id="discord"
      eyebrow="Community // members only"
      title="Private Discord community"
      visual={
        <div className="glass overflow-hidden rounded-2xl shadow-rim">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <p className="tabular flex items-center gap-2 text-xs text-muted">
              <MessagesSquare aria-hidden className="size-4 text-mint" /># tactics-room
            </p>
            <p className="tabular text-[11px] text-primary">Members online</p>
          </div>
          <ul className="flex flex-col gap-4 p-4 text-sm">
            <li className="flex gap-3">
              <Avatar initials="ST" tone="mint" size="sm" />
              <div>
                <p className="text-xs">
                  <span className="font-bold text-mint">Stefan</span>{" "}
                  <span className="rounded bg-primary px-1 text-[10px] font-bold text-on-primary">COACH</span>
                </p>
                <p className="mt-1 text-on-surface/90">
                  Drop your direct passing to 45 after today&apos;s patch. Full-backs get caught too high if width is
                  over 50.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Avatar initials="MK" size="sm" />
              <div>
                <p className="text-xs font-bold">Marcus_WL</p>
                <p className="mt-1 text-on-surface/90">Tried this in qualifiers and went 10-0. Thanks!</p>
              </div>
            </li>
          </ul>
          <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-[#090d14] px-3 py-2.5 text-sm text-muted">
            Message #tactics-room…
            <SendHorizontal aria-hidden className="size-4 text-primary" />
          </div>
        </div>
      }
    >
      <p className="text-lg text-muted">
        Join a private community of competitive players, creators and moderators. Never grind alone or wonder if your
        formation is holding you back.
      </p>
      <Pills
        items={[
          "Talk tactics & adjustments",
          "Show your squad",
          "Live market chat",
          "Patch-day debates",
          "Get help when you're stuck",
        ]}
      />
    </BenefitRow>
  );
}

export function CreatorAccessSection() {
  return (
    <BenefitRow
      id="creators"
      eyebrow="Pro coaching // direct line"
      title="Direct creator access"
      reverse
      visual={
        <ul className="grid grid-cols-2 gap-3">
          {creators.map((creator) => (
            <li key={creator.slug} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#0f141b] p-4">
              <div className="flex items-start justify-between gap-2">
                <Avatar initials={creator.initials} tone="mint" />
                {creator.highlight && (
                  <span className="tabular rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted uppercase">
                    {creator.highlight.value}
                  </span>
                )}
              </div>
              <div>
                <p className="font-display font-extrabold">{creator.name}</p>
                <p className="text-xs text-muted">{creator.role}</p>
              </div>
            </li>
          ))}
        </ul>
      }
    >
      <p className="text-lg text-muted">
        The Lads are inside the server every day. Ask questions, get second opinions on squad dilemmas and learn first-hand
        what works at the top.
      </p>
      <ul className="flex flex-col gap-3">
        <li className="flex gap-3">
          <MessagesSquare aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <span className="font-bold">Regular Q&amp;A sessions.</span>{" "}
            <span className="text-muted">Drop clips or questions and get voice or text answers from the creators.</span>
          </span>
        </li>
        <li className="flex gap-3">
          <Wand2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <span className="font-bold">Custom slider help.</span>{" "}
            <span className="text-muted">Tune depth and build-up speed to suit the way you play.</span>
          </span>
        </li>
      </ul>
    </BenefitRow>
  );
}

export function TradingSection() {
  return (
    <BenefitRow
      id="trading"
      eyebrow="Economy // every Monday"
      title="Weekly trading brief"
      visual={
        <div className="glass flex flex-col gap-3 rounded-2xl p-5 shadow-rim">
          <p className="tabular flex items-center justify-between text-xs text-muted uppercase">
            <span className="text-mint">FC Lads market brief</span>
            <span>Monday release</span>
          </p>
          {[
            { name: "High-rated fodder (88+)", target: "Target buy: under 14,250", est: "Exit: before Thursday SBC" },
            { name: "Meta out-of-pack items", target: "Target buy: around 38,000", est: "Exit: Weekend League peak" },
          ].map((row) => (
            <div key={row.name} className="rounded-lg bg-[#090d14] p-3">
              <p className="font-bold">{row.name}</p>
              <p className="tabular mt-1 flex flex-wrap justify-between gap-2 text-xs text-muted">
                <span className="text-gold">{row.target}</span>
                <span>{row.est}</span>
              </p>
            </div>
          ))}
          <p className="tabular text-[11px] text-muted">Example layout. Live targets are in the members&apos; brief.</p>
        </div>
      }
    >
      <p className="text-lg text-muted">
        Every Monday, Wessam breaks down what&apos;s happening in the Ultimate Team market, so you can build a better
        squad without spending money on FC Points.
      </p>
      <Pills items={["What we're watching", "Potential opportunities", "Upcoming promos", "Market trends", "Players to monitor"]} />
      <p className="text-xs text-muted">
        Trading information is educational. Market conditions change quickly, and we focus on careful, low-risk methods.
      </p>
    </BenefitRow>
  );
}

export function ReviewSection() {
  const steps = [
    { icon: Upload, title: "Send us your gameplay", text: "Upload a match or share an unlisted YouTube link." },
    { icon: Video, title: "A coach breaks it down", text: "Your positioning, inputs, defensive line and spacing." },
    { icon: CheckCircle2, title: "You get a personal plan", text: "Tactic tweaks, habits to fix and what to practise next." },
  ];
  return (
    <BenefitRow
      id="review"
      eyebrow="1-on-1 // once a month"
      title="Monthly gameplay review"
      reverse
      visual={
        <div className="glass flex flex-col gap-4 rounded-2xl p-5 shadow-rim">
          <p className="tabular flex items-center justify-between text-xs text-muted uppercase">
            <span className="text-mint">Example review</span>
            <span>Full match analysed</span>
          </p>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0a1a14]">
            <svg aria-hidden viewBox="0 0 320 180" className="absolute inset-0 size-full opacity-30">
              <g fill="none" stroke="#8FF0C9">
                <rect x="10" y="10" width="300" height="160" />
                <line x1="160" y1="10" x2="160" y2="170" />
                <circle cx="160" cy="90" r="28" />
              </g>
            </svg>
            <span className="tabular absolute top-[38%] left-[42%] rounded bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
              OUT OF POSITION
            </span>
            <span className="tabular absolute bottom-3 left-3 rounded bg-canvas/80 px-2 py-1 text-xs">Coach timestamp 24:15</span>
          </div>
          <blockquote className="rounded-lg border-l-4 border-primary bg-[#090d14] p-3 text-sm">
            <p className="text-label text-mint">Coach&apos;s note</p>
            <p className="mt-1 text-on-surface/90">
              &ldquo;You pulled your CB out to press their CM, which opened the lane for their striker. Hold jockey with your
              CDM instead.&rdquo;
            </p>
          </blockquote>
        </div>
      }
    >
      <p className="text-lg text-muted">
        Once a month, send us a match. A coach breaks down your mistakes and helps you plan your next rank push.
      </p>
      <ol className="flex flex-col gap-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex gap-4 rounded-xl border border-white/8 bg-[#0f141b] p-4">
            <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-on-primary">
              {index + 1}
            </span>
            <span>
              <span className="flex items-center gap-2 font-bold">
                <Icon aria-hidden className="size-4 text-mint" />
                {title}
              </span>
              <span className="text-sm text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </BenefitRow>
  );
}
