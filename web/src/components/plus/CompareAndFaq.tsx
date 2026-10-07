import { Check, ChevronDown, Minus } from "lucide-react";
import { ladsPlus } from "@/data/ladsPlus";

type Cell = boolean | string;

const rows: { feature: string; free: Cell; plus: Cell }[] = [
  { feature: "Free guides & basics", free: true, plus: true },
  { feature: "Video collections & YouTube breakdowns", free: true, plus: true },
  { feature: "Premium guides & slider codes", free: false, plus: "Full access" },
  { feature: "Private Discord strategy rooms", free: false, plus: "Always open" },
  { feature: "Q&A with the creators", free: false, plus: "Regular sessions" },
  { feature: "Weekly trading brief", free: false, plus: "Every Monday" },
  { feature: "1-on-1 gameplay review", free: false, plus: "1 per month" },
];

function CellValue({ value, plus }: { value: Cell; plus?: boolean }) {
  if (value === false) {
    return (
      <>
        <Minus aria-hidden className="mx-auto size-4 text-white/25" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return (
    <span className={`tabular inline-flex flex-col items-center gap-1 text-[11px] font-bold sm:flex-row sm:gap-1.5 sm:text-xs ${plus ? "text-mint" : "text-primary"}`}>
      <Check aria-hidden className="size-4" />
      {value === true ? <span className="sr-only">Included</span> : value}
    </span>
  );
}

export function CompareTable() {
  return (
    <section aria-labelledby="compare-heading" className="page-container py-16 lg:py-20">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-label text-mint">Free vs FC Lads+</p>
        <h2 id="compare-heading" className="text-headline mt-2">
          Compare what you get
        </h2>
        <p className="mt-2 text-muted">Everything free stays free. FC Lads+ adds the parts that need the Lads&apos; time.</p>
      </div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Free tier compared with FC Lads+</caption>
          <thead className="bg-surface-high/60">
            <tr>
              <th scope="col" className="text-label px-3 py-4 text-muted sm:px-5">
                Feature
              </th>
              <th scope="col" className="text-label w-16 px-2 py-4 text-center text-muted sm:w-32 sm:px-5">
                Free
              </th>
              <th scope="col" className="text-label w-28 px-2 py-4 text-center text-mint sm:w-44 sm:px-5">
                FC Lads+<span className="hidden sm:inline"> ({ladsPlus.priceLabel}/mo)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-t border-white/5 odd:bg-white/[0.02]">
                <th scope="row" className="px-3 py-4 font-medium break-words sm:px-5">
                  {row.feature}
                </th>
                <td className="px-2 py-4 text-center sm:px-5">
                  <CellValue value={row.free} />
                </td>
                <td className="bg-primary/[0.04] px-2 py-4 text-center sm:px-5">
                  <CellValue value={row.plus} plus />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Answers that depend on open client decisions (refunds, payment methods, review turnaround)
// are kept general until confirmed — see PROGRESS.md open questions.
const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. There's no contract. Cancel from your account settings whenever you like and you keep full access until the end of the month you've paid for.",
  },
  {
    q: "How do I join the Discord server?",
    a: "After you join, you connect your Discord account and the FC Lads+ member role is added automatically, which unlocks all the private channels.",
  },
  {
    q: "How does the monthly gameplay review work?",
    a: "Once a month you send us a match, as a file upload or an unlisted YouTube link. A coach goes through it and sends back timestamped notes and a personal plan of what to fix and practise.",
  },
  {
    q: "Is the free content going away?",
    a: "No. Free guides, video collections and the public feed stay free. FC Lads+ adds premium guides, the private Discord, creator access, the trading brief and your monthly review.",
  },
  {
    q: "How do I pay?",
    a: "By card, through a secure payment provider. We never see or store your full card details.",
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="page-container py-16 lg:py-20">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-label text-mint">Got questions?</p>
        <h2 id="faq-heading" className="text-headline mt-2">
          Frequently asked questions
        </h2>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {faqs.map((faq, index) => (
          <details
            key={faq.q}
            open={index === 0}
            className="group rounded-xl border border-white/8 bg-[#0f141b] open:border-primary/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display font-extrabold [&::-webkit-details-marker]:hidden">
              {faq.q}
              <ChevronDown aria-hidden className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
