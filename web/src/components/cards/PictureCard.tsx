import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CardPicture } from "@/types";

/** A card designed as one picture and uploaded on the posting board (Cards), e.g. a FUT-style player card. */
export function PictureCard({ picture, featured, className }: { picture: CardPicture; featured?: boolean; className?: string }) {
  if (!picture.image) return null;
  const label = picture.name || "FC Lads card";
  return (
    <article className={cn("group relative transition-transform duration-300", picture.href && "hover:-translate-y-2", className)}>
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={picture.image}
          alt={picture.href ? "" : label}
          fill
          sizes="256px"
          priority={featured}
          className="object-contain drop-shadow-[0_12px_24px_rgb(0_0_0/0.45)]"
        />
      </div>
      {picture.href && (
        <Link href={picture.href} className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-mint/60">
          <span className="sr-only">{label}</span>
        </Link>
      )}
    </article>
  );
}
