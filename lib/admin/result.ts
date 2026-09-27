export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export const ok = <T = undefined>(data?: T): ActionResult<T> => ({ ok: true, data: data as T });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

/** Traduce errores de Postgres/PostgREST a mensajes para el admin. */
export function dbMessage(error: { code?: string; message: string; details?: string | null }, fallback = "No se pudo guardar") {
  switch (error.code) {
    case "P0001": // raise exception de nuestros triggers (ya en español)
      return error.message;
    case "23505":
      return "Ya existe un registro con ese nombre";
    case "23503":
      return "No se puede: está en uso en torneos o resultados";
    case "23514":
      return "Algún dato no tiene el formato esperado";
    case "42501":
      return "No tenés permisos para hacer esto";
    default:
      return fallback;
  }
}
