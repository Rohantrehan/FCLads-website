import type { Metadata } from "next";
import { CheckCircle2, Zap } from "lucide-react";
import { CompareTable, Faq, faqs } from "@/components/plus/CompareAndFaq";
import { PerkShowcase } from "@/components/plus/PerkShowcase";
import { JOIN_HREF, PlusHero } from "@/components/plus/PlusHero";
import { CreatorAccessSection, DiscordSection, ReviewSection, TradingSection } from "@/components/plus/PlusSections";
import { Button } from "@/components/ui/Button";
import { getContent, getPlus } from "@/lib/content";
import { absoluteUrl, breadcrumbs, jsonLd, organization, pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const plus = await getPlus();
  const season = (await getContent()).settings.currentSeason;
  return pageMeta({
    title: `FC Lads+ membership: ${season} coaching, guides & private Discord`,
    description: `Every ${season} guide and video series, the private FC Lads Discord, creator access, members-only trading posts and a monthly gameplay review. ${plus.priceLabel} a month after a ${plus.trialDays}-day free trial, cancel anytime.`,
    path: "/lads-plus",
  });
}

const outcomes = [
  "Learn the game.",
  "Understand the meta.",
  "Follow the market.",
  "Talk to experienced players.",
  "Get your gameplay analysed.",
  "Improve every month.",
];

export default async function LadsPlusPage() {
  const plus = await getPlus();
  const structuredData = jsonLd(
    {
      "@type": "Product",
      name: "FC Lads+ membership",
      description: "Monthly EA SPORTS FC Ultimate Team membership: every guide and video series, private Discord, creator access, members-only trading posts and a monthly gameplay review.",
      brand: organization,
      image: absoluteUrl("/opengraph-image"),
      offers: {
        "@type": "Offer",
        url: absoluteUrl("/lads-plus"),
        price: plus.price,
        priceCurrency: plus.currency,
        availability: "https://schema.org/InStock",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plus.price,
          priceCurrency: plus.currency,
          billingDuration: 1,
          billingIncrement: 1,
          unitCode: "MON",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs(plus).map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
    },
    breadcrumbs([["Home", "/"], ["FC Lads+", "/lads-plus"]]),
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredData} />
      <PlusHero />

      <section aria-labelledby="includes-heading" className="border-t border-white/6 bg-surface py-16 lg:py-20">
        <div className="page-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-label text-mint">What you get</p>
            <h2 id="includes-heading" className="text-headline mt-2">
              Your membership includes
            </h2>
            <p className="mt-2 text-muted">Everything you need to compete at the top level in Ultimate Team.</p>
          </div>
          <PerkShowcase season={(await getContent()).settings.currentSeason} perks={plus.perks} />
        </div>
      </section>

      <DiscordSection />
      <div className="border-t border-white/6 bg-surface">
        <CreatorAccessSection creators={(await getContent()).creators} />
      </div>
      <TradingSection />
      <div className="border-t border-white/6 bg-surface">
        <ReviewSection />
      </div>

      <section aria-labelledby="summary-heading" className="page-container py-16">
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-pitch-green via-[color-mix(in_oklab,var(--color-pitch-green)_75%,#000)] to-canvas p-6 md:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-label text-mint">All-in-one</p>
            <h2 id="summary-heading" className="text-headline mt-2">
              One membership. Everything FC.
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-center gap-3 font-semibold">
                  <CheckCircle2 aria-hidden className="size-5 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-rim lg:col-span-5">
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold">{plus.priceLabel}</span>
              <span className="text-muted">/ month</span>
            </p>
            <p className="text-sm text-muted">
              {plus.trialDays}-day free trial, then billed monthly · Cancel anytime
            </p>
            <Button href={JOIN_HREF} size="lg" className="w-full">
              Start {plus.trialDays}-day free trial
              <Zap aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-white/6 bg-surface">
        <CompareTable />
      </div>
      <Faq />
    </>
  );
}
