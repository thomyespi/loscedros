export const SITE_NAME = "Los Cedros Footgolf";
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const TIMEZONE = "America/Argentina/Buenos_Aires";

export const STORAGE_BUCKETS = {
  avatars: "team-avatars",
  media: "tournament-media",
} as const;

/** Prefijo same-origin con el que se sirven los archivos públicos de Storage. */
export const STORAGE_PATH = "/storage";

/** Sin variables de Supabase el sitio funciona con datos de demostración. */
export const IS_DEMO = !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY;
