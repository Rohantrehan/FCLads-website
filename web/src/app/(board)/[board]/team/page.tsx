import type { Metadata } from "next";
import { BoardHeading } from "@/components/board/ItemList";
import { TeamForm } from "@/components/board/TeamForm";
import { DashPanel } from "@/components/dashboard/DashboardBits";
import { requireBoardPage } from "@/lib/board/access";
import { creatorChoices, listTeam, nameLookup } from "@/lib/board/data";

export const metadata: Metadata = { title: "Team" };

export default async function BoardTeamPage({ params }: PageProps<"/[board]/team">) {
  const { staff } = await requireBoardPage((await params).board, { adminOnly: true });
  const [team, creators] = await Promise.all([listTeam(), creatorChoices()]);
  const name = nameLookup(creators);

  return (
    <>
      <BoardHeading
        title="Team"
        description="Who can use this board. Creators post as their profile and run gameplay reviews; admins can do everything."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashPanel id="team-list" title="Creators and admins">
          <ul className="flex flex-col divide-y divide-white/6">
            {team.map((person) => (
              <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{person.display_name ?? person.email}</span>
                  <span className="block truncate text-xs text-muted">{person.email}</span>
                </span>
                <span className="text-xs">
                  <span className={person.role === "admin" ? "font-bold text-gold" : "font-bold text-mint"}>
                    {person.role === "admin" ? "Admin" : "Creator"}
                  </span>
                  {person.creator_slug && <span className="text-muted"> · posts as {name(person.creator_slug)}</span>}
                  {person.id === staff.id && <span className="text-muted"> · you</span>}
                </span>
              </li>
            ))}
          </ul>
        </DashPanel>
        <DashPanel id="team-change" title="Add someone or change a role">
          <TeamForm creators={creators} />
        </DashPanel>
      </div>
    </>
  );
}
