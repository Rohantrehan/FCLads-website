import type { Metadata } from "next";
import { CardsEditor } from "@/components/board/CardsEditor";
import { BoardHeading } from "@/components/board/ItemList";
import { requireBoardPage } from "@/lib/board/access";
import { getSettings, listCreators } from "@/lib/board/data";

export const metadata: Metadata = { title: "Cards" };

export default async function BoardCardsPage() {
  await requireBoardPage({ adminOnly: true });
  const [row, creators] = await Promise.all([getSettings(), listCreators()]);

  return (
    <>
      <BoardHeading title="Cards" description="Card pictures on the Home page and the FC Lads+ page. Press Save to put them live." />
      <CardsEditor cards={row?.cards ?? null} creatorNames={creators.slice(0, 3).map((creator) => creator.name)} />
    </>
  );
}
