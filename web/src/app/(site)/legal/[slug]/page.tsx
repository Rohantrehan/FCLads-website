import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Gavel, Info, LifeBuoy, ShieldCheck, TrendingUp } from "lucide-react";
import { CopyEmail, PrintButton } from "@/components/legal/LegalActions";
import { LegalToc } from "@/components/legal/LegalToc";
import { cn } from "@/lib/cn";
import { LEGAL_EMAIL, LEGAL_UPDATED, getLegalDoc, legalDocs, type LegalBlock, type LegalSlug } from "@/data/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
  };
}

const tabIcons: Record<LegalSlug, typeof Gavel> = {
  terms: Gavel,
  privacy: ShieldCheck,
  "trading-disclaimer": TrendingUp,
};

const updated = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${LEGAL_UPDATED}T00:00:00Z`));

function Lead({ children }: { children?: string }) {
  return children ? <strong className="font-semibold text-white">{children} </strong> : null;
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "p") {
    return (
      <p>
        <Lead>{block.lead}</Lead>
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="flex flex-col gap-3">
        {block.items.map((item) => (
          <li key={item.text} className="flex gap-3">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <Lead>{item.lead}</Lead>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  const warning = block.tone === "warning";
  const Icon = warning ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        warning ? "border-gold/30 bg-gold/5" : "border-primary/25 bg-primary/5",
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", warning ? "text-gold" : "text-primary")} />
      <div>
        <p className={cn("font-display text-sm font-extrabold uppercase", warning ? "text-gold" : "text-mint")}>
          {block.title}
        </p>
        <p className="mt-1 text-sm">{block.text}</p>
      </div>
    </div>
  );
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgb(14_42_34/0.7),transparent)] print:hidden"
      />

      <header className="page-container relative flex flex-col gap-6 pt-12 pb-10 lg:pt-16">
        <div className="flex flex-col gap-3">
          <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" />
            Legal
          </p>
          <h1 className="text-hero">{doc.title}</h1>
          <p className="tabular text-xs text-muted">Last updated {updated}</p>
        </div>

        <nav aria-label="Legal pages" className="scrollbar-none -mx-4 overflow-x-auto px-4 print:hidden">
          <ul className="flex w-max gap-2">
            {legalDocs.map((item) => {
              const Icon = tabIcons[item.slug];
              const current = item.slug === doc.slug;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/legal/${item.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      current
                        ? "border-primary bg-primary text-on-primary"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-white",
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="page-container relative grid grid-cols-1 gap-8 pb-20 lg:grid-cols-12 lg:gap-12">
        <aside className="lg:col-span-4 xl:col-span-3 print:hidden">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28">
            <LegalToc
              items={doc.sections.map((section) => ({ id: section.id, title: section.short ?? section.title }))}
            />
            <div className="hidden lg:block">
              <PrintButton />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8 xl:col-span-9 xl:max-w-3xl">
          <p className="rounded-2xl border border-white/8 bg-[#0f141b] p-5 text-lg leading-relaxed text-on-surface md:p-6">
            {doc.intro}
          </p>

          {doc.sections.map((section, index) => (
            <article
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-28 rounded-2xl border border-white/8 bg-[#0f141b] p-5 md:p-6"
            >
              <h2
                id={`${section.id}-heading`}
                className="flex items-baseline gap-3 font-display text-lg font-extrabold uppercase md:text-xl"
              >
                <span className="tabular text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4 leading-relaxed text-muted">
                {section.blocks.map((block, blockIndex) => (
                  <Block key={blockIndex} block={block} />
                ))}
              </div>
            </article>
          ))}

          <section
            aria-labelledby="legal-contact-heading"
            className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-pitch-green/60 to-[#0f141b] p-5 md:flex-row md:items-center md:justify-between md:p-6"
          >
            <div className="flex gap-3">
              <LifeBuoy aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h2 id="legal-contact-heading" className="font-display text-lg font-extrabold uppercase">
                  Questions about this page?
                </h2>
                <p className="mt-1 text-sm text-muted">Email us and we&apos;ll usually reply within a day.</p>
              </div>
            </div>
            <CopyEmail email={LEGAL_EMAIL} />
          </section>
        </div>
      </div>
    </div>
  );
}
