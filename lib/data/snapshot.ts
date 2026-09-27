import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { IS_DEMO } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";
import type { Snapshot } from "@/lib/domain/types";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";
import { teamIdsByTournament, toMatch, toPhoto, toResult, toRound, toSettings, toTeam, toTournament } from "./mappers";

const PAGE = 1000;

/** PostgREST devuelve como máximo 1000 filas por pedido: paginamos. */
async function fetchAll<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) return out;
  }
}

/** Carga todo lo que el cliente dado puede ver según el RLS (el público no ve borradores; el admin sí). */
export async function loadSnapshot(db: SupabaseClient<Database>): Promise<Snapshot> {
  const [settings, teams, tournaments, enrolled, rounds, matches, results, photos] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    fetchAll((a, b) => db.from("teams").select("*").order("name").range(a, b)),
    fetchAll((a, b) => db.from("tournaments").select("*").order("created_at").range(a, b)),
    fetchAll((a, b) => db.from("tournament_teams").select("tournament_id, team_id").order("tournament_id").order("team_id").range(a, b)),
    fetchAll((a, b) => db.from("rounds").select("*").order("tournament_id").order("number").range(a, b)),
    fetchAll((a, b) => db.from("matches").select("*").order("created_at").order("id").range(a, b)),
    fetchAll((a, b) => db.from("match_results").select("*").order("match_id").order("modality").range(a, b)),
    fetchAll((a, b) => db.from("tournament_photos").select("*").order("sort_order").order("created_at").range(a, b)),
  ]);
  if (settings.error) throw new Error(settings.error.message);

  const byTournament = teamIdsByTournament(enrolled);
  return {
    settings: settings.data ? toSettings(settings.data) : DEFAULT_SETTINGS,
    teams: teams.map(toTeam),
    tournaments: tournaments.map((t) => toTournament(t, byTournament.get(t.id) ?? [])),
    rounds: rounds.map(toRound),
    matches: matches.map(toMatch),
    results: results.map(toResult),
    photos: photos.map(toPhoto),
  };
}

/**
 * Todos los datos públicos del sitio. El RLS ya excluye los borradores.
 * Se deduplica por request (React cache) y se cachea entre requests (Data Cache con tag).
 */
export const getSnapshot = cache(async (): Promise<Snapshot> => {
  if (IS_DEMO) return getDemoSnapshot();
  return loadSnapshot(createPublicClient());
});

export const getSettings = async () => (await getSnapshot()).settings;
