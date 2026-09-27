import {
  MODALITIES,
  POINTS_PER_MODALITY,
  type Match,
  type MatchResult,
  type Modality,
} from "@/lib/domain/types";

export type ModalityWins = Record<Modality, number>;

export interface StandingRow {
  teamId: string;
  position: number;
  /** Cruces completos (las 3 modalidades cargadas). */
  played: number;
  won: number;
  lost: number;
  modalityWins: ModalityWins;
  points: number;
}

export interface StandingsInput {
  teams: { id: string; name: string }[];
  matches: Pick<Match, "id" | "teamAId" | "teamBId">[];
  results: Pick<MatchResult, "matchId" | "modality" | "winnerTeamId">[];
}

export const emptyModalityWins = (): ModalityWins => ({ individual: 0, four_ball: 0, foursome: 0 });

const collator = new Intl.Collator("es", { sensitivity: "base" });

export function groupResultsByMatch<R extends Pick<MatchResult, "matchId">>(results: R[]) {
  const map = new Map<string, R[]>();
  for (const r of results) {
    const list = map.get(r.matchId);
    if (list) list.push(r);
    else map.set(r.matchId, [r]);
  }
  return map;
}

/** Resumen de un cruce: modalidades ganadas por cada lado y ganador si está completo. */
export function summarizeMatch(
  match: Pick<Match, "teamAId" | "teamBId">,
  results: Pick<MatchResult, "winnerTeamId">[],
) {
  const aWins = results.filter((r) => r.winnerTeamId === match.teamAId).length;
  const bWins = results.filter((r) => r.winnerTeamId === match.teamBId).length;
  const isComplete = results.length >= MODALITIES.length;
  const winnerId = isComplete ? (aWins > bWins ? match.teamAId : match.teamBId) : null;
  return { aWins, bWins, isComplete, winnerId };
}

/**
 * Tabla de posiciones de un torneo.
 * Orden: puntos → cruces ganados → enfrentamiento directo (mini-tabla entre empatados)
 * → modalidades Individual ganadas → nombre.
 */
export function computeStandings({ teams, matches, results }: StandingsInput): StandingRow[] {
  const rows = new Map<string, Omit<StandingRow, "position">>();
  for (const t of teams) {
    rows.set(t.id, { teamId: t.id, played: 0, won: 0, lost: 0, modalityWins: emptyModalityWins(), points: 0 });
  }
  const names = new Map(teams.map((t) => [t.id, t.name]));
  const byMatch = groupResultsByMatch(results);

  for (const match of matches) {
    const matchResults = byMatch.get(match.id) ?? [];
    for (const r of matchResults) {
      const row = rows.get(r.winnerTeamId);
      if (!row) continue;
      row.points += POINTS_PER_MODALITY;
      row.modalityWins[r.modality] += 1;
    }
    const summary = summarizeMatch(match, matchResults);
    if (!summary.isComplete) continue;
    const a = rows.get(match.teamAId);
    const b = rows.get(match.teamBId);
    if (a) a.played += 1;
    if (b) b.played += 1;
    const winner = rows.get(summary.winnerId!);
    const loser = rows.get(summary.winnerId === match.teamAId ? match.teamBId : match.teamAId);
    if (winner) winner.won += 1;
    if (loser) loser.lost += 1;
  }

  const primary = (x: Omit<StandingRow, "position">, y: Omit<StandingRow, "position">) =>
    y.points - x.points || y.won - x.won;

  const sorted = [...rows.values()].sort(primary);
  const ordered: Omit<StandingRow, "position">[] = [];

  for (let i = 0; i < sorted.length; ) {
    let j = i + 1;
    while (j < sorted.length && primary(sorted[i], sorted[j]) === 0) j++;
    const group = sorted.slice(i, j);
    if (group.length > 1) {
      const h2h = headToHeadPoints(
        group.map((g) => g.teamId),
        matches,
        byMatch,
      );
      group.sort(
        (x, y) =>
          (h2h.get(y.teamId) ?? 0) - (h2h.get(x.teamId) ?? 0) ||
          y.modalityWins.individual - x.modalityWins.individual ||
          collator.compare(names.get(x.teamId) ?? "", names.get(y.teamId) ?? ""),
      );
    }
    ordered.push(...group);
    i = j;
  }

  return ordered.map((row, idx) => ({ ...row, position: idx + 1 }));
}

/** Puntos obtenidos únicamente en los cruces entre los equipos indicados. */
function headToHeadPoints(
  teamIds: string[],
  matches: StandingsInput["matches"],
  byMatch: Map<string, StandingsInput["results"]>,
) {
  const inGroup = new Set(teamIds);
  const points = new Map<string, number>(teamIds.map((id) => [id, 0]));
  for (const m of matches) {
    if (!inGroup.has(m.teamAId) || !inGroup.has(m.teamBId)) continue;
    for (const r of byMatch.get(m.id) ?? []) {
      points.set(r.winnerTeamId, (points.get(r.winnerTeamId) ?? 0) + POINTS_PER_MODALITY);
    }
  }
  return points;
}
