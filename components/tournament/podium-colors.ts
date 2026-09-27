/** Colores de podio (oro, plata, bronce) por posición. */
export const PODIUM = {
  1: { text: "text-gold", bg: "bg-gold", ring: "ring-gold/60", soft: "bg-gold/10", border: "border-gold/40" },
  2: { text: "text-silver", bg: "bg-silver", ring: "ring-silver/50", soft: "bg-silver/10", border: "border-silver/30" },
  3: { text: "text-bronze", bg: "bg-bronze", ring: "ring-bronze/50", soft: "bg-bronze/10", border: "border-bronze/30" },
} as const;

export const podium = (position: number) => PODIUM[position as 1 | 2 | 3] ?? null;
