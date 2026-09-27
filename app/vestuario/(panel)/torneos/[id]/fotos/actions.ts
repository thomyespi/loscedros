"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import { removeFiles } from "@/lib/admin/storage";
import { firstError, photoMetaSchema } from "@/lib/validation";

const newPhotosSchema = z
  .array(
    z.object({
      path: z.string().min(1),
      width: z.number().int().positive().nullable(),
      height: z.number().int().positive().nullable(),
    }),
  )
  .min(1)
  .max(60);

export async function addPhotos(
  tournamentId: string,
  roundId: string | null,
  photos: { path: string; width: number | null; height: number | null }[],
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = newPhotosSchema.safeParse(photos);
  if (!parsed.success) return fail("No hay fotos para guardar");
  if (!parsed.data.every((p) => p.path.startsWith(`tournaments/${tournamentId}/`))) return fail("Ruta de imagen inválida");

  const { data: last } = await supabase
    .from("tournament_photos")
    .select("sort_order")
    .eq("tournament_id", tournamentId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const start = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("tournament_photos").insert(
    parsed.data.map((p, i) => ({ tournament_id: tournamentId, round_id: roundId, path: p.path, width: p.width, height: p.height, sort_order: start + i })),
  );
  if (error) {
    await removeFiles(supabase, "media", parsed.data.map((p) => p.path));
    return fail(dbMessage(error, "No se pudieron guardar las fotos"));
  }
  refreshPublicData();
  return ok();
}

export async function updatePhoto(id: string, input: { caption?: string | null; roundId?: string | null }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = photoMetaSchema.safeParse({ caption: input.caption });
  if (!parsed.success) return fail(firstError(parsed.error));
  const patch: { caption: string | null; round_id?: string | null } = { caption: parsed.data.caption };
  if (input.roundId !== undefined) patch.round_id = input.roundId;
  const { error } = await supabase.from("tournament_photos").update(patch).eq("id", id);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

/** Intercambia el orden con la foto vecina (arriba = -1, abajo = +1). */
export async function movePhoto(tournamentId: string, id: string, direction: -1 | 1): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: photos, error } = await supabase
    .from("tournament_photos")
    .select("id, sort_order")
    .eq("tournament_id", tournamentId)
    .order("sort_order")
    .order("created_at");
  if (error) return fail(dbMessage(error));
  const i = photos.findIndex((p) => p.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= photos.length) return ok();
  // Normalizamos el orden (0..n) e intercambiamos las dos posiciones.
  const order = photos.map((p) => p.id);
  [order[i], order[j]] = [order[j], order[i]];
  const results = await Promise.all(order.map((pid, idx) => supabase.from("tournament_photos").update({ sort_order: idx }).eq("id", pid)));
  const failed = results.find((r) => r.error);
  if (failed?.error) return fail(dbMessage(failed.error));
  refreshPublicData();
  return ok();
}

export async function deletePhoto(tournamentId: string, id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: photo, error: readError } = await supabase.from("tournament_photos").select("path").eq("id", id).single();
  if (readError) return fail(dbMessage(readError));
  const { data: t } = await supabase.from("tournaments").select("cover_path").eq("id", tournamentId).single();
  if (t?.cover_path === photo.path) await supabase.from("tournaments").update({ cover_path: null }).eq("id", tournamentId);
  const { error } = await supabase.from("tournament_photos").delete().eq("id", id);
  if (error) return fail(dbMessage(error));
  await removeFiles(supabase, "media", [photo.path]);
  refreshPublicData();
  return ok();
}

/** Usa una foto de la galería como portada (sin duplicar el archivo). */
export async function setPhotoAsCover(tournamentId: string, id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: photo, error: readError } = await supabase.from("tournament_photos").select("path").eq("id", id).single();
  if (readError) return fail(dbMessage(readError));
  const { data: t } = await supabase.from("tournaments").select("cover_path").eq("id", tournamentId).single();
  const { error } = await supabase.from("tournaments").update({ cover_path: photo.path }).eq("id", tournamentId);
  if (error) return fail(dbMessage(error));
  // La portada anterior se borra solo si era un archivo propio (no una foto de la galería).
  if (t?.cover_path && t.cover_path !== photo.path) {
    const { count } = await supabase.from("tournament_photos").select("id", { count: "exact", head: true }).eq("path", t.cover_path);
    if (!count) await removeFiles(supabase, "media", [t.cover_path]);
  }
  refreshPublicData();
  return ok();
}
