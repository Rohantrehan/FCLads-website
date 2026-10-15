import type { Metadata } from "next";
import { GuideEditor } from "@/components/board/GuideEditor";
import { BoardHeading } from "@/components/board/ItemList";
import { boardNow, requireBoardPage } from "@/lib/board/access";
import { creatorChoices, getGuide } from "@/lib/board/data";

export const metadata: Metadata = { title: "Guide" };

export default async function BoardGuidePage({ params }: PageProps<"/posting-board/guides/[id]">) {
  const { id } = await params;
  const { staff, base } = await requireBoardPage();
  const [row, creators] = await Promise.all([id === "new" ? undefined : getGuide(id), creatorChoices()]);

  return (
    <>
      <BoardHeading title={row ? "Edit guide" : "New guide"} />
      <GuideEditor key={row?.id ?? "new"} base={base} row={row} person={staff} creators={creators} now={boardNow()} />
    </>
  );
}
