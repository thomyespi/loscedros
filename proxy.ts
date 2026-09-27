import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { IS_DEMO } from "@/lib/config";

const LOGIN_PATH = `${ADMIN_BASE_PATH}/ingresar`;
const LOGOUT_PATH = `${ADMIN_BASE_PATH}/salir`;

/**
 * Protege el panel: refresca la sesión de Supabase y manda al login a quien no la tenga.
 * (La verificación de que el usuario es admin se hace en el servidor con requireAdmin.)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicAdminPath = pathname === LOGIN_PATH || pathname === LOGOUT_PATH;

  if (IS_DEMO) {
    return isPublicAdminPath ? NextResponse.next() : NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicAdminPath) {
    const url = new URL(LOGIN_PATH, request.url);
    if (pathname !== ADMIN_BASE_PATH) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (user && pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL(ADMIN_BASE_PATH, request.url));
  }
  return response;
}

// Debe ser un valor literal (Next lo analiza en build). Si cambiás ADMIN_BASE_PATH, cambialo acá también.
export const config = {
  matcher: ["/vestuario", "/vestuario/:path*"],
};
