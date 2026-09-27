import Link from "next/link";
import { cn } from "@/lib/utils";

export type TournamentTab = "tabla" | "fechas" | "fotos";

/** Pestañas como links: la pestaña activa queda en la URL (?tab=) y se puede compartir. */
export function TabsNav({ slug, active, showPhotos, photoCount }: { slug: string; active: TournamentTab; showPhotos: boolean; photoCount: number }) {
  const tabs: { id: TournamentTab; label: string }[] = [
    { id: "tabla", label: "Tabla" },
    { id: "fechas", label: "Fechas" },
    ...(showPhotos ? [{ id: "fotos" as const, label: `Fotos (${photoCount})` }] : []),
  ];
  return (
    <nav aria-label="Secciones del torneo" className="glass sticky top-[60px] z-30 -mx-4 border-b border-white/8 px-4 sm:mx-0 sm:rounded-full sm:border sm:px-1.5">
      <ul className="flex gap-1 py-1.5">
        {tabs.map((t) => (
          <li key={t.id} className="flex-1 sm:flex-none">
            <Link
              href={`/torneos/${slug}?tab=${t.id}`}
              scroll={false}
              replace
              aria-current={active === t.id ? "page" : undefined}
              className={cn(
                "flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors",
                active === t.id ? "bg-grass text-night" : "text-mist hover:bg-white/5 hover:text-chalk",
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
