import { describe, expect, it } from "vitest";
import { computeStandings } from "@/lib/standings/compute";
import type { Modality } from "@/lib/domain/types";

const T = (id: string, name = id) => ({ id, name });

let seq = 0;
/** Crea un cruce y sus resultados. `winners` = ganador de [individual, four_ball, foursome] (null = sin cargar). */
function match(a: string, b: string, winners: (string | null)[]) {
  const id = `m${++seq}`;
  const mods: Modality[] = ["individual", "four_ball", "foursome"];
  const results = winners
    .map((w, i) => (w ? { matchId: id, modality: mods[i], winnerTeamId: w } : null))
    .filter((r) => r !== null);
  return { match: { id, teamAId: a, teamBId: b }, results };
}

function build(teams: { id: string; name: string }[], ...ms: ReturnType<typeof match>[]) {
  return computeStandings({
    teams,
    matches: ms.map((m) => m.match),
    results: ms.flatMap((m) => m.results),
  });
}

describe("computeStandings", () => {
  it("tabla vacía: todos en cero y orden alfabético", () => {
    const rows = build([T("c", "Zorros"), T("a", "Águilas"), T("b", "Búhos")]);
    expect(rows.map((r) => r.teamId)).toEqual(["a", "b", "c"]);
    expect(rows.every((r) => r.points === 0 && r.played === 0)).toBe(true);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3]);
  });

  it("suma 3 puntos por modalidad ganada y cuenta cruces ganados/perdidos", () => {
    const rows = build([T("a"), T("b")], match("a", "b", ["a", "a", "b"]));
    const a = rows.find((r) => r.teamId === "a")!;
    const b = rows.find((r) => r.teamId === "b")!;
    expect(a).toMatchObject({ points: 6, played: 1, won: 1, lost: 0, position: 1 });
    expect(a.modalityWins).toEqual({ individual: 1, four_ball: 1, foursome: 0 });
    expect(b).toMatchObject({ points: 3, played: 1, won: 0, lost: 1, position: 2 });
  });

  it("resultados parciales suman puntos pero no cuentan como cruce jugado", () => {
    const rows = build([T("a"), T("b")], match("a", "b", ["a", "b", null]));
    for (const r of rows) {
      expect(r.points).toBe(3);
      expect(r.played).toBe(0);
      expect(r.won + r.lost).toBe(0);
    }
  });

  it("equipo libre (sin cruces) aparece con cero", () => {
    const rows = build([T("a"), T("b"), T("libre")], match("a", "b", ["a", "a", "a"]));
    expect(rows.find((r) => r.teamId === "libre")).toMatchObject({ points: 0, played: 0, position: 3 });
  });

  it("desempata por cruces ganados", () => {
    // a: 3-0 a c (9) + 0-3 con d (0) + 3-0 a e (9) = 18 pts, 2 PG
    // b: 2-1, 2-1, 2-1 = 18 pts, 3 PG
    const rows = build(
      [T("a"), T("b"), T("c"), T("d"), T("e"), T("f")],
      match("a", "c", ["a", "a", "a"]),
      match("a", "d", ["d", "d", "d"]),
      match("a", "e", ["a", "a", "a"]),
      match("b", "c", ["b", "b", "c"]),
      match("b", "e", ["b", "b", "e"]),
      match("b", "f", ["b", "b", "f"]),
    );
    const a = rows.find((r) => r.teamId === "a")!;
    const b = rows.find((r) => r.teamId === "b")!;
    expect(a.points).toBe(18);
    expect(b.points).toBe(18);
    expect(b.position).toBeLessThan(a.position);
  });

  it("desempata por enfrentamiento directo", () => {
    // a y b: 9 pts y 1 PG cada uno. En el directo a ganó 2-1.
    const rows = build(
      [T("a", "Aa"), T("b", "Bb"), T("c"), T("d")],
      match("a", "b", ["a", "a", "b"]), // a 6, b 3 ; a PG
      match("b", "c", ["b", "b", "c"]), // b 6 ; b PG ; c 3
      match("a", "d", ["d", "d", "a"]), // a 3 ; d 6 ; d PG
    );
    const a = rows.find((r) => r.teamId === "a")!;
    const b = rows.find((r) => r.teamId === "b")!;
    expect([a.points, a.won]).toEqual([9, 1]);
    expect([b.points, b.won]).toEqual([9, 1]);
    expect(a.position).toBeLessThan(b.position);
  });

  it("triple empate: mini-tabla entre los empatados y luego Individual", () => {
    // Círculo: a le gana a b, b a c, c a a, todos 2-1 → 9 pts y 2 PG cada uno... usamos un ciclo perfecto.
    // Mini-tabla: todos 9 pts entre ellos → decide Individual ganadas.
    const rows = build(
      [T("a", "Alfa"), T("b", "Beta"), T("c", "Gama")],
      match("a", "b", ["b", "a", "a"]), // a 6 (FB,FS), b 3 (IND)
      match("b", "c", ["c", "b", "b"]), // b 6 (FB,FS), c 3 (IND)
      match("c", "a", ["c", "c", "a"]), // c 6 (IND,FB), a 3 (FS)
    );
    // Totales: a 9 (0 IND), b 9 (1 IND), c 9 (2 IND); PG 1 cada uno.
    expect(rows.map((r) => r.points)).toEqual([9, 9, 9]);
    expect(rows.map((r) => r.teamId)).toEqual(["c", "b", "a"]);
  });

  it("mini-tabla solo cuenta cruces entre los empatados", () => {
    // a y b empatan en puntos y PG; nunca se enfrentaron → h2h 0-0 → decide Individual.
    const rows = build(
      [T("a"), T("b"), T("c"), T("d")],
      match("a", "c", ["c", "a", "a"]), // a 6, 0 IND
      match("b", "d", ["b", "b", "d"]), // b 6, 1 IND
    );
    expect(rows[0].teamId).toBe("b");
    expect(rows[1].teamId).toBe("a");
  });

  it("empate total se resuelve por nombre", () => {
    const rows = build([T("x", "Zeta"), T("y", "Alfa")], match("x", "y", [null, "x", "y"]));
    expect(rows.map((r) => r.teamId)).toEqual(["y", "x"]);
  });

  it("un cruce 3-0 da 9 puntos y un cruce ganado", () => {
    const rows = build([T("a"), T("b")], match("a", "b", ["a", "a", "a"]));
    expect(rows[0]).toMatchObject({ teamId: "a", points: 9, won: 1 });
    expect(rows[1]).toMatchObject({ teamId: "b", points: 0, lost: 1 });
  });
});
