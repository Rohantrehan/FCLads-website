import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { JOIN_HREF } from "@/components/plus/PlusHero";
import { TierBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/DataBits";
import { getCreator } from "@/data/creators";
import { cn } from "@/lib/cn";
import { shiftDate, type TradingItem } from "@/lib/tradingAccess";

const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const timeLabel = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

/** "Today · 09:30", "Yesterday · 18:15" or "9 Oct · 13:20". */
function postedLabel(iso: string, today: string) {
  const day = iso.slice(0, 10);
  const date = new Date(iso);
  const name = day === today ? "Today" : day === shiftDate(today, -1) ? "Yesterday" : dayLabel.format(date);
  return `${name} · ${timeLabel.format(date)}`;
}

/**
 * One creator post: author row, then heading + text on the left and the screenshot on the right
 * (on phones the screenshot comes first, like a social post). Locked FC Lads+ posts only show the title.
 */
export function TradingPostCard({ post, today }: { post: TradingItem; today: string }) {
  const author = getCreator(post.authorSlug);
  return (
    <article
      aria-labelledby={`${post.id}-title`}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-[#0f141b] p-5 transition-colors md:p-6",
        post.locked ? "border-gold/25" : "border-white/8 hover:border-white/15",
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {author && <Avatar initials={author.initials} tone="mint" />}
          <div className="min-w-0">
            <p className="truncate text-sm">
              {author ? (
                <Link href={`/creators/${author.slug}`} className="font-bold hover:text-mint">
                  {author.name}
                </Link>
              ) : (
                <span className="font-bold">FC Lads</span>
              )}
              {author && <span className="ml-1.5 text-xs text-muted">{author.role}</span>}
            </p>
            <p className="tabular text-[11px] text-muted">
              <time dateTime={post.postedAt}>{postedLabel(post.postedAt, today)}</time>
            </p>
          </div>
        </div>
        {post.access === "plus" && <TierBadge tier="plus" />}
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id={`${post.id}-title`} className="font-display text-xl leading-snug font-extrabold">
            {post.title}
          </h2>
          {post.locked ? (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm text-gold">
                <Lock aria-hidden className="size-4 shrink-0" />
                The full post and screenshot are for FC Lads+ members.
              </p>
              <Link href={JOIN_HREF} className="text-label flex items-center gap-1.5 text-gold hover:text-white">
                Unlock with FC Lads+
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          ) : (
            post.text && <p className="leading-relaxed text-muted">{post.text}</p>
          )}
        </div>

        {post.image && (
          <figure className="relative order-first aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-white/8 bg-surface md:order-none md:w-[42%]">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 768px) 40vw, 100vw"
              unoptimized={post.image.src.endsWith(".svg")}
              className="object-cover"
            />
          </figure>
        )}
      </div>
    </article>
  );
}
