import {
  MODALITIES,
  type Match,
  type MatchResult,
  type Round,
  type Snapshot,
  type Team,
  type Tournament,
} from "@/lib/domain/types";
import { computeStandings } from "@/lib/standings/compute";
import { DEFAULT_SETTINGS } from "@/lib/settings";

/**
 * Datos de demostración. Se usan:
 *  - como fuente del sitio cuando no hay Supabase configurado (modo demo), y
 *  - para generar `supabase/seed.sql` (npm run db:seed).
 * Todo es determinístico: mismos datos en cada ejecución.
 */

const uuid = (prefix: string, n: number) =>
  `00000000-0000-4000-8000-${prefix}${n.toString(16).padStart(12 - prefix.length, "0")}`;

// PRNG determinístico (mulberry32)
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAM_DEFS: { name: string; slug: string; strength: number; archived?: boolean }[] = [
  { name: "Los Pibes del Hoyo 9", slug: "los-pibes-del-hoyo-9", strength: 0.62 },
  { name: "Cedros FC", slug: "cedros-fc", strength: 0.7 },
  { name: "Botines de Oro", slug: "botines-de-oro", strength: 0.58 },
  { name: "La Banda del Birdie", slug: "la-banda-del-birdie", strength: 0.55 },
  { name: "Eagle Norte", slug: "eagle-norte", strength: 0.5 },
  { name: "Fuera de Juego", slug: "fuera-de-juego", strength: 0.42 },
  { name: "Los Galgos", slug: "los-galgos", strength: 0.47 },
  { name: "Tiro Libre", slug: "tiro-libre", strength: 0.45 },
  { name: "Los Veteranos", slug: "los-veteranos", strength: 0.4, archived: true },
];

export const demoTeams: Team[] = TEAM_DEFS.map((t, i) => ({
  id: uuid("a", i + 1),
  name: t.name,
  slug: t.slug,
  avatarPath: null,
  archivedAt: t.archived ? "2026-06-01T12:00:00.000Z" : null,
  createdAt: "2026-02-01T12:00:00.000Z",
}));
const strength = new Map(demoTeams.map((t, i) => [t.id, TEAM_DEFS[i].strength]));
const tid = (n: number) => demoTeams[n - 1].id;

interface TournamentDef {
  name: string;
  slug: string;
  description: string;
  status: Tournament["status"];
  teams: number[];
  dates: string[];
  /** Por fecha: lista de cruces [a, b, cantidad de resultados cargados]. */
  fixtures: [number, number, number][][];
}

const TOURNAMENT_DEFS: TournamentDef[] = [
  {
    name: "Apertura 2026",
    slug: "apertura-2026",
    description: "El primer torneo del año en Los Cedros. Seis equipos, tres fechas y la gloria de levantar la primera copa.",
    status: "finalizado",
    teams: [1, 2, 3, 4, 5, 9],
    dates: ["2026-03-14", "2026-04-18", "2026-05-23"],
    fixtures: [
      [[1, 2, 3], [3, 4, 3], [5, 9, 3]],
      [[1, 3, 3], [2, 5, 3], [4, 9, 3]],
      [[1, 4, 3], [2, 9, 3], [3, 5, 3]],
    ],
  },
  {
    name: "Clausura 2026",
    slug: "clausura-2026",
    description: "Ocho equipos, cuatro fechas y todo por definirse. ¿Quién se queda con el Clausura?",
    status: "en_curso",
    teams: [1, 2, 3, 4, 5, 6, 7, 8],
    dates: ["2026-08-15", "2026-09-12", "2026-10-10", "2026-11-07"],
    fixtures: [
      [[1, 8, 3], [2, 7, 3], [3, 6, 3], [4, 5, 3]],
      [[1, 7, 3], [8, 6, 3], [2, 5, 3], [3, 4, 2]],
      [],
      [],
    ],
  },
  {
    name: "Copa Primavera 2026",
    slug: "copa-primavera-2026",
    description: "Un torneo corto de dos fechas para cerrar el año a puro footgolf.",
    status: "proximo",
    teams: [1, 2, 3, 5, 6, 7],
    dates: ["2026-12-05", "2026-12-19"],
    fixtures: [[], []],
  },
  {
    name: "Verano 2027",
    slug: "verano-2027",
    description: "Borrador: todavía no es público.",
    status: "borrador",
    teams: [1, 2, 3, 4],
    dates: ["2027-01-16"],
    fixtures: [[]],
  },
];

