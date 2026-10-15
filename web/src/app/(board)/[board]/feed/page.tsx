import type { Metadata } from "next";
import { BoardHeading, ItemList, stateOf } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, listFeedPosts, nameLookup } from "@/lib/board/data";
import { feedPostTypes } from "@/lib/board/options";

export const metadata: Metadata = { title: "Feed posts" };

/** A feed post's main text, for the list. */
const headline = (fields: Record<string, unknown>) => String(fields.title ?? fields.question ?? fields.text ?? "Untitled post");

export default async function BoardFeedPage({ params }: PageProps<"/[board]/feed">) {
  const { staff, base } = await requireBoardPage((await params).board);
  const [posts, creators] = await Promise.all([listFeedPosts(), creatorChoices()]);
  const name = nameLookup(creators);
  const now = boardNow();

  return (
    <>
      <BoardHeading
        title="Feed posts"
        description={staff.isAdmin ? "Every creator's posts on /feed." : "Your posts on /feed."}
        newHref={`${base}/feed/new`}
        newLabel="New feed post"
      />
      <ItemList
        empty="No feed posts yet."
        items={posts.map((post) => ({
          id: post.id,
          href: `${base}/feed/${post.id}`,
          title: headline(post.fields),
          detail: `${name(post.author_slug)} · ${feedPostTypes.find((type) => type.value === post.post_type)?.label ?? post.post_type}`,
          state: stateOf(post.status, post.posted_at, now),
          date: post.posted_at,
          locked: post.post_type === "trading" && post.access === "plus",
        }))}
      />
    </>
  );
}
