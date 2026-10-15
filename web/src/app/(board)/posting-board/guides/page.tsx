import type { Metadata } from "next";
import { BoardHeading, ItemList, stateOf } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, listGuides, nameLookup } from "@/lib/board/data";
import { categoryLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Guides" };

export default async function BoardGuidesPage() {
  const { staff, base } = await requireBoardPage();
  const [guides, creators] = await Promise.all([listGuides(), creatorChoices()]);
  const name = nameLookup(creators);
  const now = boardNow();

  return (
    <>
      <BoardHeading
        title="Guides"
        description={staff.isAdmin ? "Every guide in Learn." : "Your guides in Learn."}
        newHref={`${base}/guides/new`}
        newLabel="New guide"
      />
      <ItemList
        empty="No guides yet."
        items={guides.map((guide) => ({
          id: guide.id,
          href: `${base}/guides/${guide.id}`,
          title: guide.title,
          detail: `${name(guide.author_slug)} · ${categoryLabels[guide.category] ?? guide.category}${guide.is_featured ? " · Featured" : ""}`,
          state: stateOf(guide.status, guide.published_at, now),
          date: guide.published_at,
          locked: guide.access === "plus",
        }))}
      />
    </>
  );
}
