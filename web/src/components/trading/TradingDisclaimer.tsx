import Link from "next/link";
import { Info } from "lucide-react";

export function TradingDisclaimer() {
  return (
    <p className="flex items-start gap-2 text-xs text-muted">
      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Trading information is for education only. The market can change quickly, and past results don&apos;t guarantee
        future ones.{" "}
        <Link href="/legal/trading-disclaimer" className="underline hover:text-white">
          Read the trading disclaimer
        </Link>
      </span>
    </p>
  );
}
