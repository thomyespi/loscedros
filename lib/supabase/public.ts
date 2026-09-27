import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { PUBLIC_DATA_TAG, supabaseEnv } from "./env";

/**
 * Cliente anónimo para las páginas públicas. Sus lecturas quedan en la Data Cache
 * de Next con el tag PUBLIC_DATA_TAG; el admin lo invalida con updateTag al guardar.
 */
export function createPublicClient() {
  const { url, anonKey } = supabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, cache: "force-cache", next: { tags: [PUBLIC_DATA_TAG], revalidate: 3600 } }),
    },
  });
}
