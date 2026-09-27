import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RoundManager, type AdminMatch } from "@/components/admin/round-manager";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { buildTournamentView } from "@/lib/data/selectors";
import { formatLong } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Fecha" };

export default async function AdminRoundPage({ params }: PageProps<"/vestuario/torneos/[id]/fechas/[n]">) {
  const { id, n } = await params;
  const snap = await getAdminSnapshot();
  const tournament = snap.tournaments.find((t) => t.id === id);
  if (!tournament) notFound();
  const view = buildTournamentView(snap, tournament);
  const current = view.rounds.find((r) => r.round.number === Number(n));
  if (!current) notFound();

  const mini = (t: { id: string; name: string; avatarPath: string | null }) => ({ id: t.id, name: t.name, avatarPath: t.avatarPath });
  const matches: AdminMatch[] = current.matches.map((m) => ({
    id: m.match.id,
    teamA: mini(m.teamA),
    teamB: mini(m.teamB),
    results: Object.fromEntries(m.results.map((r) => [r.modality, { winnerTeamId: r.winnerTeamId, scoreNote: r.scoreNote }])),
  }));

  // Cruces ya jugados en OTRAS fechas (para advertir repeticiones).
  const previousMeetings: Record<string, number[]> = {};
  for (const r of view.rounds) {
    if (r.round.id === current.round.id) continue;
    for (const m of r.matches) {
      const key = [m.match.teamAId, m.match.teamBId].sort().join("|");
      (previousMeetings[key] ??= []).push(r.round.number);
    }
  }

  const prev = view.rounds.find((r) => r.round.number === current.round.number - 1);
  const next = view.rounds.find((r) => r.round.number === current.round.number + 1);
  const base = `${ADMIN_BASE_PATH}/torneos/${id}`;
  const navBtn = "inline-flex h-11 items-center gap-1 rounded-full border border-white/10 px-4 text-sm font-semibold text-chalk transition hover:bg-white/5";

  return (
    <AdminPage
      title={`Fecha ${current.round.number}`}
      subtitle={
        <span className="capitalize">
          {formatLong(current.round.playDate)} · {tournament.name}
        </span>
      }
      back={{ href: base, label: tournament.name }}
    >
      <nav className="flex justify-between gap-2" aria-label="Otras fechas">
        {prev ? (
          <Link href={`${base}/fechas/${prev.round.number}`} className={navBtn}>
            <ChevronLeft className="size-4" /> Fecha {prev.round.number}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`${base}/fechas/${next.round.number}`} className={cn(navBtn, "ml-auto")}>
            Fecha {next.round.number} <ChevronRight className="size-4" />
          </Link>
        )}
      </nav>
      <RoundManager
        roundId={current.round.id}
        matches={matches}
        free={current.free.map(mini)}
        previousMeetings={previousMeetings}
        locked={tournament.status === "finalizado"}
      />
    </AdminPage>
  );
}
