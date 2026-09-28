"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { loadSnapshot } from "@/lib/data/snapshot";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import { removeFiles } from "@/lib/admin/storage";
import { tournamentReadiness } from "@/lib/domain/readiness";
import type { TournamentStatus } from "@/lib/domain/types";
import { computeStandings } from "@/lib/standings/compute";
import { uniqueSlug } from "@/lib/slug";
import { createTournamentSchema, firstError, roundDatesSchema, tournamentInfoSchema } from "@/lib/validation";

const uuid = z.string().uuid();

export async function createTournament(input: {
  name: string;
  description?: string;
  dates: string[];
  teamIds: string[];
}): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = createTournamentSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { name, description, dates, teamIds } = parsed.data;

  const { data: existing, error: listError } = await supabase.from("tournaments").select("slug, name");
  if (listError) return fail(dbMessage(listError));
  if (existing.some((t) => t.name.trim().toLowerCase() === name.toLowerCase())) return fail("Ya existe un torneo con ese nombre");

  const { data: t, error } = await supabase
    .from("tournaments")
    .insert({ name, description, slug: uniqueSlug(name, existing.map((x) => x.slug)) })
    .select("id")
    .single();
  if (error) return fail(dbMessage(error));

  // Sin transacciones entre requests: si algo falla, se deshace el alta.
  const rounds = await supabase.from("rounds").insert(dates.map((d, i) => ({ tournament_id: t.id, number: i + 1, play_date: d })));
  const enrolled = rounds.error
    ? rounds
    : await supabase.from("tournament_teams").insert([...new Set(teamIds)].map((team_id) => ({ tournament_id: t.id, team_id })));
  if (rounds.error || enrolled.error) {
    await supabase.from("tournaments").delete().eq("id", t.id);
    return fail(dbMessage((rounds.error ?? enrolled.error)!, "No se pudo crear el torneo"));
  }
  return ok({ id: t.id });
}

export async function updateTournamentInfo(id: string, input: { name: string; description?: string }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = tournamentInfoSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { error } = await supabase.from("tournaments").update(parsed.data).eq("id", id);
  if (error) return fail(error.code === "23505" ? "Ya existe un torneo con ese nombre" : dbMessage(error));
  refreshPublicData();
  return ok();
}

export async function setTournamentCover(id: string, path: string | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (path && !(path.startsWith(`tournaments/${id}/`) && path.endsWith(".webp"))) return fail("Ruta de imagen inválida");
  const { data: t, error: readError } = await supabase.from("tournaments").select("cover_path").eq("id", id).single();
  if (readError) return fail(dbMessage(readError));
  const { error } = await supabase.from("tournaments").update({ cover_path: path }).eq("id", id);
  if (error) return fail(dbMessage(error));
  // Si la portada anterior era una foto de la galería, no se borra el archivo.
  if (t.cover_path && t.cover_path !== path) {
    const { count } = await supabase.from("tournament_photos").select("id", { count: "exact", head: true }).eq("path", t.cover_path);
    if (!count) await removeFiles(supabase, "media", [t.cover_path]);
  }
  refreshPublicData();
  return ok();
}

export async function addTournamentTeams(id: string, teamIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!teamIds.length || !teamIds.every((t) => uuid.safeParse(t).success)) return fail("Elegí al menos un equipo");
  const { data: t } = await supabase.from("tournaments").select("status").eq("id", id).single();
  if (t?.status === "finalizado") return fail("El torneo está finalizado: reabrilo para sumar equipos");
  const { error } = await supabase
    .from("tournament_teams")
    .upsert(teamIds.map((team_id) => ({ tournament_id: id, team_id })), { onConflict: "tournament_id,team_id", ignoreDuplicates: true });
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

export async function removeTournamentTeam(id: string, teamId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: t } = await supabase.from("tournaments").select("status, champion_team_id").eq("id", id).single();
  if (t?.status === "finalizado") return fail("El torneo está finalizado: reabrilo para editar los equipos");
  const { count } = await supabase.from("tournament_teams").select("team_id", { count: "exact", head: true }).eq("tournament_id", id);
  if ((count ?? 0) <= 2) return fail("El torneo necesita al menos 2 equipos");
  const { error } = await supabase.from("tournament_teams").delete().eq("tournament_id", id).eq("team_id", teamId);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

