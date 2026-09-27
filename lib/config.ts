export const SITE_NAME = "Los Cedros Footgolf";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const TIMEZONE = "America/Argentina/Buenos_Aires";

export const STORAGE_BUCKETS = {
  avatars: "team-avatars",
  media: "tournament-media",
} as const;

/** Sin variables de Supabase el sitio funciona con datos de demostración. */
export const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
