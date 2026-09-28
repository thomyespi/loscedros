import type { ReactNode } from "react";
import { Eyebrow } from "@/components/section-heading";

/** Encabezado de páginas internas (debajo del header fijo). */
export function PageHeader({
  eyebrow,
  title,
  description,
  top,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Se muestra arriba de todo (p. ej. el selector Torneos/Ranking en mobile). */
  top?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mowed grain relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-pitch-2 to-night pt-28 pb-10 sm:pt-36 sm:pb-14">
      <div aria-hidden className="pointer-events-none absolute -top-20 right-0 size-80 rounded-full bg-grass/10 blur-3xl" />
      <div className="container-page relative flex flex-col gap-4">
        {top}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-display text-6xl text-balance text-chalk sm:text-8xl">{title}</h1>
        {description && <p className="max-w-2xl text-lg text-pretty text-mist">{description}</p>}
        {children}
      </div>
    </header>
  );
}
