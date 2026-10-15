import type { Metadata } from "next";
import { CreatorEditor } from "@/components/board/CreatorEditor";
import { BoardHeading } from "@/components/board/ItemList";
import { requireBoardPage } from "@/lib/board/access";
import { getCreatorRow } from "@/lib/board/data";

export const metadata: Metadata = { title: "Creator" };

export default async function BoardCreatorPage({ params }: PageProps<"/posting-board/creators/[slug]">) {
  const { slug } = await params;
  const { base } = await requireBoardPage({ adminOnly: true });
  const row = slug === "new" ? undefined : await getCreatorRow(slug);

  return (
    <>
      <BoardHeading title={row ? `Edit ${row.name}` : "New creator"} />
      <CreatorEditor key={row?.slug ?? "new"} base={base} row={row} />
    </>
  );
}
