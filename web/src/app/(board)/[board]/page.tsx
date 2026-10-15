import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, LineChart, MessageSquare, Plus } from "lucide-react";
import { ItemList, stateOf, type ListItem } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { listFeedPosts, listGuides, listTradingPosts } from "@/lib/board/data";

export const metadata: Metadata = { title: "Home" };

const newCards = [
  { href: "/trading/new", title: "Trading post", text: "Heading, text and a screenshot for /trading.", icon: LineChart },
  { href: "/feed/new", title: "Feed post", text: "A tip, update, clip, trading targets or a poll.", icon: MessageSquare },
  { href: "/guides/new", title: "Guide", text: "A full article or video guide for Learn.", icon: BookOpen },
];

const howTo = [
  "Pick what you want to post below, fill it in, then press Publish.",
  "Save draft keeps it private. Only you and the admins can see drafts.",
  "To schedule, set the date and time in the future and press Schedule.",
  "FC Lads+ posts are only shown to members; everyone else sees a lock.",
];

export default async function BoardHomePage({ params }: PageProps<"/[board]">) {
  const { staff, base } = await requireBoardPage((await params).board);
  const [trading, feed, guides] = await Promise.all([listTradingPosts(), listFeedPosts(), listGuides()]);
  const now = boardNow();

  // Creators see only their own posts here (row-level security); admins see everyone's.
  const recent: (ListItem & { updated: string })[] = [
    ...trading.map((post) => ({
      id: `t-${post.id}`,
      href: `${base}/trading/${post.id}`,
      title: post.title,
      detail: "Trading post",
      state: stateOf(post.status, post.posted_at, now),
      date: post.posted_at,
      updated: post.updated_at,
    })),
    ...feed.map((post) => ({
      id: `f-${post.id}`,
      href: `${base}/feed/${post.id}`,
      title: String(post.fields.title ?? post.fields.question ?? post.fields.text ?? "Untitled post"),
      detail: "Feed post",
      state: stateOf(post.status, post.posted_at, now),
      date: post.posted_at,
      updated: post.updated_at,
    })),
    ...guides.map((guide) => ({
      id: `g-${guide.id}`,
      href: `${base}/guides/${guide.id}`,
      title: guide.title,
      detail: "Guide",
      state: stateOf(guide.status, guide.published_at, now),
      date: guide.published_at,
      updated: guide.updated_at,
    })),
  ]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 8);
  const waiting = recent.filter((item) => item.state !== "Live").length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="tabular flex items-center gap-2 text-[11px] font-bold tracking-widest text-mint uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" />
          Posting board
        </p>
        <h1 className="font-display text-3xl leading-none font-extrabold uppercase md:text-5xl">
          Hi {staff.name.split(" ")[0]}. What are we posting?
        </h1>
      </div>

      <section aria-labelledby="new-heading" className="flex flex-col gap-4">
        <h2 id="new-heading" className="sr-only">
          Make something new
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {newCards.map((card) => (
            <Link
              key={card.href}
              href={base + card.href}
              className="group flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5 transition-colors hover:border-primary/50"
            >
              <span className="flex items-center justify-between">
                <card.icon aria-hidden className="size-6 text-primary" />
                <Plus aria-hidden className="size-5 text-muted group-hover:text-mint" />
              </span>
              <span className="font-display text-lg font-extrabold uppercase">New {card.title.toLowerCase()}</span>
              <span className="text-sm text-muted">{card.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_22rem]">
        <section aria-labelledby="recent-heading" className="flex flex-col gap-4">
          <h2 id="recent-heading" className="font-display text-lg font-extrabold uppercase">
            {staff.isAdmin ? "Recently edited" : "Your recent posts"}
            {waiting > 0 && <span className="tabular ml-2 text-xs text-gold">{waiting} not live yet</span>}
          </h2>
          <ItemList items={recent} empty="Nothing yet. Start with one of the cards above." />
        </section>
        <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5 text-sm">
          <h2 className="font-display font-extrabold uppercase">How it works</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-muted">
            {howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="text-muted">
            Gameplay reviews are in the{" "}
            <Link href="/creator" className="font-semibold text-primary hover:text-white">
              Creator hub
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
