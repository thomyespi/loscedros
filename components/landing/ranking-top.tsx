import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TrophyIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/section-heading";
import { TeamAvatar } from "@/components/team-avatar";
import { podium } from "@/components/tournament/podium-colors";
import type { Team } from "@/lib/domain/types";
import type { HistoricalRow } from "@/lib/standings/historical";
import { cn } from "@/lib/utils";

/** Mínimo de equipos con puntos o títulos para que el top del ranking diga algo. */
export const MIN_RANKED_TEAMS = 3;

/** Top 5 del ranking histórico, o vacío si no llega a {@link MIN_RANKED_TEAMS}. */
export function rankingTop(rows: HistoricalRow[]): HistoricalRow[] {
  const ranked = rows.filter((r) => r.points > 0 || r.titles > 0);
  return ranked.length >= MIN_RANKED_TEAMS ? ranked.slice(0, 5) : [];
}

/** Top del ranking histórico dentro de la sección Competencia. Recibe filas ya filtradas por {@link rankingTop}. */
export function RankingTop({ top, teamById }: { top: HistoricalRow[]; teamById: Map<string, Team> }) {
  const max = Math.max(...top.map((r) => r.points), 1);

  return (
    <div className="flex flex-col">
      <Reveal className="flex items-center justify-between gap-3">
        <Eyebrow>Ranking histórico</Eyebrow>
        <Link href="/ranking" className="group hidden items-center gap-2 text-sm font-semibold text-grass sm:inline-flex">
          Ver completo <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      </Reveal>
      <ol className="mt-4 flex flex-col gap-2">
        {top.map((row, i) => {
          const team = teamById.get(row.teamId)!;
          const p = podium(row.position);
          return (
            <Reveal as="li" key={row.teamId} delay={i * 0.06}>
              <Link
                href={`/equipos/${team.slug}`}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-pitch p-3 pr-4 transition hover:border-grass/40 sm:gap-4 sm:p-4",
                  p?.border ?? "border-white/10",
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-grass/[0.06] transition-all duration-700 group-hover:bg-grass/10"
                  style={{ width: `${(row.points / max) * 100}%` }}
                />
                <span className={cn("font-display relative w-8 text-center text-4xl", p?.text ?? "text-mist")}>{row.position}</span>
                <TeamAvatar team={team} size="lg" className="relative" />
                <span className="relative min-w-0 flex-1">
                  <span className="block truncate text-lg font-bold text-chalk">{team.name}</span>
                  <span className="flex items-center gap-2 text-xs text-mist">
                    {row.titles > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-gold">
                        <TrophyIcon className="size-3.5" /> {row.titles}
                      </span>
                    )}
                    {row.tournamentsPlayed} {row.tournamentsPlayed === 1 ? "torneo" : "torneos"} · {row.won} cruces ganados
                  </span>
                </span>
                <span className="relative text-right">
                  <span className="font-display tabular block text-4xl leading-none text-chalk">{row.points}</span>
                  <span className="text-[0.6rem] tracking-widest text-mist uppercase">pts</span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
      <Link
        href="/ranking"
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 font-semibold text-chalk sm:hidden"
      >
        Ver ranking completo <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
