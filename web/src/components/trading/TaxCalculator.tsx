"use client";

import { useId, useState } from "react";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

/** EA keeps 5% of every transfer market sale. */
const TAX = 0.05;

const toNumber = (value: string) => {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Free tool: profit after the 5% EA tax, and the price you need to sell at to break even. */
export function TaxCalculator() {
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");
  const id = useId();
  const buyN = toNumber(buy);
  const sellN = toNumber(sell);
  const tax = Math.floor(sellN * TAX);
  const profit = sellN - tax - buyN;
  const breakEven = buyN ? Math.ceil(buyN / (1 - TAX)) : 0;
  const ready = buyN > 0 && sellN > 0;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0f141b] p-5"
    >
      <div>
        <h2 id={`${id}-title`} className="flex items-center gap-2 font-display font-extrabold uppercase">
          <Calculator aria-hidden className="size-5 text-primary" />
          Tax calculator
        </h2>
        <p className="mt-1 text-sm text-muted">EA takes 5% of every sale. See your real profit before you list.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "buy", label: "Bought for", value: buy, set: setBuy },
          { key: "sell", label: "Selling for", value: sell, set: setSell },
        ].map((field) => (
          <label key={field.key} className="flex flex-col gap-1.5">
            <span className="text-label text-muted">{field.label}</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={field.value}
              onChange={(event) => {
                const n = toNumber(event.target.value);
                field.set(n ? formatNumber(n) : "");
              }}
              className="tabular h-11 w-full rounded-lg border border-white/10 bg-[#090d14] px-3 text-sm text-on-surface placeholder:text-muted/60 focus:border-mint focus:outline-none"
            />
          </label>
        ))}
      </div>
      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container p-3 text-center" aria-live="polite">
        <div>
          <dt className="text-label text-muted">EA tax</dt>
          <dd className="tabular mt-1 text-sm font-bold">{sellN ? formatNumber(tax) : "—"}</dd>
        </div>
        <div>
          <dt className="text-label text-muted">Profit</dt>
          <dd className={cn("tabular mt-1 text-sm font-bold", ready && (profit >= 0 ? "text-primary" : "text-danger"))}>
            {ready ? `${profit > 0 ? "+" : ""}${formatNumber(profit)}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-label text-muted">Break even</dt>
          <dd className="tabular mt-1 text-sm font-bold text-gold">{breakEven ? formatNumber(breakEven) : "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
