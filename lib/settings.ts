import type { SiteSettings } from "@/lib/domain/types";

/** Valores iniciales (los mismos que carga la migración). */
export const DEFAULT_SETTINGS: SiteSettings = {
  hours: { days: [3, 4, 5, 6, 7], opens: "10:00", closes: "16:30" },
  whatsapp: "5491139567637",
  instagram: "los_cedros_footgolf",
  address: "César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires",
  courseMap: null,
};

export const instagramUrl = (user: string) => `https://www.instagram.com/${user}/`;

export const mapsDirectionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

export const mapsEmbedUrl = (address: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

/** +54 9 11 3956-7637 */
export function formatPhone(whatsapp: string) {
  const m = whatsapp.match(/^54(9)?(11)(\d{4})(\d{4})$/);
  if (m) return `+54 ${m[1] ? "9 " : ""}${m[2]} ${m[3]}-${m[4]}`;
  return `+${whatsapp}`;
}
