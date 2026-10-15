import type { Metadata } from "next";
import { BoardHeading } from "@/components/board/ItemList";
import { SettingsEditor } from "@/components/board/SettingsEditor";
import { requireBoardPage } from "@/lib/board/access";
import { creatorChoices, getSettings } from "@/lib/board/data";

export const metadata: Metadata = { title: "Site settings" };

export default async function BoardSettingsPage() {
  await requireBoardPage({ adminOnly: true });
  const [row, creators] = await Promise.all([getSettings(), creatorChoices()]);

  return (
    <>
      <BoardHeading title="Site settings" description="Values used across the whole site." />
      <SettingsEditor row={row} creators={creators} />
    </>
  );
}
