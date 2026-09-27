import type { Metadata } from "next";
import { TournamentWizard } from "@/components/admin/tournament-wizard";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "Nuevo torneo" };

export default async function NewTournamentPage() {
  const snap = await getAdminSnapshot();
  const teams = snap.teams.filter((t) => !t.archivedAt).map(({ id, name, avatarPath }) => ({ id, name, avatarPath }));
  return (
    <AdminPage title="Nuevo torneo" subtitle="Se crea como borrador: nadie lo ve hasta que lo publiques." back={{ href: `${ADMIN_BASE_PATH}/torneos`, label: "Torneos" }}>
      <TournamentWizard teams={teams} today={todayISO()} />
    </AdminPage>
  );
}
