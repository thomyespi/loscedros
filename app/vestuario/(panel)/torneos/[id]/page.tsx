import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentAdmin, type AdminTournamentData } from "@/components/admin/tournament-admin";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { buildTournamentView } from "@/lib/data/selectors";
import { formatRange } from "@/lib/dates";
import { tournamentReadiness } from "@/lib/domain/readiness";

export const metadata: Metadata = { title: "Torneo" };

export default async function AdminTournamentPage({ params }: PageProps<"/vestuario/torneos/[id]">) {
  const { id } = await params;
  const snap = await getAdminSnapshot();
  const tournament = snap.tournaments.find((t) => t.id === id);
  if (!tournament) notFound();
  const view = buildTournamentView(snap, tournament);

  const matchesPerTeam = new Map<string, number>();
  for (const r of view.rounds)
    for (const m of r.matches) for (const tid of [m.match.teamAId, m.match.teamBId]) matchesPerTeam.set(tid, (matchesPerTeam.get(tid) ?? 0) + 1);

  const readiness = tournamentReadiness({
    rounds: view.rounds.map((r) => r.round),
    matches: view.rounds.flatMap((r) => r.matches.map((m) => m.match)),
    results: view.rounds.flatMap((r) => r.matches.flatMap((m) => m.results)),
  });

  const enrolled = new Set(tournament.teamIds);
  const data: AdminTournamentData = {
    id: tournament.id,
    name: tournament.name,
    slug: tournament.slug,
    description: tournament.description,
    coverPath: tournament.coverPath,
    status: tournament.status,
    championName: view.champion?.name ?? null,
    startIssue: readiness.startIssue,
    finishIssue: readiness.finishIssue,
    totalMatches: view.rounds.reduce((n, r) => n + r.matches.length, 0),
    teams: view.teams.map((t) => ({ id: t.id, name: t.name, avatarPath: t.avatarPath, matches: matchesPerTeam.get(t.id) ?? 0 })),
    availableTeams: snap.teams.filter((t) => !t.archivedAt && !enrolled.has(t.id)).map(({ id, name, avatarPath }) => ({ id, name, avatarPath })),
    rounds: view.rounds.map((r) => ({
      id: r.round.id,
      number: r.round.number,
      playDate: r.round.playDate,
      matches: r.matches.length,
      pending: r.matches.filter((m) => !m.isComplete).length,
    })),
  };

  return (
    <AdminPage
      title={tournament.name}
      subtitle={`${formatRange(view.startDate, view.endDate) ?? ""} · ${view.teams.length} equipos`}
      back={{ href: `${ADMIN_BASE_PATH}/torneos`, label: "Torneos" }}
    >
      <TournamentAdmin key={`${tournament.id}-${tournament.status}-${view.rounds.length}`} t={data} />
    </AdminPage>
  );
}
