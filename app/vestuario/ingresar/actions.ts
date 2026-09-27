"use server";

import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { IS_DEMO } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

/** Inicia sesión en el servidor: la sesión queda en cookies y las credenciales de Supabase nunca llegan al navegador. */
export async function signIn(input: { email: string; password: string }): Promise<ActionResult> {
  if (IS_DEMO) return fail("El panel no está disponible en modo demo");
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password) return fail("Email o contraseña incorrectos");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Mensaje genérico: no revelamos si falló el email o la contraseña.
  if (error) return fail("Email o contraseña incorrectos");
  return ok();
}
