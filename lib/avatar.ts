const STOP_WORDS = new Set(["de", "del", "la", "las", "los", "el", "y", "fc", "the"]);

/** "Los Pibes del Hoyo 9" → "PH" ; "Cedros FC" → "CE" */
export function initials(name: string) {
  const words = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const significant = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  const pool = significant.length ? significant : words;
  if (pool.length === 1) return pool[0].slice(0, 2).toUpperCase();
  return (pool[0][0] + pool[1][0]).toUpperCase();
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Colores de fondo para los avatares generados (todos con buen contraste con texto blanco). */
const PALETTE: [string, string][] = [
  ["#1f7a4d", "#0e3b26"],
  ["#2f6db5", "#15335a"],
  ["#b5532f", "#5a2715"],
  ["#7a3fb0", "#3b1d57"],
  ["#b08a1f", "#57430d"],
  ["#1f8a8a", "#0d4545"],
  ["#b0304f", "#571726"],
  ["#4f7a1f", "#263b0e"],
  ["#5a5fc0", "#2a2d5e"],
  ["#c0671f", "#5e320d"],
];

/** Mismo nombre → siempre el mismo gradiente. */
export function avatarGradient(name: string) {
  const [from, to] = PALETTE[hash(name.toLowerCase().trim()) % PALETTE.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
