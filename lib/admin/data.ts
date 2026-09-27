import "server-only";
import { cache } from "react";
import { requireAdmin } from "@/lib/auth";
import { loadSnapshot } from "@/lib/data/snapshot";

/** Todo, incluidos borradores, siempre fresco (sin caché). Solo para el panel. */
export const getAdminSnapshot = cache(async () => {
  const { supabase } = await requireAdmin();
  return loadSnapshot(supabase);
});
