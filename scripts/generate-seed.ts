/**
 * Genera supabase/seed.sql a partir de lib/demo/data.ts.
 * Uso: npm run db:seed
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { demoData } from "../lib/demo/data";

const q = (v: string | number | null) =>
  v === null ? "null" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;

const rows = (values: (string | number | null)[][]) =>
  values.map((r) => `  (${r.map(q).join(", ")})`).join(",\n");

export function buildSeedSql() {
  const { teams, tournaments, rounds, matches, results } = demoData;
  const out: string[] = [
    "-- Datos de demostración para Los Cedros Footgolf.",
    "-- GENERADO por scripts/generate-seed.ts — no editar a mano.",
    "-- Para empezar con la base vacía, simplemente no ejecutes este archivo.",
    "",
    "begin;",
    "",
    "insert into public.teams (id, name, slug, avatar_path, archived_at, created_at) values",
    rows(teams.map((t) => [t.id, t.name, t.slug, t.avatarPath, null, t.createdAt])) + ";",
    "",
    "-- Los torneos en juego y finalizados se insertan como próximos y cambian de estado al final:",
    "-- para arrancar hacen falta cruces en la Fecha 1, y para finalizar todos los resultados.",
    "insert into public.tournaments (id, name, slug, description, status, created_at) values",
    rows(
      tournaments.map((t) => [
        t.id,
        t.name,
        t.slug,
        t.description,
        t.status === "borrador" ? "borrador" : "proximo",
        t.createdAt,
      ]),
    ) + ";",
    "",
    "insert into public.tournament_teams (tournament_id, team_id) values",
    rows(tournaments.flatMap((t) => t.teamIds.map((id) => [t.id, id]))) + ";",
    "",
    "insert into public.rounds (id, tournament_id, number, play_date) values",
    rows(rounds.map((r) => [r.id, r.tournamentId, r.number, r.playDate])) + ";",
    "",
    "insert into public.matches (id, round_id, team_a_id, team_b_id, created_at) values",
    rows(matches.map((m) => [m.id, m.roundId, m.teamAId, m.teamBId, m.createdAt])) + ";",
    "",
    "insert into public.match_results (match_id, modality, winner_team_id, score_note) values",
    rows(results.map((r) => [r.matchId, r.modality, r.winnerTeamId, r.scoreNote])) + ";",
    "",
  ];

  for (const t of tournaments.filter((t) => t.status === "en_curso")) {
    out.push(`update public.tournaments set status = 'en_curso' where id = ${q(t.id)};`);
  }
  for (const t of tournaments.filter((t) => t.status === "finalizado")) {
    out.push(
      `update public.tournaments set status = 'finalizado', champion_team_id = ${q(t.championTeamId)}, finished_at = ${q(t.finishedAt)} where id = ${q(t.id)};`,
    );
  }
  // Los equipos archivados se archivan después de inscribirlos (no se puede inscribir un archivado).
  for (const t of teams.filter((t) => t.archivedAt)) {
    out.push(`update public.teams set archived_at = ${q(t.archivedAt)} where id = ${q(t.id)};`);
  }
  out.push("", "commit;", "");
  return out.join("\n");
}

if (process.argv[1]?.includes("generate-seed")) {
  const path = join(process.cwd(), "supabase", "seed.sql");
  writeFileSync(path, buildSeedSql(), "utf8");
  console.log(`✔ seed generado en ${path}`);
}
