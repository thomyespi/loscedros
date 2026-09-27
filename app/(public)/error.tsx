"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <span className="font-display text-7xl text-cedar">¡Uy!</span>
      <h1 className="font-display text-4xl text-chalk">Algo salió mal</h1>
      <p className="max-w-sm text-mist">No pudimos cargar esta página. Probá de nuevo en unos segundos.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-grass px-6 font-semibold text-night"
        >
          <RotateCcw className="size-4" /> Reintentar
        </button>
        <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 font-semibold text-chalk">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
