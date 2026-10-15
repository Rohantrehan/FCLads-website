import type { Metadata } from "next";
import { FeedEditor } from "@/components/board/FeedEditor";
import { BoardHeading } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, getFeedPost } from "@/lib/board/data";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Feed post" };

export default async function BoardFeedPostPage({ params }: PageProps<"/posting-board/feed/[id]">) {
  const { id } = await params;
  const { staff, base } = await requireBoardPage();
  const [row, creators, content] = await Promise.all([
    id === "new" ? undefined : getFeedPost(id),
    creatorChoices(),
    getContent(),
  ]);

  return (
    <>
      <BoardHeading title={row ? "Edit feed post" : "New feed post"} />
      <FeedEditor
        key={row?.id ?? "new"}
        base={base}
        row={row}
        person={staff}
        creators={creators}
        guides={content.guides.map((guide) => ({ slug: guide.slug, title: guide.title }))}
        now={boardNow()}
      />
    </>
  );
}
