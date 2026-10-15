import type { Metadata } from "next";
import { BoardHeading, ItemList } from "@/components/board/ItemList";
import { requireBoardPage } from "@/lib/board/access";
import { listCollections } from "@/lib/board/data";

export const metadata: Metadata = { title: "Video collections" };

export default async function BoardCollectionsPage() {
  const { base } = await requireBoardPage({ adminOnly: true });
  const collections = await listCollections();

  return (
    <>
      <BoardHeading
        title="Video collections"
        description="Members-only video series in Learn, in the order they show on the site."
        newHref={`${base}/collections/new`}
        newLabel="New collection"
      />
      <ItemList
        empty="No collections yet."
        items={collections.map((collection) => ({
          id: collection.id,
          href: `${base}/collections/${collection.id}`,
          title: collection.title,
          detail: [
            collection.path_step ? `Start here: step ${collection.path_step}` : undefined,
            `${collection.episodes.length} videos listed`,
          ]
            .filter(Boolean)
            .join(" · "),
          state: collection.status === "draft" ? "Draft" : "Live",
        }))}
      />
    </>
  );
}
