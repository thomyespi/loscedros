"use server";

import { requireAdmin } from "@/lib/auth";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import type { Modality } from "@/lib/domain/types";
import { firstError, matchSchema, resultSchema } from "@/lib/validation";

export async function createMatch(input: { roundId: string; teamAId: string; teamBId: string }): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = matchSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { roundId, teamAId, teamBId } = parsed.data;
  const { data, error } = await supabase
    .from("matches")
    .insert({ round_id: roundId, team_a_id: teamAId, team_b_id: teamBId })
    .select("id")
    .single();
  if (error) return fail(dbMessage(error, "No se pudo crear el cruce"));
  refreshPublicData();
  return ok({ id: data.id });
}

export async function deleteMatch(matchId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return fail(dbMessage(error, "No se pudo borrar el cruce"));
  refreshPublicData();
  return ok();
}

/**
 * Guarda el ganador de una modalidad (upsert idempotente). Con winnerTeamId null, borra el resultado.
 */
export async function setResult(input: {
  matchId: string;
  modality: Modality;
  winnerTeamId: string | null;
  scoreNote?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = resultSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { matchId, modality, winnerTeamId, scoreNote } = parsed.data;

  const { error } = winnerTeamId
    ? await supabase
        .from("match_results")
        .upsert({ match_id: matchId, modality, winner_team_id: winnerTeamId, score_note: scoreNote }, { onConflict: "match_id,modality" })
    : await supabase.from("match_results").delete().eq("match_id", matchId).eq("modality", modality);
  if (error) return fail(dbMessage(error, "No se pudo guardar el resultado"));
  refreshPublicData();
  return ok();
}
