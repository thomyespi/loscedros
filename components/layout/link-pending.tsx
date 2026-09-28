"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/**
 * Indicador de carga para el `<Link>` que lo contiene (debe ser descendiente de un Link).
 * Siempre está renderizado y solo cambia de opacidad, para no mover el layout.
 */
export function LinkPendingBar({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-0.5 w-8 rounded-full bg-grass opacity-0 transition-opacity",
        pending && "animate-pulse opacity-100",
        className,
      )}
    />
  );
}

export function LinkPendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return <Loader2 aria-hidden className={cn("size-4 shrink-0 animate-spin text-grass opacity-0 transition-opacity", pending && "opacity-100", className)} />;
}
