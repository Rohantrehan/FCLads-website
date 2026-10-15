import type { Metadata } from "next";
import { BoardHeading, ItemList } from "@/components/board/ItemList";
import { requireBoardPage } from "@/lib/board/access";
import { listCreators } from "@/lib/board/data";

export const metadata: Metadata = { title: "Creators" };

export default async function BoardCreatorsPage() {
  const { base } = await requireBoardPage({ adminOnly: true });
  const creators = await listCreators();

  return (
    <>
      <BoardHeading
        title="Creators"
        description="Profiles on Meet the Lads. To let someone post, give their account the creator role in Team."
        newHref={`${base}/creators/new`}
        newLabel="New creator"
      />
      <ItemList
        empty="No creators yet."
        items={creators.map((creator) => ({
          id: creator.slug,
          href: `${base}/creators/${creator.slug}`,
          title: creator.name,
          detail: [creator.role, creator.review_specialty ? "Takes reviews" : undefined].filter(Boolean).join(" · "),
          state: creator.hidden ? "Hidden" : "Live",
        }))}
      />
    </>
  );
}
