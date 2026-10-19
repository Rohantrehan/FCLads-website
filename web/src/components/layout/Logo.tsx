import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

// The FC Lads logo ("Neon Crest"): the crowned FC shield and the "FC LADS" wordmark, cut out of the
// square logo with a see-through background (public/logo-crest.png, public/logo-wordmark.png).

/** The crowned FC shield on its own. Sized by `className`; the picture keeps its shape inside. */
export function ShieldMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-crest.png"
      alt=""
      aria-hidden
      width={217}
      height={256}
      className={cn("size-9 object-contain", className)}
    />
  );
}

/** Shield + "FC LADS" wordmark, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="FC Lads home" className={cn("flex items-center gap-2.5", className)}>
      <ShieldMark className="size-10" />
      <Image src="/logo-wordmark.png" alt="" aria-hidden width={635} height={96} priority className="h-5 w-auto" />
    </Link>
  );
}
