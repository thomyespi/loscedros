import { MODALITIES, type Match, type MatchResult, type Round } from "./types";

/** Motivo por el que una transición no está permitida y la fecha a completar. */
export interface ReadinessIssue {
  reason: string;
  /** Número de fecha a completar (null si el torneo no tiene fechas). */
  round: number | null;
}

export interface Readiness {
  /** Puede pasar a `en_curso` desde `borrador`/`proximo`: la Fecha 1 tiene al menos un cruce. */
  canStart: boolean;
  /** Puede pasar a `finalizado`: todas las fechas tienen cruces y todos los cruces sus 3 resultados. */
  canFinish: boolean;
  startIssue: ReadinessIssue | null;
  finishIssue: ReadinessIssue | null;
}

/**
 * Reglas de estado del torneo. Misma lógica que el trigger `check_tournament()`
 * de la base; se usa en el panel (botones) y en la server action.
 */
export function tournamentReadiness({
  rounds,
  matches,
  results,
}: {
  rounds: Pick<Round, "id" | "number">[];
  matches: Pick<Match, "id" | "roundId">[];
  results: Pick<MatchResult, "matchId" | "modality">[];
}): Readiness {
  const sorted = [...rounds].sort((a, b) => a.number - b.number);
  const modalitiesByMatch = new Map<string, Set<string>>();
  for (const r of results) {
    if (!modalitiesByMatch.has(r.matchId)) modalitiesByMatch.set(r.matchId, new Set());
    modalitiesByMatch.get(r.matchId)!.add(r.modality);
  }
  const matchesOf = (roundId: string) => matches.filter((m) => m.roundId === roundId);

  const first = sorted.find((r) => r.number === 1);
  const startIssue: ReadinessIssue | null =
    first && matchesOf(first.id).length > 0 ? null : { reason: "Armá los cruces de la Fecha 1 para arrancar", round: first ? 1 : null };

  let finishIssue: ReadinessIssue | null = sorted.length ? null : { reason: "El torneo no tiene fechas", round: null };
  for (const r of sorted) {
    const ms = matchesOf(r.id);
    if (ms.length === 0) {
      finishIssue = { reason: `La Fecha ${r.number} no tiene cruces`, round: r.number };
      break;
    }
    const pending = ms.filter((m) => (modalitiesByMatch.get(m.id)?.size ?? 0) < MODALITIES.length).length;
    if (pending > 0) {
      finishIssue = {
        reason: `Faltan resultados en la Fecha ${r.number} (${pending} ${pending === 1 ? "cruce" : "cruces"})`,
        round: r.number,
      };
      break;
    }
  }

  return { canStart: !startIssue, canFinish: !finishIssue, startIssue, finishIssue };
}
