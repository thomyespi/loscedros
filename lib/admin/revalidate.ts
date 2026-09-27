import "server-only";
import { updateTag } from "next/cache";
import { PUBLIC_DATA_TAG } from "@/lib/supabase/env";

/**
 * Invalida la caché pública después de cualquier cambio del admin: home, torneos,
 * ranking, equipos, sitemap y OG comparten el mismo tag, así nada queda desfasado.
 * (updateTag: la próxima visita espera datos frescos en lugar de servir los viejos.)
 */
export function refreshPublicData() {
  updateTag(PUBLIC_DATA_TAG);
}