/** Guarda los días de todas las fechas en un solo upsert (la base valida el orden al final). */
export async function saveRoundDates(id: string, rounds: { id: string; number: number; playDate: string }[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const sorted = [...rounds].sort((a, b) => a.number - b.number);
  const parsed = roundDatesSchema.safeParse(sorted.map((r) => r.playDate));
  if (!parsed.success) return fail(firstError(parsed.error));
  const { error } = await supabase
    .from("rounds")
    .upsert(sorted.map((r) => ({ id: r.id, tournament_id: id, number: r.number, play_date: r.playDate })), { onConflict: "id" });
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

export async function addRound(id: string, playDate: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playDate)) return fail("Elegí un día válido");
  const { data: last } = await supabase
    .from("rounds")
    .select("number, play_date")
    .eq("tournament_id", id)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && playDate < last.play_date) return fail("La nueva fecha tiene que ser igual o posterior a la última");
  const { error } = await supabase.from("rounds").insert({ tournament_id: id, number: (last?.number ?? 0) + 1, play_date: playDate });
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

export async function removeLastRound(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: rounds } = await supabase.from("rounds").select("id, number").eq("tournament_id", id).order("number", { ascending: false });
  if (!rounds || rounds.length <= 1) return fail("El torneo necesita al menos una fecha");
  const { error } = await supabase.from("rounds").delete().eq("id", rounds[0].id);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

/** Cambia el estado. Al finalizar, calcula y congela al campeón. Al reabrir, la base lo limpia. */
export async function changeTournamentStatus(id: string, status: TournamentStatus): Promise<ActionResult<{ champion?: string }>> {
  const { supabase } = await requireAdmin();
  if (!["borrador", "proximo", "en_curso", "finalizado"].includes(status)) return fail("Estado inválido");

  const snap = await loadSnapshot(supabase);
  const t = snap.tournaments.find((x) => x.id === id);
  if (!t) return fail("Torneo no encontrado");
  const rounds = snap.rounds.filter((r) => r.tournamentId === id);
  const roundIds = new Set(rounds.map((r) => r.id));
  const matches = snap.matches.filter((m) => roundIds.has(m.roundId));
  const matchIds = new Set(matches.map((m) => m.id));
  const results = snap.results.filter((r) => matchIds.has(r.matchId));
  const readiness = tournamentReadiness({ rounds, matches, results });

  // Mismas reglas que el trigger check_tournament(): arrancar exige cruces en la
  // Fecha 1 (reabrir un finalizado no se valida) y finalizar exige todo cargado.
  if (status === "en_curso" && (t.status === "borrador" || t.status === "proximo") && readiness.startIssue)
    return fail(readiness.startIssue.reason);
  if (status === "finalizado" && t.status !== "finalizado" && readiness.finishIssue) return fail(readiness.finishIssue.reason);

  if (status !== "finalizado") {
    const { error } = await supabase.from("tournaments").update({ status }).eq("id", id);
    if (error) return fail(dbMessage(error));
    refreshPublicData();
    return ok({});
  }

  const table = computeStandings({ teams: snap.teams.filter((x) => t.teamIds.includes(x.id)), matches, results });
  const champion = table[0].teamId;
  const { error } = await supabase.from("tournaments").update({ status, champion_team_id: champion }).eq("id", id);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok({ champion: snap.teams.find((x) => x.id === champion)?.name });
}

export async function deleteTournament(id: string, confirmName: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: t, error: readError } = await supabase.from("tournaments").select("name, cover_path").eq("id", id).single();
  if (readError) return fail(dbMessage(readError));
  if (t.name.trim() !== confirmName.trim()) return fail("El nombre no coincide");
  const { data: photos } = await supabase.from("tournament_photos").select("path").eq("tournament_id", id);
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) return fail(dbMessage(error, "No se pudo borrar el torneo"));
  await removeFiles(supabase, "media", [t.cover_path, ...(photos ?? []).map((p) => p.path)]);
  refreshPublicData();
  return ok();
}
