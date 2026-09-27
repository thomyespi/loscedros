import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page flex flex-col gap-3 pt-32 pb-10" aria-busy="true" aria-label="Cargando ranking">
      <Skeleton className="mb-6 h-20 w-2/3 bg-white/10" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full bg-white/[0.06]" />
      ))}
    </div>
  );
}
