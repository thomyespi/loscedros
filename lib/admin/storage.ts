import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKETS } from "@/lib/config";
import type { Database } from "@/lib/supabase/database.types";

/** Borra archivos de Storage sin frenar la operación si alguno ya no existe. */
export async function removeFiles(
  supabase: SupabaseClient<Database>,
  bucket: keyof typeof STORAGE_BUCKETS,
  paths: (string | null | undefined)[],
) {
  const clean = paths.filter((p): p is string => !!p && !p.startsWith("/") && !p.startsWith("http"));
  if (clean.length === 0) return;
  for (let i = 0; i < clean.length; i += 100) {
    await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove(clean.slice(i, i + 100));
  }
}
