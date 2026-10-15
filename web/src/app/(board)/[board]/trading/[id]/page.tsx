import type { Metadata } from "next";
import { BoardHeading } from "@/components/board/ItemList";
import { TradingEditor } from "@/components/board/TradingEditor";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, getTradingPost } from "@/lib/board/data";

export const metadata: Metadata = { title: "Trading post" };

export default async function BoardTradingPostPage({ params }: PageProps<"/[board]/trading/[id]">) {
  const { board, id } = await params;
  const { staff, base } = await requireBoardPage(board);
  const [row, creators] = await Promise.all([id === "new" ? undefined : getTradingPost(id), creatorChoices()]);

  return (
    <>
      <BoardHeading title={row ? "Edit trading post" : "New trading post"} />
      <TradingEditor key={row?.id ?? "new"} base={base} row={row} person={staff} creators={creators} now={boardNow()} />
    </>
  );
}
