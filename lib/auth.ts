import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { IS_DEMO } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const LOGIN_PATH = `${ADMIN_BASE_PATH}/ingresar`;
export const LOGOUT_PATH = `${ADMIN_BASE_PATH}/salir`;

/**
 * Exige un admin logueado. Se usa en el layout del panel y en CADA server action
 * (el proxy no alcanza como única barrera).
 */
export const requireAdmin = cache(async () => {
  if (IS_DEMO) redirect(LOGIN_PATH);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) redirect(`${LOGOUT_PATH}?motivo=sin-permiso`);

  return { supabase, user };
});
