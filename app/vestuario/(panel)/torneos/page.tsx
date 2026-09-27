import { ChevronRight, Plus, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage, EmptyState, btn } from "@/components/admin/ui";
import { StatusBadge } from "@/components/tournament/status-badge";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { buildTournamentView } from "@/lib/data/selectors";
import { formatRange } from "@/lib/dates";
import type { TournamentStatus } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Torneos" };

const ORDER: { status: TournamentStatus; title: string }[] = [
  { status: "en_curso", title: "En juego" },
  { status: "proximo", title: "Próximos" },
  { status: "borrador", title: "Borradores (no públicos)" },
  { status: "finalizado", title: "Finalizados" },
];

export default async function AdminTournamentsPage() {
  const snap = await getAdminSnapshot();
  const views = snap.tournaments.map((t) => buildTournamentView(snap, t));

  return (
    <AdminPage
      title="Torneos"
      actions={
        <Link href={`${ADMIN_BASE_PATH}/torneos/nuevo`} className={btn.primary}>
          <Plus className="size-5" /> Nuevo
        </Link>
      }
    >
      {views.length === 0 ? (
        <EmptyState icon={<Trophy className="size-8 text-grass" />} title="Todavía no hay torneos">
          <Link href={`${ADMIN_BASE_PATH}/torneos/nuevo`} className={btn.primary}>
            <Plus className="size-5" /> Crear el primero
          </Link>
        </EmptyState>
      ) : (
        ORDER.map(({ status, title }) => {
          const list = views
            .filter((v) => v.tournament.status === status)
            .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
          if (!list.length) return null;
          return (
            <section key={status} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-mist uppercase">{title}</h2>
              <ul className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-pitch">
                {list.map((v) => (
                  <li key={v.tournament.id}>
                    <Link href={`${ADMIN_BASE_PATH}/torneos/${v.tournament.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 transition hover:bg-pitch-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-chalk">{v.tournament.name}</span>
                        <span className="text-xs text-mist">
                          {formatRange(v.startDate, v.endDate)} · {v.teams.length} equipos · {v.rounds.length} fechas
                          {v.pendingMatches > 0 && status !== "finalizado" && ` · ${v.pendingMatches} cruces pendientes`}
                        </span>
                      </span>
                      <StatusBadge status={v.tournament.status} className="hidden sm:inline-flex" />
                      <ChevronRight className="size-4 text-mist" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </AdminPage>
  );
}
