/**
 * Horario del club: días abiertos + un único rango horario.
 * Todo texto de horario del sitio sale de acá (nunca escribirlo a mano en componentes o en content/).
 */

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OpeningHours {
  days: Weekday[];
  /** "HH:MM" */
  opens: string;
  /** "HH:MM" */
  closes: string;
}

export const WEEKDAYS: { day: Weekday; name: string; short: string; schema: string }[] = [
  { day: 1, name: "lunes", short: "Lun", schema: "Monday" },
  { day: 2, name: "martes", short: "Mar", schema: "Tuesday" },
  { day: 3, name: "miércoles", short: "Mié", schema: "Wednesday" },
  { day: 4, name: "jueves", short: "Jue", schema: "Thursday" },
  { day: 5, name: "viernes", short: "Vie", schema: "Friday" },
  { day: 6, name: "sábado", short: "Sáb", schema: "Saturday" },
  { day: 7, name: "domingo", short: "Dom", schema: "Sunday" },
];

const dayName = (d: Weekday) => WEEKDAYS[d - 1].name;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "sábado" → "sábados"; "lunes" queda igual. */
const plural = (s: string) => (s.endsWith("s") ? s : `${s}s`);

/** Horas que ofrece el panel: de 06:00 a 23:30, cada 30 minutos. */
export const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** Sin repetidos y en orden de lunes a domingo. */
export function normalizeDays(days: number[]): Weekday[] {
  return [...new Set(days)].filter((d): d is Weekday => Number.isInteger(d) && d >= 1 && d <= 7).sort((a, b) => a - b);
}

export const sameHours = (a: OpeningHours, b: OpeningHours) =>
  a.opens === b.opens && a.closes === b.closes && normalizeDays(a.days).join() === normalizeDays(b.days).join();

/**
 * Si los días forman un solo tramo seguido (contando que al domingo le sigue el lunes),
 * devuelve los días en el orden del tramo. Si no, null.
 */
function run(days: Weekday[]): Weekday[] | null {
  const set = new Set(days);
  const next = (d: Weekday) => ((d % 7) + 1) as Weekday;
  const prev = (d: Weekday) => (((d + 5) % 7) + 1) as Weekday;
  const starts = days.filter((d) => !set.has(prev(d)));
  if (starts.length !== 1) return null;
  const out: Weekday[] = [starts[0]];
  while (set.has(next(out[out.length - 1])) && out.length < days.length) out.push(next(out[out.length - 1]));
  return out;
}

const list = (names: string[]) => (names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`);

/** "Miércoles a domingo", "Todos los días", "Sábado y domingo", "Lunes, miércoles y viernes". */
export function formatDays(input: Weekday[]): string {
  const days = normalizeDays(input);
  if (days.length === 7) return "Todos los días";
  const r = run(days);
  if (r && r.length >= 3) return capitalize(`${dayName(r[0])} a ${dayName(r[r.length - 1])}`);
  return capitalize(list((r ?? days).map(dayName)));
}

/** "10:00" → "10"; "16:30" → "16:30"; "09:00" → "9". */
export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  return m === "00" ? String(Number(h)) : `${Number(h)}:${m}`;
}

/** "Miércoles a domingo, de 10 a 16:30 h" */
export const formatHours = (h: OpeningHours) => `${formatDays(h.days)}, de ${formatTime(h.opens)} a ${formatTime(h.closes)} h`;

/** "10–16:30 h" */
export const formatHoursShort = (h: OpeningHours) => `${formatTime(h.opens)}–${formatTime(h.closes)} h`;

/** "Abierto todos los días", "Abierto de miércoles a domingo", "Abierto los sábados y domingos". */
export function openDaysTitle(h: OpeningHours): string {
  const days = normalizeDays(h.days);
  if (days.length === 7) return "Abierto todos los días";
  const r = run(days);
  if (r && r.length >= 3) return `Abierto de ${dayName(r[0])} a ${dayName(r[r.length - 1])}`;
  return `Abierto los ${list((r ?? days).map((d) => plural(dayName(d))))}`;
}

/** OpeningHoursSpecification de schema.org para el JSON-LD. */
export function toOpeningHoursSpec(h: OpeningHours) {
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: normalizeDays(h.days).map((d) => `https://schema.org/${WEEKDAYS[d - 1].schema}`),
    opens: h.opens,
    closes: h.closes,
  };
}
