import { STORAGE_BUCKETS, STORAGE_PATH } from "@/lib/config";

type Bucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * URL de un archivo de Storage (los buckets son de lectura pública). Se sirve desde el propio
 * dominio (`/storage/...`, ver el rewrite en next.config.ts) para que el navegador no necesite
 * conocer la URL de Supabase.
 */
export function publicStorageUrl(bucket: Bucket, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${STORAGE_PATH}/${bucket}/${path}`;
}

export const avatarUrl = (path: string | null | undefined) => publicStorageUrl(STORAGE_BUCKETS.avatars, path);
export const mediaUrl = (path: string | null | undefined) => publicStorageUrl(STORAGE_BUCKETS.media, path);
