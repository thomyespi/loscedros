import { NextResponse, type NextRequest } from "next/server";
import { IS_DEMO } from "@/lib/config";
import { LOGIN_PATH } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest, to: URL) {
  if (!IS_DEMO) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(to, { status: 303 });
}

/** Botón "Salir" del panel: cierra la sesión y vuelve al sitio público. */
export async function POST(request: NextRequest) {
  return signOut(request, new URL("/", request.url));
}

/** Usuario autenticado que no es admin: se lo desloguea y vuelve al login. */
export async function GET(request: NextRequest) {
  const url = new URL(LOGIN_PATH, request.url);
  if (request.nextUrl.searchParams.get("motivo") === "sin-permiso") url.searchParams.set("error", "sin-permiso");
  return signOut(request, url);
}
