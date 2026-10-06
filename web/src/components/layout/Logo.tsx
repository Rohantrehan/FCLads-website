import Link from "next/link";
import { cn } from "@/lib/cn";

/** FC Lads shield mark (from all_pages_design/fc_lads_shield_logo). Inline so gradients render without a request. */
export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("size-9", className)}>
      <defs>
        <linearGradient id="fcl-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2BD98B" />
          <stop offset="50%" stopColor="#0E2A22" />
          <stop offset="100%" stopColor="#07090D" />
        </linearGradient>
        <linearGradient id="fcl-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8FF0C9" />
          <stop offset="100%" stopColor="#1E8BFF" />
        </linearGradient>
      </defs>
      <path
        d="M50 8 L85 22 L85 58 C85 76 50 94 50 94 C50 94 15 76 15 58 L15 22 Z"
        fill="url(#fcl-shield)"
        stroke="url(#fcl-glow)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 16 L77 27 L77 56 C77 69 50 84 50 84 C50 84 23 69 23 56 L23 27 Z"
        fill="#0B1220"
        opacity="0.6"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="60"
        fontFamily="var(--font-unbounded), Impact, sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="1"
      >
        FCL
      </text>
      <polygon points="50,68 54,73 46,73" fill="#8FF0C9" />
    </svg>
  );
}

/** Shield + "FC LADS" wordmark, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="FC Lads home" className={cn("flex items-center gap-2.5", className)}>
      <ShieldMark />
      <span className="font-logo text-lg font-black uppercase tracking-wider text-white">FC Lads</span>
    </Link>
  );
}
