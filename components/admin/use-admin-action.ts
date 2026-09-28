"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/result";

export type RunAction = <T>(fn: () => Promise<ActionResult<T>>, success?: string) => Promise<T | undefined>;

/**
 * Ejecuta una server action dentro de una transición: `pending` queda en true
 * desde el primer toque hasta que termina el `router.refresh()` y la pantalla
 * ya muestra los datos nuevos (así los botones no se "descongelan" antes).
 */
export function useAdminAction(): [RunAction, boolean] {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run: RunAction = (fn, success) =>
    new Promise((resolve) => {
      startTransition(async () => {
        try {
          const res = await fn();
          if (!res.ok) {
            toast.error(res.error);
            return resolve(undefined);
          }
          if (success) toast.success(success, { duration: 1500 });
          // Después de un await hay que volver a marcar la actualización como transición.
          startTransition(() => router.refresh());
          resolve(res.data);
        } catch (e) {
          toast.error((e as Error).message || "Algo salió mal");
          resolve(undefined);
        }
      });
    });
  return [run, pending];
}
