import { describe, expect, it } from "vitest";
import { tournamentReadiness } from "@/lib/domain/readiness";
import { MODALITIES } from "@/lib/domain/types";

const rounds = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `r${i + 1}`, number: i + 1 }));

let seq = 0;
/** Cruce en la fecha `round` con los primeros `count` resultados cargados. */
function match(round: number, count: number) {
  const id = `m${++seq}`;
  return {
    match: { id, roundId: `r${round}` },
    results: MODALITIES.slice(0, count).map((modality) => ({ matchId: id, modality })),
  };
}

function check(n: number, ...ms: ReturnType<typeof match>[]) {
  return tournamentReadiness({ rounds: rounds(n), matches: ms.map((m) => m.match), results: ms.flatMap((m) => m.results) });
}

describe("tournamentReadiness", () => {
  it("Fecha 1 sin cruces: no puede arrancar ni finalizar", () => {
    const r = check(3);
    expect(r.canStart).toBe(false);
    expect(r.startIssue).toEqual({ reason: "Armá los cruces de la Fecha 1 para arrancar", round: 1 });
    expect(r.canFinish).toBe(false);
    expect(r.finishIssue).toEqual({ reason: "La Fecha 1 no tiene cruces", round: 1 });
  });

  it("Fecha 1 con cruces y el resto vacías: puede arrancar, no finalizar", () => {
    const r = check(3, match(1, 0));
    expect(r.canStart).toBe(true);
    expect(r.startIssue).toBeNull();
    expect(r.canFinish).toBe(false);
  });

  it("fecha intermedia sin cruces: indica cuál", () => {
    const r = check(3, match(1, 3), match(3, 3));
    expect(r.canFinish).toBe(false);
    expect(r.finishIssue).toEqual({ reason: "La Fecha 2 no tiene cruces", round: 2 });
  });

  it("cruce con 2 de 3 resultados: indica fecha y cantidad de cruces", () => {
    const r = check(2, match(1, 3), match(2, 3), match(2, 2));
    expect(r.canFinish).toBe(false);
    expect(r.finishIssue).toEqual({ reason: "Faltan resultados en la Fecha 2 (1 cruce)", round: 2 });
  });

  it("todo completo: puede arrancar y finalizar", () => {
    const r = check(2, match(1, 3), match(1, 3), match(2, 3));
    expect(r).toEqual({ canStart: true, canFinish: true, startIssue: null, finishIssue: null });
  });

  it("resultados repetidos de una modalidad no cuentan doble", () => {
    const m = match(1, 2);
    const r = tournamentReadiness({ rounds: rounds(1), matches: [m.match], results: [...m.results, m.results[0]] });
    expect(r.canFinish).toBe(false);
  });
});
