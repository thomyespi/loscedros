/** "Los Pibes del Hoyo 9!" → "los-pibes-del-hoyo-9" */
export function slugify(input: string) {
  const slug = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "equipo";
}

/** Devuelve un slug que no esté en `taken`, agregando -2, -3… si hace falta. */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const set = new Set(taken);
  const root = slugify(base);
  if (!set.has(root)) return root;
  for (let i = 2; ; i++) {
    const candidate = `${root}-${i}`;
    if (!set.has(candidate)) return candidate;
  }
}
