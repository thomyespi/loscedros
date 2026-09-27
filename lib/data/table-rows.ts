import type { TableColumn, TableRow, TeamMatches } from "@/components/tournament/standings-table";
import type { Team } from "@/lib/domain/types";
import type { StandingRow } from "@/lib/standings/compute";
import type { HistoricalRow } from "@/lib/standings/historical";
import { formatShort } from "@/lib/dates";
import type { TournamentView } from "./selectors";

export const TOURNAMENT_COLUMNS: TableColumn[] = [
  { key: "played", label: "PJ", title: "cruces jugados" },
  { key: "won", label: "PG", title: "cruces ganados" },
  { key: "lost", label: "PP", title: "cruces perdidos" },
  { key: "individual", label: "IND", title: "Individual ganadas" },
  { key: "four_ball", label: "FB", title: "Four Ball ganadas" },
  { key: "foursome", label: "FS", title: "Foursome ganadas" },
];

export const HISTORICAL_COLUMNS: TableColumn[] = [
  { key: "titles", label: "TIT", title: "títulos" },
  { key: "tournaments", label: "TJ", title: "torneos jugados" },
  { key: "played", label: "PJ", title: "cruces jugados" },
  { key: "won", label: "PG", title: "cruces ganados" },
  { key: "individual", label: "IND", title: "Individual" },
  { key: "four_ball", label: "FB", title: "Four Ball" },
  { key: "foursome", label: "FS", title: "Foursome" },
];

export function tournamentRows(rows: StandingRow[], teamById: Map<string, Team>): TableRow[] {
  return rows.map((r) => ({
    team: teamById.get(r.teamId)!,
    position: r.position,
    points: r.points,
    values: { played: r.played, won: r.won, lost: r.lost, ...r.modalityWins },
  }));
}

export function historicalRows(rows: HistoricalRow[], teamById: Map<string, Team>): TableRow[] {
  return rows.map((r) => ({
    team: teamById.get(r.teamId)!,
    position: r.position,
    points: r.points,
    titles: r.titles,
    values: { titles: r.titles, tournaments: r.tournamentsPlayed, played: r.played, won: r.won, ...r.modalityWins },
  }));
}

/** Cruces de cada equipo en el torneo (para el panel que se abre al tocar la tabla). */
export function matchesByTeam(view: TournamentView): Record<string, TeamMatches[]> {
  const out: Record<string, TeamMatches[]> = {};
  for (const r of view.rounds) {
    for (const m of r.matches) {
      const entry = {
        label: `Fecha ${r.round.number} · ${formatShort(r.round.playDate)}`,
        match: { teamA: m.teamA, teamB: m.teamB, results: m.results, aWins: m.aWins, bWins: m.bWins, isComplete: m.isComplete, winnerId: m.winnerId },
      };
      (out[m.teamA.id] ??= []).push(entry);
      (out[m.teamB.id] ??= []).push(entry);
    }
  }
  return out;
}