const tournaments: Tournament[] = [];
const rounds: Round[] = [];
const matches: Match[] = [];
const results: MatchResult[] = [];

{
  const rand = rng(1614);
  let roundSeq = 0;
  let matchSeq = 0;
  TOURNAMENT_DEFS.forEach((def, ti) => {
    const tournament: Tournament = {
      id: uuid("b", ti + 1),
      name: def.name,
      slug: def.slug,
      description: def.description,
      coverPath: null,
      status: def.status,
      championTeamId: null,
      finishedAt: def.status === "finalizado" ? `${def.dates.at(-1)}T21:00:00.000Z` : null,
      createdAt: `2026-0${ti + 2}-01T12:00:00.000Z`,
      teamIds: def.teams.map(tid),
    };
    tournaments.push(tournament);

    def.dates.forEach((date, ri) => {
      const round: Round = { id: uuid("c", ++roundSeq), tournamentId: tournament.id, number: ri + 1, playDate: date };
      rounds.push(round);
      for (const [a, b, count] of def.fixtures[ri] ?? []) {
        const match: Match = {
          id: uuid("d", ++matchSeq),
          roundId: round.id,
          teamAId: tid(a),
          teamBId: tid(b),
          createdAt: `${date}T12:00:00.000Z`,
        };
        matches.push(match);
        const pa = strength.get(match.teamAId)!;
        const pb = strength.get(match.teamBId)!;
        MODALITIES.slice(0, count).forEach((modality) => {
          const aWins = rand() < pa / (pa + pb);
          const holes = Math.floor(rand() * 3) + 1;
          results.push({
            matchId: match.id,
            modality,
            winnerTeamId: aWins ? match.teamAId : match.teamBId,
            scoreNote: rand() < 0.6 ? (holes === 1 ? "1 UP" : `${holes + 1}&${holes}`) : null,
          });
        });
      }
    });

    if (def.status === "finalizado") {
      const roundIds = new Set(rounds.filter((r) => r.tournamentId === tournament.id).map((r) => r.id));
      const tMatches = matches.filter((m) => roundIds.has(m.roundId));
      const ids = new Set(tMatches.map((m) => m.id));
      const table = computeStandings({
        teams: demoTeams.filter((t) => tournament.teamIds.includes(t.id)),
        matches: tMatches,
        results: results.filter((r) => ids.has(r.matchId)),
      });
      tournament.championTeamId = table[0].teamId;
    }
  });
}

export const demoData = { teams: demoTeams, tournaments, rounds, matches, results };

/** Snapshot público (sin borradores), tal como lo vería un visitante. */
export function getDemoSnapshot(): Snapshot {
  const publicTournaments = tournaments.filter((t) => t.status !== "borrador");
  const ids = new Set(publicTournaments.map((t) => t.id));
  const publicRounds = rounds.filter((r) => ids.has(r.tournamentId));
  const roundIds = new Set(publicRounds.map((r) => r.id));
  const publicMatches = matches.filter((m) => roundIds.has(m.roundId));
  const matchIds = new Set(publicMatches.map((m) => m.id));
  return {
    settings: DEFAULT_SETTINGS,
    teams: demoTeams,
    tournaments: publicTournaments,
    rounds: publicRounds,
    matches: publicMatches,
    results: results.filter((r) => matchIds.has(r.matchId)),
    photos: [],
  };
}
