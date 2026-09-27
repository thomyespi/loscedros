import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { TrophyIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/section-heading";
import { TeamAvatar } from "@/components/team-avatar";
import { podium } from "@/components/tournament/podium-colors";
import { StatusBadge } from "@/components/tournament/status-badge";
import type { Spotlight as SpotlightData } from "@/lib/data/selectors";
import { formatLong, relativeDay } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Torneo destacado de la sección Competencia: el en curso, el próximo o el último campeón. */
export function Spotlight({ spotlight }: { spotlight: SpotlightData }) {
  const { view, kind } = spotlight;
  const { tournament, nextRound, standings, teamById, champion } = view;
  const top3 = standings.slice(0, 3);
  const href = `/torneos/${tournament.slug}`;

  return (
    <Reveal className="h-full">
      <div className="mowed grain @container relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pitch-3 via-pitch to-night p-5 shadow-2xl sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-grass/15 blur-3xl"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow>{kind === "live" ? "Torneo en vivo" : kind === "upcoming" ? "Se viene" : "Último campeón"}</Eyebrow>
          <StatusBadge status={tournament.status} />
        </div>

        <h3 className="font-display mt-4 text-4xl text-chalk sm:text-5xl">
          {tournament.name}
        </h3>

        {kind === "champion" && champion ? (
          <div className="mt-6 flex items-center gap-4">
            <div className="relative">
              <TeamAvatar team={champion} size="xl" className="ring-4 ring-gold/70" />
              <TrophyIcon className="absolute -right-2 -bottom-2 size-9 text-gold drop-shadow-lg" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Campeón</p>
              <p className="font-display text-3xl text-chalk">{champion.name}</p>
              <p className="text-sm text-mist">{standings.find((s) => s.teamId === champion.id)?.points ?? 0} puntos</p>
            </div>
          </div>
        ) : (
          <>
            {nextRound && (
              <div className="mt-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
                <CalendarDays className="size-4 text-grass" />
                <span className="font-semibold text-chalk">Fecha {nextRound.round.number}</span>
                <span className="text-mist capitalize">{formatLong(nextRound.round.playDate)}</span>
                {relativeDay(nextRound.round.playDate) && (
                  <span className="rounded-full bg-grass/15 px-2 py-0.5 text-xs font-semibold text-grass">
                    {relativeDay(nextRound.round.playDate)}
                  </span>
                )}
              </div>
            )}

            {view.leader ? (
              <ol className="mt-6 grid gap-2 @xl:grid-cols-3">
                {top3.map((row) => {
                  const team = teamById.get(row.teamId)!;
                  const p = podium(row.position);
                  return (
                    <li
                      key={row.teamId}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border bg-night/40 p-3",
                        p?.border ?? "border-white/10",
                        row.position === 1 && "@xl:scale-[1.03]",
                      )}
                    >
                      <span className={cn("font-display w-6 text-center text-3xl", p?.text)}>{row.position}</span>
                      <TeamAvatar team={team} size="md" />
                      <span className="min-w-0 flex-1 truncate font-semibold text-chalk">{team.name}</span>
                      <span className="text-right">
                        <span className="font-display tabular block text-2xl text-chalk">{row.points}</span>
                        <span className="block text-[0.6rem] tracking-widest text-mist uppercase">pts</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-6 flex -space-x-3">
                {view.teams.slice(0, 8).map((t) => (
                  <TeamAvatar key={t.id} team={t} size="md" className="ring-2 ring-pitch" />
                ))}
                <span className="ml-5 self-center pl-3 text-sm text-mist">{view.teams.length} equipos inscriptos</span>
              </div>
            )}
          </>
        )}

        <Link
          href={href}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-chalk px-6 font-semibold text-night transition hover:bg-grass active:scale-[0.98] sm:w-auto"
        >
          {kind === "champion" ? "Ver cómo terminó" : "Ver tabla y resultados"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Reveal>
  );
}
