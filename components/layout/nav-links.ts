/** Links a secciones de la landing, en el mismo orden en que aparecen al hacer scroll. */
export const NAV_LINKS = [
  { href: "/", label: "Inicio", section: null },
  { href: "/#club", label: "El club", section: "club" },
  { href: "/#cancha", label: "La cancha", section: "cancha" },
  { href: "/#galeria", label: "Galería", section: "galeria" },
  { href: "/#como-llegar", label: "Cómo llegar", section: "como-llegar" },
  { href: "/#preguntas", label: "Preguntas", section: "preguntas" },
] as const;

export const COMPETITION_SECTION = "competencia";

export const COMPETITION_LINKS = [
  { href: "/torneos", label: "Torneos", description: "En curso, próximos y finalizados" },
  { href: "/ranking", label: "Ranking histórico", description: "Puntos de todos los torneos" },
] as const;

/** Páginas que cuentan como "Competencias" fuera de la home. */
export function isCompetitionPath(pathname: string) {
  return ["/torneos", "/ranking", "/equipos"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
