"use server";

import { requireAdmin } from "@/lib/auth";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import { removeFiles } from "@/lib/admin/storage";
import { uniqueSlug } from "@/lib/slug";
import { firstError, teamSchema } from "@/lib/validation";

const avatarPathOk = (id: string, path: string) => path.startsWith(`teams/${id}/`) && path.endsWith(".webp");

export async function createTeam(input: { name: string }): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));

  const { data: existing, error: listError } = await supabase.from("teams").select("slug, name");
  if (listError) return fail(dbMessage(listError));
  if (existing.some((t) => t.name.trim().toLowerCase() === parsed.data.name.toLowerCase())) {
    return fail("Ya existe un equipo con ese nombre");
  }
  const slug = uniqueSlug(parsed.data.name, existing.map((t) => t.slug));

  const { data, error } = await supabase.from("teams").insert({ name: parsed.data.name, slug }).select("id").single();
  if (error) return fail(error.code === "23505" ? "Ya existe un equipo con ese nombre" : dbMessage(error));
  refreshPublicData();
  return ok({ id: data.id });
}

/** Renombra el equipo. El slug NO cambia para no romper links compartidos. */
export async function renameTeam(id: string, input: { name: string }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { error } = await supabase.from("teams").update({ name: parsed.data.name }).eq("id", id);
  if (error) return fail(error.code === "23505" ? "Ya existe un equipo con ese nombre" : dbMessage(error));
  refreshPublicData();
  return ok();
}

/** Guarda (o quita, con null) el avatar ya subido a Storage y borra el anterior. */
export async function setTeamAvatar(id: string, path: string | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (path && !avatarPathOk(id, path)) return fail("Ruta de imagen inválida");
  const { data: team, error: readError } = await supabase.from("teams").select("avatar_path").eq("id", id).single();
  if (readError) return fail(dbMessage(readError));
  const { error } = await supabase.from("teams").update({ avatar_path: path }).eq("id", id);
  if (error) return fail(dbMessage(error));
  if (team.avatar_path && team.avatar_path !== path) await removeFiles(supabase, "avatars", [team.avatar_path]);
  refreshPublicData();
  return ok();
}

export async function setTeamArchived(id: string, archived: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("teams")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

/** Borrado definitivo: solo si nunca participó de un torneo. */
export async function deleteTeam(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { count, error: countError } = await supabase
    .from("tournament_teams")
    .select("team_id", { count: "exact", head: true })
    .eq("team_id", id);
  if (countError) return fail(dbMessage(countError));
  if ((count ?? 0) > 0) return fail("El equipo tiene historial en torneos: archivalo en lugar de borrarlo");

  const { data: team } = await supabase.from("teams").select("avatar_path").eq("id", id).single();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return fail(dbMessage(error, "No se pudo borrar el equipo"));
  await removeFiles(supabase, "avatars", [team?.avatar_path]);
  refreshPublicData();
  return ok();
}
