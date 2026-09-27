import {
  POINTS_PER_MODALITY,
  type Match,
  type MatchResult,
  type Round,
  type Team,
  type Tournament,
} from "@/lib/domain/types";
import { emptyModalityWins, groupResultsByMatch, summarizeMatch, type ModalityWins } from "./compute";

export interface HistoricalRow {
  teamId: string;
  position: number;
  titles: number;
  tournamentsPlayed: number;
  played: number;
  won: number;
  lost: number;
  modalityWins: ModalityWins;
  points: number;
}

export interface HistoricalInput {
  teams: Pick<Team, "id" | "name" | "archivedAt">[];
  tournaments: Pick<Tournament, "id" | "status" | "championTeamId" | "teamIds">[];
  rounds: Pick<Round, "id" | "tournamentId">[];
  matches: Pick<Match, "id" | "roundId" | "teamAId" | "teamBId">[];
  results: Pick<MatchResult, "matchId" | "modality" | "winnerTeamId">[];
}

const collator = new Intl.Collator("es", { sensitivity: "base" });

/**
 * Ranking histórico acumulado de todos los torneos publicados (nunca borradores).
 * Incluye a quienes jugaron algún torneo publicado (aunque estén archivados) y a todos los activos.
 * Orden: puntos → títulos → cruces ganados → Individual → nombre.
 */
export function computeHistorical(input: HistoricalInput): HistoricalRow[] {
  const published = input.tournaments.filter((t) => t.status !== "borrador");
  const publishedIds = new Set(published.map((t) => t.id));
  const roundToTournament = new Map(
    input.rounds.filter((r) => publishedIds.has(r.tournamentId)).map((r) => [r.id, r.tournamentId]),
  );
  const matches = input.matches.filter((m) => roundToTournament.has(m.roundId));

  const enrolled = new Set(published.flatMap((t) => t.teamIds));
  const included = input.teams.filter((t) => enrolled.has(t.id) || !t.archivedAt);

  const rows = new Map<string, Omit<HistoricalRow, "position">>();
  for (const t of included) {
    rows.set(t.id, {
      teamId: t.id,
      titles: 0,
      tournamentsPlayed: 0,
      played: 0,
      won: 0,
      lost: 0,
      modalityWins: emptyModalityWins(),
      points: 0,
    });
  }

  for (const t of published) {
    if (t.status === "en_curso" || t.status === "finalizado") {
      for (const id of t.teamIds) {
        const row = rows.get(id);
        if (row) row.tournamentsPlayed += 1;
      }
    }
    if (t.status === "finalizado" && t.championTeamId) {
      const row = rows.get(t.championTeamId);
      if (row) row.titles += 1;
    }
  }

  const byMatch = groupResultsByMatch(input.results);
  for (const m of matches) {
    const res = byMatch.get(m.id) ?? [];
    for (const r of res) {
      const row = rows.get(r.winnerTeamId);
      if (!row) continue;
      row.points += POINTS_PER_MODALITY;
      row.modalityWins[r.modality] += 1;
    }
    const s = summarizeMatch(m, res);
    if (!s.isComplete) continue;
    const a = rows.get(m.teamAId);
    const b = rows.get(m.teamBId);
    if (a) a.played += 1;
    if (b) b.played += 1;
    const loserId = s.winnerId === m.teamAId ? m.teamBId : m.teamAId;
    const w = rows.get(s.winnerId!);
    const l = rows.get(loserId);
    if (w) w.won += 1;
    if (l) l.lost += 1;
  }

  const names = new Map(input.teams.map((t) => [t.id, t.name]));
  return [...rows.values()]
    .sort(
      (x, y) =>
        y.points - x.points ||
        y.titles - x.titles ||
        y.won - x.won ||
        y.modalityWins.individual - x.modalityWins.individual ||
        collator.compare(names.get(x.teamId) ?? "", names.get(y.teamId) ?? ""),
    )
    .map((row, i) => ({ ...row, position: i + 1 }));
}
