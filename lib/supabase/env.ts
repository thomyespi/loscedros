export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.example)");
  }
  return { url, anonKey };
}

/** Todas las lecturas públicas comparten este tag; cada cambio del admin lo invalida. */
export const PUBLIC_DATA_TAG = "public-data";
