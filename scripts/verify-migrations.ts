/* eslint-disable @typescript-eslint/no-unused-expressions -- los ternarios ok()/fail() son intencionales */
/**
 * Verifica las migraciones y el seed contra Postgres (PGlite, en memoria) sin Docker.
 * Simula lo mínimo de Supabase (schemas auth/storage, roles anon/authenticated, auth.uid()).
 * Uso: npm run db:verify
 */
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ADMIN = "11111111-1111-4111-8111-111111111111";
const INTRUSO = "22222222-2222-4222-8222-222222222222";

const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create schema storage;
create table storage.buckets (
  id text primary key, name text not null, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text, owner uuid
);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant all on storage.objects to anon, authenticated;
`;

let failures = 0;
const ok = (msg: string) => console.log(`  ✔ ${msg}`);
const fail = (msg: string, err?: unknown) => {
  failures++;
  console.log(`  ✘ ${msg}${err ? ` → ${(err as Error).message}` : ""}`);
};

async function main() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);

  const dir = join(process.cwd(), "supabase", "migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(dir, file), "utf8"));
    ok(`migración ${file}`);
  }
  await db.exec(`
    grant usage on schema public to anon, authenticated;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated;
    insert into auth.users (id) values ('${ADMIN}'), ('${INTRUSO}');
    insert into public.admins (user_id) values ('${ADMIN}');
  `);

  await db.exec(readFileSync(join(process.cwd(), "supabase", "seed.sql"), "utf8"));
  ok("seed.sql aplicado");

  const count = async (sql: string) => Number((await db.query<{ n: number }>(sql)).rows[0].n);

  /** Ejecuta como un rol de la API y vuelve a superusuario. */
  async function as<T>(role: "anon" | "admin" | "intruso", fn: () => Promise<T>): Promise<T> {
    const sub = role === "admin" ? ADMIN : role === "intruso" ? INTRUSO : "";
    await db.exec(`set request.jwt.claim.sub = '${sub}'; set role ${role === "anon" ? "anon" : "authenticated"};`);
    try {
      return await fn();
    } finally {
      await db.exec("reset role; reset request.jwt.claim.sub;");
    }
  }

  async function expectError(label: string, sql: string, role?: "anon" | "admin" | "intruso", message?: string) {
    try {
      if (role) await as(role, () => db.exec(sql));
      else await db.exec(sql);
      fail(`${label} (no falló)`);
    } catch (e) {
      if (message && !(e as Error).message.includes(message)) fail(`${label} (mensaje inesperado)`, e);
      else ok(label);
    }
  }

  async function expectOk(label: string, sql: string, role?: "anon" | "admin" | "intruso") {
    try {
      if (role) await as(role, () => db.exec(sql));
      else await db.exec(sql);
      ok(label);
    } catch (e) {
      fail(label, e);
    }
  }

  console.log("\nRLS");
  const anonTournaments = await as("anon", () => count("select count(*)::int n from public.tournaments"));
  anonTournaments === 3 ? ok("anon ve 3 torneos (sin el borrador)") : fail(`anon ve ${anonTournaments} torneos`);
  const anonDraftRounds = await as("anon", () =>
    count("select count(*)::int n from public.rounds r where r.tournament_id = '00000000-0000-4000-8000-b00000000004'"),
  );
  anonDraftRounds === 0 ? ok("anon no ve fechas del borrador") : fail("anon ve fechas del borrador");
  const adminTournaments = await as("admin", () => count("select count(*)::int n from public.tournaments"));
  adminTournaments === 4 ? ok("admin ve los 4 torneos") : fail(`admin ve ${adminTournaments}`);
  const anonSummary = await as("anon", () => count("select count(*)::int n from public.v_match_summary"));
  anonSummary > 0 ? ok(`v_match_summary visible para anon (${anonSummary} cruces)`) : fail("v_match_summary vacía");
  const isAdmin = await as("admin", async () => (await db.query<{ v: boolean }>("select public.is_admin() v")).rows[0].v);
  isAdmin ? ok("is_admin() verdadero para el admin") : fail("is_admin() falso para el admin");

  await expectError("anon no puede insertar equipos", "insert into public.teams (name, slug) values ('Hack', 'hack')", "anon");
  await expectError(
    "usuario autenticado no-admin no puede insertar equipos",
    "insert into public.teams (name, slug) values ('Hack', 'hack')",
    "intruso",
  );
  const changed = await as("anon", async () =>
    (await db.query("update public.site_settings set whatsapp = '5491100000000' where id = 1 returning id")).rows.length,
  ).catch(() => 0);
  changed === 0 ? ok("anon: update de settings no afecta filas") : fail("anon modificó settings");
  const mapChanged = await as("anon", async () =>
    (await db.query("update public.site_settings set course_map_path = 'club/x.webp' where id = 1 returning id")).rows.length,
  ).catch(() => 0);
  mapChanged === 0 ? ok("anon: no puede cambiar el mapa de la cancha") : fail("anon modificó el mapa");
  await expectOk("admin puede insertar equipos", "insert into public.teams (name, slug) values ('Equipo Test', 'equipo-test')", "admin");
  await expectOk(
    "admin puede subir archivos a storage",
    "insert into storage.objects (bucket_id, name) values ('team-avatars', 'x.webp')",
    "admin",
  );
  await expectError(
    "anon no puede subir archivos a storage",
    "insert into storage.objects (bucket_id, name) values ('team-avatars', 'y.webp')",
    "anon",
  );

  console.log("\nIntegridad");
  const T2 = "00000000-0000-4000-8000-b00000000002"; // Clausura (en curso)
  const R3 = "(select id from public.rounds where tournament_id = '" + T2 + "' and number = 3)";
  const R1 = "(select id from public.rounds where tournament_id = '" + T2 + "' and number = 1)";
  const team = (n: number) => `'00000000-0000-4000-8000-a${n.toString(16).padStart(11, "0")}'`;

  await expectError("nombre de equipo duplicado (sin mayúsculas)", "insert into public.teams (name, slug) values ('cedros fc', 'cedros-fc-2')");
  await expectOk("cruce válido en fecha 3", `insert into public.matches (round_id, team_a_id, team_b_id) values (${R3}, ${team(1)}, ${team(2)})`);
  await expectError(
    "equipo repetido en la misma fecha",
    `insert into public.matches (round_id, team_a_id, team_b_id) values (${R3}, ${team(1)}, ${team(3)})`,
  );
  await expectError("equipo contra sí mismo", `insert into public.matches (round_id, team_a_id, team_b_id) values (${R3}, ${team(4)}, ${team(4)})`);
  await expectError(
    "equipo no inscripto",
    `insert into public.matches (round_id, team_a_id, team_b_id) values (${R3}, ${team(4)}, ${team(9)})`,
  );
  await expectError(
    "ganador ajeno al cruce",
    `insert into public.match_results (match_id, modality, winner_team_id)
     select id, 'individual', ${team(5)} from public.matches where round_id = ${R3} limit 1`,
  );
  await expectOk(
    "resultado válido",
    `insert into public.match_results (match_id, modality, winner_team_id)
     select id, 'individual', team_a_id from public.matches where round_id = ${R3} limit 1`,
  );
  await expectError(
    "cambiar equipos de un cruce con resultados",
    `update public.matches set team_b_id = ${team(3)} where round_id = ${R3}`,
  );
  await expectError(
    "fechas fuera de orden",
    `update public.rounds set play_date = '2026-07-01' where tournament_id = '${T2}' and number = 2`,
  );
  await expectOk(
    "reordenar todas las fechas en un solo upsert",
    `update public.rounds set play_date = play_date + 7 where tournament_id = '${T2}'`,
  );
  await expectError("borrar fecha con cruces", `delete from public.rounds where id = ${R1}`);
  await expectError(
    "quitar equipo inscripto con cruces",
    `delete from public.tournament_teams where tournament_id = '${T2}' and team_id = ${team(1)}`,
  );
  await expectError(
    "inscribir equipo archivado",
    `insert into public.tournament_teams (tournament_id, team_id) values ('${T2}', ${team(9)})`,
  );
  await expectError(
    "campeón no inscripto",
    `update public.tournaments set champion_team_id = ${team(6)} where id = '00000000-0000-4000-8000-b00000000001'`,
  );

  console.log("\nEstados del torneo");
  const T3 = "00000000-0000-4000-8000-b00000000003"; // Copa Primavera (próximo, sin cruces)
  const T3R1 = "(select id from public.rounds where tournament_id = '" + T3 + "' and number = 1)";
  await expectError("arrancar sin cruces en la Fecha 1", `update public.tournaments set status = 'en_curso' where id = '${T3}'`, undefined, "Armá los cruces de la Fecha 1 para arrancar");
  await expectError("crear un torneo directamente en juego", "insert into public.tournaments (name, slug, status) values ('Nuevo', 'nuevo', 'en_curso')");
  await expectOk("cruce en la Fecha 1", `insert into public.matches (round_id, team_a_id, team_b_id) values (${T3R1}, ${team(1)}, ${team(2)})`);
  await expectOk("arrancar con la Fecha 1 armada (Fecha 2 vacía)", `update public.tournaments set status = 'en_curso' where id = '${T3}'`);
  await expectOk("editar el torneo en juego sin cambiar estado", `update public.tournaments set description = 'x' where id = '${T3}'`);
  await expectError("finalizar con resultados pendientes en la Fecha 1", `update public.tournaments set status = 'finalizado' where id = '${T3}'`, undefined, "Faltan resultados en la Fecha 1 (1 cruce)");
  await expectOk(
    "cargar los 3 resultados de la Fecha 1",
    `insert into public.match_results (match_id, modality, winner_team_id)
     select m.id, x.modality::public.modality_type, m.team_a_id
     from public.matches m, (values ('individual'), ('four_ball'), ('foursome')) as x(modality)
     where m.round_id = ${T3R1}`,
  );
  await expectError("finalizar con una fecha sin cruces", `update public.tournaments set status = 'finalizado' where id = '${T3}'`, undefined, "La Fecha 2 no tiene cruces");
  await expectError("finalizar con resultados incompletos", `update public.tournaments set status = 'finalizado' where id = '${T2}'`, undefined, "Faltan resultados en la Fecha 2 (1 cruce)");
  await expectOk("volver a próximo", `update public.tournaments set status = 'proximo' where id = '${T3}'`);
  await expectOk("borrar el cruce estando en próximo", `delete from public.matches where round_id = ${T3R1}`);
  await expectOk(
    "reabrir torneo limpia el campeón",
    `update public.tournaments set status = 'en_curso' where id = '00000000-0000-4000-8000-b00000000001'`,
  );
  const champ = await count(
    "select count(*)::int n from public.tournaments where id = '00000000-0000-4000-8000-b00000000001' and champion_team_id is null and finished_at is null",
  );
  champ === 1 ? ok("campeón y finished_at en null al reabrir") : fail("no se limpió el campeón");
  await expectError("whatsapp inválido", "update public.site_settings set whatsapp = '11-abc' where id = 1");
  await expectError("mapa fuera de la carpeta club/", "update public.site_settings set course_map_path = 'tournaments/x.webp' where id = 1");
  await expectOk("borrar torneo con cascada completa", `delete from public.tournaments where id = '${T2}'`);
  const leftovers = await count(`select count(*)::int n from public.rounds where tournament_id = '${T2}'`);
  leftovers === 0 ? ok("cascada eliminó fechas, cruces y resultados") : fail("quedaron fechas huérfanas");

  console.log(failures ? `\n✘ ${failures} verificaciones fallaron` : "\n✔ Todas las verificaciones pasaron");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
