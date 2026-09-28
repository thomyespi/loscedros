"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import { removeFiles } from "@/lib/admin/storage";
import { firstError, settingsSchema } from "@/lib/validation";

export async function saveSettings(input: { openingHours: string; whatsapp: string; instagram: string; address: string }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { openingHours, whatsapp, instagram, address } = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({ opening_hours: openingHours, whatsapp, instagram, address })
    .eq("id", 1);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}

const courseMapSchema = z.object({
  path: z.string().startsWith("club/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** Guarda el mapa recién subido y borra el archivo del mapa anterior. */
export async function setCourseMap(input: { path: string; width: number; height: number }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = courseMapSchema.safeParse(input);
  if (!parsed.success) return fail("Ruta de imagen inválida");
  const { path, width, height } = parsed.data;

  const { data: current } = await supabase.from("site_settings").select("course_map_path").eq("id", 1).maybeSingle();
  const { error } = await supabase
    .from("site_settings")
    .update({ course_map_path: path, course_map_width: width, course_map_height: height })
    .eq("id", 1);
  if (error) {
    await removeFiles(supabase, "media", [path]);
    return fail(dbMessage(error, "No se pudo guardar el mapa"));
  }
  if (current?.course_map_path && current.course_map_path !== path) await removeFiles(supabase, "media", [current.course_map_path]);
  refreshPublicData();
  return ok();
}

export async function removeCourseMap(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data: current } = await supabase.from("site_settings").select("course_map_path").eq("id", 1).maybeSingle();
  const { error } = await supabase
    .from("site_settings")
    .update({ course_map_path: null, course_map_width: null, course_map_height: null })
    .eq("id", 1);
  if (error) return fail(dbMessage(error, "No se pudo quitar el mapa"));
  await removeFiles(supabase, "media", [current?.course_map_path]);
  refreshPublicData();
  return ok();
}
