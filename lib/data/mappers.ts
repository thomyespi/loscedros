import type { Match, MatchResult, Photo, Round, SiteSettings, Team, Tournament } from "@/lib/domain/types";
import type { Database } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
type Row<T extends keyof Tables> = Tables[T]["Row"];

export const toTeam = (r: Row<"teams">): Team => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  avatarPath: r.avatar_path,
  archivedAt: r.archived_at,
  createdAt: r.created_at,
});

export const toTournament = (r: Row<"tournaments">, teamIds: string[]): Tournament => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  coverPath: r.cover_path,
  status: r.status,
  championTeamId: r.champion_team_id,
  finishedAt: r.finished_at,
  createdAt: r.created_at,
  teamIds,
});

export const toRound = (r: Row<"rounds">): Round => ({
  id: r.id,
  tournamentId: r.tournament_id,
  number: r.number,
  playDate: r.play_date,
});

export const toMatch = (r: Row<"matches">): Match => ({
  id: r.id,
  roundId: r.round_id,
  teamAId: r.team_a_id,
  teamBId: r.team_b_id,
  createdAt: r.created_at,
});

export const toResult = (r: Row<"match_results">): MatchResult => ({
  matchId: r.match_id,
  modality: r.modality,
  winnerTeamId: r.winner_team_id,
  scoreNote: r.score_note,
});

export const toPhoto = (r: Row<"tournament_photos">): Photo => ({
  id: r.id,
  tournamentId: r.tournament_id,
  roundId: r.round_id,
  path: r.path,
  caption: r.caption,
  width: r.width,
  height: r.height,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

export const toSettings = (r: Row<"site_settings">): SiteSettings => ({
  openingHours: r.opening_hours,
  whatsapp: r.whatsapp,
  instagram: r.instagram,
  address: r.address,
});

/** Agrupa tournament_teams por torneo. */
export function teamIdsByTournament(rows: { tournament_id: string; team_id: string }[]) {
  const map = new Map<string, string[]>();
  for (const r of rows) {
    const list = map.get(r.tournament_id);
    if (list) list.push(r.team_id);
    else map.set(r.tournament_id, [r.team_id]);
  }
  return map;
}
