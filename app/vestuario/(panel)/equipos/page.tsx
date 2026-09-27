import type { Metadata } from "next";
import { TeamsManager, type AdminTeam } from "@/components/admin/teams-manager";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Equipos" };

export default async function AdminTeamsPage({ searchParams }: PageProps<"/vestuario/equipos">) {
  const sp = await searchParams;
  const snap = await getAdminSnapshot();
  const teams: AdminTeam[] = snap.teams.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    avatarPath: t.avatarPath,
    archivedAt: t.archivedAt,
    tournaments: snap.tournaments.filter((x) => x.teamIds.includes(t.id)).length,
  }));

  return (
    <AdminPage title="Equipos" subtitle={`${teams.filter((t) => !t.archivedAt).length} activos`}>
      <TeamsManager teams={teams} openNew={sp.nuevo === "1"} />
    </AdminPage>
  );
}
