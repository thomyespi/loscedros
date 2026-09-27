import { NextResponse, type NextRequest } from "next/server";
import { IS_DEMO } from "@/lib/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Ping semanal (Vercel Cron) para que el plan gratuito de Supabase no pause el proyecto
 * por inactividad. Vercel envía `Authorization: Bearer <CRON_SECRET>` automáticamente.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, demo: true });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const { error } = await db.from("site_settings").select("id").limit(1);
  return NextResponse.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
