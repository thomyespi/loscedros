import { CalendarDays, ChevronRight, ClipboardList, Plus, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { AdminPage, Card, EmptyState, btn } from "@/components/admin/ui";
import { StatusBadge } from "@/components/tournament/status-badge";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { buildTournamentView } from "@/lib/data/selectors";
import { formatLong, relativeDay } from "@/lib/dates";

export default async function DashboardPage() {
  const snap = await getAdminSnapshot();
  const active = snap.tournaments
    .filter((t) => t.status === "en_curso" || t.status === "proximo")
    .map((t) => buildTournamentView(snap, t))
    .sort((a, b) => (a.tournament.status === "en_curso" ? -1 : 1) - (b.tournament.status === "en_curso" ? -1 : 1));

  const pending = snap.tournaments
    .filter((t) => t.status !== "finalizado")
    .flatMap((t) => {
      const v = buildTournamentView(snap, t);
      return v.rounds.flatMap((r) =>
        r.matches.filter((m) => !m.isComplete && r.isPast).map((m) => ({ t, r, m })),
      );
    });

  const activeTeams = snap.teams.filter((t) => !t.archivedAt).length;
  const drafts = snap.tournaments.filter((t) => t.status === "borrador").length;

  return (
    <AdminPage title="¡Hola!" subtitle="¿Qué hacemos hoy?">
      {active.length === 0 ? (
        <EmptyState icon={<Trophy className="size-8 text-grass" />} title="No hay torneos en juego ni próximos">
          <Link href={`${ADMIN_BASE_PATH}/torneos/nuevo`} className={btn.primary}>
            <Plus className="size-5" /> Crear torneo
          </Link>
        </EmptyState>
      ) : (
        active.map((v) => {
          const target = v.nextRound ?? v.rounds.at(-1);
          return (
            <Card key={v.tournament.id} className="border-grass/25 bg-gradient-to-br from-pitch-2 to-pitch">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <StatusBadge status={v.tournament.status} />
                  <h2 className="font-display mt-2 truncate text-3xl text-chalk">{v.tournament.name}</h2>
                  {target && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-mist">
                      <CalendarDays className="size-4 text-grass" />
                      Fecha {target.round.number} · <span className="capitalize">{formatLong(target.round.playDate)}</span>
                      {relativeDay(target.round.playDate) && <span className="font-semibold text-grass">{relativeDay(target.round.playDate)}</span>}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {target && (
                  <Link href={`${ADMIN_BASE_PATH}/torneos/${v.tournament.id}/fechas/${target.round.number}`} className={btn.primary}>
                    <ClipboardList className="size-5" />
                    {target.matches.length ? "Cargar resultados" : "Armar cruces"}
                  </Link>
                )}
                <Link href={`${ADMIN_BASE_PATH}/torneos/${v.tournament.id}`} className={btn.secondary}>
                  Ver torneo
                </Link>
              </div>
            </Card>
          );
        })
      )}

      {pending.length > 0 && (
        <Card title={`Resultados pendientes (${pending.length})`}>
          <ul className="flex flex-col divide-y divide-white/5">
            {pending.slice(0, 6).map(({ t, r, m }) => (
              <li key={m.match.id}>
                <Link
                  href={`${ADMIN_BASE_PATH}/torneos/${t.id}/fechas/${r.round.number}`}
                  className="flex min-h-12 items-center gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-chalk">
                      {m.teamA.name} vs {m.teamB.name}
                    </span>
                    <span className="text-xs text-mist">
                      {t.name} · Fecha {r.round.number} · {m.results.length}/3 cargadas
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-mist" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href={`${ADMIN_BASE_PATH}/equipos?nuevo=1`} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-pitch p-4 transition hover:border-grass/40">
          <Shield className="size-6 text-grass" />
          <span className="font-semibold text-chalk">Nuevo equipo</span>
          <span className="text-xs text-mist">{activeTeams} activos</span>
        </Link>
        <Link href={`${ADMIN_BASE_PATH}/torneos/nuevo`} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-pitch p-4 transition hover:border-grass/40">
          <Trophy className="size-6 text-grass" />
          <span className="font-semibold text-chalk">Nuevo torneo</span>
          <span className="text-xs text-mist">
            {snap.tournaments.length} en total{drafts ? ` · ${drafts} borrador${drafts > 1 ? "es" : ""}` : ""}
          </span>
        </Link>
      </div>
    </AdminPage>
  );
}
