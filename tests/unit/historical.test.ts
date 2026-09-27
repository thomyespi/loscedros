import { describe, expect, it } from "vitest";
import { computeHistorical, type HistoricalInput } from "@/lib/standings/historical";

const team = (id: string, name = id, archivedAt: string | null = null) => ({ id, name, archivedAt });

function input(partial: Partial<HistoricalInput>): HistoricalInput {
  return { teams: [], tournaments: [], rounds: [], matches: [], results: [], ...partial };
}

describe("computeHistorical", () => {
  const base = input({
    teams: [team("a", "Alfa"), team("b", "Beta"), team("c", "Gama"), team("nuevo", "Nuevo"), team("viejo", "Viejo", "2026-01-01"), team("fantasma", "Fantasma", "2026-01-01")],
    tournaments: [
      { id: "t1", status: "finalizado", championTeamId: "a", teamIds: ["a", "b", "viejo"] },
      { id: "t2", status: "en_curso", championTeamId: null, teamIds: ["a", "b", "c"] },
      { id: "t3", status: "borrador", championTeamId: null, teamIds: ["a", "b"] },
    ],
    rounds: [
      { id: "r1", tournamentId: "t1" },
      { id: "r2", tournamentId: "t2" },
      { id: "r3", tournamentId: "t3" },
    ],
    matches: [
      { id: "m1", roundId: "r1", teamAId: "a", teamBId: "b" },
      { id: "m2", roundId: "r1", teamAId: "viejo", teamBId: "a" },
      { id: "m3", roundId: "r2", teamAId: "b", teamBId: "c" },
      { id: "m4", roundId: "r3", teamAId: "a", teamBId: "b" },
    ],
    results: [
      { matchId: "m1", modality: "individual", winnerTeamId: "a" },
      { matchId: "m1", modality: "four_ball", winnerTeamId: "a" },
      { matchId: "m1", modality: "foursome", winnerTeamId: "b" },
      { matchId: "m2", modality: "individual", winnerTeamId: "viejo" },
      { matchId: "m2", modality: "four_ball", winnerTeamId: "a" },
      { matchId: "m2", modality: "foursome", winnerTeamId: "a" },
      { matchId: "m3", modality: "individual", winnerTeamId: "b" },
      { matchId: "m3", modality: "four_ball", winnerTeamId: "b" },
      // borrador: no debe contar
      { matchId: "m4", modality: "individual", winnerTeamId: "b" },
      { matchId: "m4", modality: "four_ball", winnerTeamId: "b" },
      { matchId: "m4", modality: "foursome", winnerTeamId: "b" },
    ],
  });

  const rows = computeHistorical(base);
  const get = (id: string) => rows.find((r) => r.teamId === id);

  it("suma puntos de todos los torneos publicados, ignorando borradores", () => {
    expect(get("a")!.points).toBe(12);
    expect(get("b")!.points).toBe(9);
  });

  it("cuenta títulos solo de torneos finalizados", () => {
    expect(get("a")!.titles).toBe(1);
    expect(get("b")!.titles).toBe(0);
  });

  it("cuenta torneos jugados (en curso o finalizados)", () => {
    expect(get("a")!.tournamentsPlayed).toBe(2);
    expect(get("c")!.tournamentsPlayed).toBe(1);
  });

  it("incluye activos sin torneos y archivados con historial; excluye archivados sin historial", () => {
    expect(get("nuevo")).toMatchObject({ points: 0, tournamentsPlayed: 0 });
    expect(get("viejo")).toMatchObject({ points: 3 });
    expect(get("fantasma")).toBeUndefined();
  });

  it("solo los cruces completos cuentan como jugados", () => {
    expect(get("b")!.played).toBe(1); // m1 completo; m3 parcial
    expect(get("a")).toMatchObject({ played: 2, won: 2, lost: 0 });
  });

  it("ordena por puntos y desempata por títulos", () => {
    const tie = computeHistorical(
      input({
        teams: [team("x", "Xavi"), team("y", "Yuyo")],
        tournaments: [{ id: "t", status: "finalizado", championTeamId: "y", teamIds: ["x", "y"] }],
        rounds: [{ id: "r", tournamentId: "t" }],
        matches: [{ id: "m", roundId: "r", teamAId: "x", teamBId: "y" }],
        results: [
          { matchId: "m", modality: "individual", winnerTeamId: "x" },
          { matchId: "m", modality: "four_ball", winnerTeamId: "y" },
        ],
      }),
    );
    expect(tie.map((r) => r.teamId)).toEqual(["y", "x"]);
  });
});
