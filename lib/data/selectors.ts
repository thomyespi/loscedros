import { todayISO } from "@/lib/dates";
import type { Match, MatchResult, Photo, Round, Snapshot, Team, Tournament } from "@/lib/domain/types";
import { computeStandings, groupResultsByMatch, summarizeMatch, type StandingRow } from "@/lib/standings/compute";
import { computeHistorical } from "@/lib/standings/historical";

export interface MatchView {
  match: Match;
  teamA: Team;
  teamB: Team;
  results: MatchResult[];
  aWins: number;
  bWins: number;
  isComplete: boolean;
  winnerId: string | null;
}

export interface RoundView {
  round: Round;
  matches: MatchView[];
  /** Equipos inscriptos sin cruce en esta fecha. */
  free: Team[];
  isPast: boolean;
}

export interface TournamentView {
  tournament: Tournament;
  teams: Team[];
  teamById: Map<string, Team>;
  rounds: RoundView[];
  standings: StandingRow[];
  leader: StandingRow | null;
  champion: Team | null;
  startDate: string | undefined;
  endDate: string | undefined;
  /** Próxima fecha (hoy o después). */
  nextRound: RoundView | null;
  /** Fecha que se muestra por defecto en la pestaña "Fechas". */
  defaultRoundNumber: number;
  photos: Photo[];
  pendingMatches: number;
}

export const teamMap = (snap: Snapshot) => new Map(snap.teams.map((t) => [t.id, t]));

export function buildTournamentView(snap: Snapshot, tournament: Tournament, today = todayISO()): TournamentView {
  const teamById = teamMap(snap);
  const teams = tournament.teamIds.map((id) => teamById.get(id)).filter((t): t is Team => !!t);
  const rounds = snap.rounds
    .filter((r) => r.tournamentId === tournament.id)
    .sort((a, b) => a.number - b.number);
  const roundIds = new Set(rounds.map((r) => r.id));
  const matches = snap.matches.filter((m) => roundIds.has(m.roundId));
  const matchIds = new Set(matches.map((m) => m.id));
  const results = snap.results.filter((r) => matchIds.has(r.matchId));
  const byMatch = groupResultsByMatch(results);

  const roundViews: RoundView[] = rounds.map((round) => {
    const rMatches = matches.filter((m) => m.roundId === round.id);
    const busy = new Set(rMatches.flatMap((m) => [m.teamAId, m.teamBId]));
    return {
      round,
      isPast: round.playDate < today,
      free: teams.filter((t) => !busy.has(t.id)),
      matches: rMatches.map((match) => {
        const res = byMatch.get(match.id) ?? [];
        const s = summarizeMatch(match, res);
        return {
          match,
          teamA: teamById.get(match.teamAId)!,
          teamB: teamById.get(match.teamBId)!,
          results: res,
          ...s,
        };
      }),
    };
  });

  const standings = computeStandings({ teams, matches, results });
  const nextRound = roundViews.find((r) => r.round.playDate >= today) ?? null;
  const lastPlayed = [...roundViews].reverse().find((r) => r.matches.some((m) => m.results.length > 0));
  const defaultRound =
    (nextRound && nextRound.matches.length > 0 ? nextRound : null) ?? lastPlayed ?? nextRound ?? roundViews[0];

  return {
    tournament,
    teams,
    teamById,
    rounds: roundViews,
    standings,
    leader: standings.length && standings[0].points > 0 ? standings[0] : null,
    champion: tournament.championTeamId ? (teamById.get(tournament.championTeamId) ?? null) : null,
    startDate: rounds[0]?.playDate,
    endDate: rounds.at(-1)?.playDate,
    nextRound,
    defaultRoundNumber: defaultRound?.round.number ?? 1,
    photos: snap.photos.filter((p) => p.tournamentId === tournament.id),
    pendingMatches: roundViews.flatMap((r) => r.matches).filter((m) => !m.isComplete).length,
  };
}

export function findTournament(snap: Snapshot, slug: string) {
  return snap.tournaments.find((t) => t.slug === slug && t.status !== "borrador") ?? null;
}

const firstDate = (snap: Snapshot, t: Tournament) =>
  snap.rounds.filter((r) => r.tournamentId === t.id).sort((a, b) => a.number - b.number)[0]?.playDate ?? "9999-12-31";

const lastDate = (snap: Snapshot, t: Tournament) =>
  snap.rounds
    .filter((r) => r.tournamentId === t.id)
    .sort((a, b) => b.number - a.number)[0]?.playDate ?? t.finishedAt?.slice(0, 10) ?? "0000-01-01";

export function groupTournaments(snap: Snapshot) {
  const pub = snap.tournaments.filter((t) => t.status !== "borrador");
  return {
    live: pub.filter((t) => t.status === "en_curso").sort((a, b) => firstDate(snap, b).localeCompare(firstDate(snap, a))),
    upcoming: pub.filter((t) => t.status === "proximo").sort((a, b) => firstDate(snap, a).localeCompare(firstDate(snap, b))),
    finished: pub
      .filter((t) => t.status === "finalizado")
      .sort((a, b) => lastDate(snap, b).localeCompare(lastDate(snap, a))),
  };
}

export type Spotlight =
  | { kind: "live"; view: TournamentView }
  | { kind: "upcoming"; view: TournamentView }
  | { kind: "champion"; view: TournamentView };

/** Torneo destacado en la home: en curso → próximo → último campeón. */
export function getSpotlight(snap: Snapshot): Spotlight | null {
  const g = groupTournaments(snap);
  if (g.live[0]) return { kind: "live", view: buildTournamentView(snap, g.live[0]) };
  if (g.upcoming[0]) return { kind: "upcoming", view: buildTournamentView(snap, g.upcoming[0]) };
  if (g.finished[0]) return { kind: "champion", view: buildTournamentView(snap, g.finished[0]) };
  return null;
}

export function getHistorical(snap: Snapshot) {
  return computeHistorical(snap);
}

export function getTeamView(snap: Snapshot, slug: string) {
  const team = snap.teams.find((t) => t.slug === slug);
  if (!team) return null;
  const historical = getHistorical(snap).find((r) => r.teamId === team.id) ?? null;
  const tournaments = snap.tournaments
    .filter((t) => t.status !== "borrador" && t.teamIds.includes(team.id))
    .map((t) => {
      const view = buildTournamentView(snap, t);
      return { view, row: view.standings.find((r) => r.teamId === team.id)! };
    })
    .sort((a, b) => (b.view.startDate ?? "").localeCompare(a.view.startDate ?? ""));

  const recentMatches = tournaments
    .flatMap(({ view }) =>
      view.rounds.flatMap((r) =>
        r.matches
          .filter((m) => m.match.teamAId === team.id || m.match.teamBId === team.id)
          .map((m) => ({ ...m, round: r.round, tournament: view.tournament })),
      ),
    )
    .filter((m) => m.results.length > 0)
    .sort((a, b) => b.round.playDate.localeCompare(a.round.playDate))
    .slice(0, 8);

  return { team, historical, tournaments, recentMatches, teamById: teamMap(snap) };
}

export function getRecentPhotos(snap: Snapshot, limit = 8) {
  return [...snap.photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}
