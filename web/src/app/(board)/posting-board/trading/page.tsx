import type { Metadata } from "next";
import { BoardHeading, ItemList, stateOf } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, listTradingPosts, nameLookup } from "@/lib/board/data";

export const metadata: Metadata = { title: "Trading posts" };

export default async function BoardTradingPage() {
  const { staff, base } = await requireBoardPage();
  const [posts, creators] = await Promise.all([listTradingPosts(), creatorChoices()]);
  const name = nameLookup(creators);
  const now = boardNow();

  return (
    <>
      <BoardHeading
        title="Trading posts"
        description={staff.isAdmin ? "Every creator's posts on /trading." : "Your posts on /trading."}
        newHref={`${base}/trading/new`}
        newLabel="New trading post"
      />
      <ItemList
        empty="No trading posts yet."
        items={posts.map((post) => ({
          id: post.id,
          href: `${base}/trading/${post.id}`,
          title: post.title,
          detail: name(post.author_slug),
          state: stateOf(post.status, post.posted_at, now),
          date: post.posted_at,
          locked: post.access === "plus",
        }))}
      />
    </>
  );
}
