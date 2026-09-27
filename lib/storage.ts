import { STORAGE_BUCKETS } from "@/lib/config";

type Bucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/** URL pública de un archivo de Storage (los buckets son de lectura pública). */
export function publicStorageUrl(bucket: Bucket, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

export const avatarUrl = (path: string | null | undefined) => publicStorageUrl(STORAGE_BUCKETS.avatars, path);
export const mediaUrl = (path: string | null | undefined) => publicStorageUrl(STORAGE_BUCKETS.media, path);
