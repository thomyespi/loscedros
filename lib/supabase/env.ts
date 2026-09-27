export function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan SUPABASE_URL / SUPABASE_ANON_KEY (ver .env.example)");
  }
  return { url, anonKey };
}

/** Todas las lecturas públicas comparten este tag; cada cambio del admin lo invalida. */
export const PUBLIC_DATA_TAG = "public-data";
