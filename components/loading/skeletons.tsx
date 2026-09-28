import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto de una pantalla del panel: mismo marco que `AdminPage` + tarjetas. */
export function AdminPageSkeleton({ label, cards = 3, rows = 3 }: { label: string; cards?: number; rows?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:py-8" aria-busy="true" aria-label={label}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 bg-white/[0.06]" />
        <Skeleton className="h-10 w-2/3 bg-white/10 sm:h-12" />
        <Skeleton className="h-4 w-40 bg-white/[0.06]" />
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-pitch p-4 sm:p-5">
          <Skeleton className="h-4 w-28 bg-white/10" />
          {Array.from({ length: rows }).map((_, j) => (
            <Skeleton key={j} className="h-12 w-full bg-white/[0.06]" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Esqueleto de una lista del panel (equipos, torneos). */
export function AdminListSkeleton({ label, items = 6 }: { label: string; items?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:py-8" aria-busy="true" aria-label={label}>
      <Skeleton className="h-10 w-1/2 bg-white/10 sm:h-12" />
      <Skeleton className="h-12 w-full rounded-xl bg-white/[0.06]" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}

/** Esqueleto de una página pública con encabezado grande (torneo, equipo, listados). */
export function PublicPageSkeleton({ label, items = 6, avatar = false }: { label: string; items?: number; avatar?: boolean }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <div className="border-b border-white/8 bg-pitch-2/40 pt-24 pb-10 sm:pt-32">
        <div className="container-page flex flex-col gap-4">
          <Skeleton className="h-4 w-24 bg-white/[0.06]" />
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {avatar && <Skeleton className="size-24 shrink-0 rounded-full bg-white/10" />}
            <div className="flex w-full flex-col items-center gap-3 sm:items-start">
              <Skeleton className="h-12 w-2/3 bg-white/10 sm:h-16" />
              <Skeleton className="h-4 w-1/3 bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-page flex flex-col gap-3 py-10">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
