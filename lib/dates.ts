import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";
import { TIMEZONE } from "@/lib/config";

/** Día de hoy en Buenos Aires, formato YYYY-MM-DD. */
export function todayISO(now: Date = new Date()) {
  return format(new TZDate(now, TIMEZONE), "yyyy-MM-dd");
}

// Las fechas de juego son días de calendario (sin hora): se formatean tal cual, sin conversión de zona.
const day = (iso: string) => parseISO(iso);

/** "sáb 10 oct" */
export const formatShort = (iso: string) => format(day(iso), "EEE d MMM", { locale: es }).replace(/\./g, "");

/** "10 oct" */
export const formatDayMonth = (iso: string) => format(day(iso), "d MMM", { locale: es }).replace(/\./g, "");

/** "sábado 10 de octubre" */
export const formatLong = (iso: string) => format(day(iso), "EEEE d 'de' MMMM", { locale: es });

/** "sábado 10 de octubre de 2026" */
export const formatFull = (iso: string) => format(day(iso), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

/** "10/10/2026" */
export const formatNumeric = (iso: string) => format(day(iso), "dd/MM/yyyy");

/** Rango compacto: "14 mar – 23 may 2026" o "5 – 19 dic 2026". */
export function formatRange(from: string | undefined, to: string | undefined) {
  if (!from || !to) return null;
  const a = day(from);
  const b = day(to);
  if (from === to) return format(a, "d MMM yyyy", { locale: es }).replace(/\./g, "");
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();
  const left = format(a, sameMonth ? "d" : sameYear ? "d MMM" : "d MMM yyyy", { locale: es });
  const right = format(b, "d MMM yyyy", { locale: es });
  return `${left} – ${right}`.replace(/\./g, "");
}

/** Días desde hoy hasta la fecha (negativo si ya pasó). */
export function daysUntil(iso: string, today = todayISO()) {
  return Math.round((day(iso).getTime() - day(today).getTime()) / 86_400_000);
}

export function relativeDay(iso: string, today = todayISO()) {
  const d = daysUntil(iso, today);
  if (d === 0) return "¡Hoy!";
  if (d === 1) return "Mañana";
  if (d > 1 && d < 7) return `En ${d} días`;
  return null;
}
