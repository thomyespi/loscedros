"use server";

import { requireAdmin } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { STORAGE_BUCKETS } from "@/lib/config";

const FOLDER = /^(teams|tournaments)\/[\w-]+$/;
const MAX_BYTES = 1.9 * 1024 * 1024;

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Sube una imagen WebP ya procesada en el navegador al bucket, con la sesión del admin.
 * Pasa por el servidor para que el navegador no necesite las credenciales de Supabase.
 */
export async function uploadImageAction(form: FormData): Promise<ActionResult<{ path: string }>> {
  const { supabase } = await requireAdmin();
  const bucket = form.get("bucket");
  const folder = form.get("folder");
  const file = form.get("file");

  if (bucket !== "avatars" && bucket !== "media") return fail("Destino inválido");
  if (typeof folder !== "string" || !FOLDER.test(folder)) return fail("Destino inválido");
  if (!(file instanceof Blob) || file.type !== "image/webp") return fail("La imagen no tiene el formato esperado");
  if (file.size > MAX_BYTES) return fail("La imagen es demasiado pesada");

  const path = `${folder}/${Date.now()}-${randomId()}.webp`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(path, file, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) return fail("No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.");
  return ok({ path });
}
