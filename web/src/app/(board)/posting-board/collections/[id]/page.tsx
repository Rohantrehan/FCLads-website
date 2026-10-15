import type { Metadata } from "next";
import { CollectionEditor } from "@/components/board/CollectionEditor";
import { BoardHeading } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { getCollection, listGuides } from "@/lib/board/data";

export const metadata: Metadata = { title: "Video collection" };

export default async function BoardCollectionPage({ params }: PageProps<"/posting-board/collections/[id]">) {
  const { id } = await params;
  const { base } = await requireBoardPage({ adminOnly: true });
  const [row, guides] = await Promise.all([id === "new" ? undefined : getCollection(id), listGuides()]);

  return (
    <>
      <BoardHeading title={row ? "Edit collection" : "New collection"} />
      <CollectionEditor
        key={row?.id ?? "new"}
        base={base}
        row={row}
        guides={guides.map((guide) => ({ slug: guide.slug, title: guide.title }))}
        now={boardNow()}
      />
    </>
  );
}
