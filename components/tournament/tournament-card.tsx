import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TrophyIcon } from "@/components/brand/icons";
import { TeamAvatar } from "@/components/team-avatar";
import type { TournamentView } from "@/lib/data/selectors";
import { formatRange } from "@/lib/dates";
import { mediaUrl } from "@/lib/storage";
import { StatusBadge } from "./status-badge";

export function TournamentCard({ view }: { view: TournamentView }) {
  const { tournament, champion, leader, teamById, startDate, endDate, teams } = view;
  const cover = mediaUrl(tournament.coverPath);
  const leaderTeam = leader ? teamById.get(leader.teamId) : null;
  const range = formatRange(startDate, endDate);

  return (
    <Link
      href={`/torneos/${tournament.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-pitch transition-all duration-300 hover:-translate-y-1 hover:border-grass/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {cover ? (
          <Image src={cover} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <GeneratedCover name={tournament.name} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/20 to-transparent" />
        <StatusBadge status={tournament.status} className="absolute top-3 left-3" />
        <ArrowUpRight className="absolute top-3 right-3 size-6 text-chalk/70 transition group-hover:text-grass" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 pt-1">
        <h3 className="font-display text-4xl text-chalk">{tournament.name}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
          {range && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-cedar" /> {range}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-cedar" /> {teams.length} equipos · {view.rounds.length} {view.rounds.length === 1 ? "fecha" : "fechas"}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-night/50 p-3">
          {champion ? (
            <>
              <TeamAvatar team={champion} size="md" className="ring-2 ring-gold/70" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold tracking-widest text-gold uppercase">Campeón</p>
                <p className="truncate font-semibold text-chalk">{champion.name}</p>
              </div>
              <TrophyIcon className="size-6 text-gold" />
            </>
          ) : leaderTeam && leader ? (
            <>
              <TeamAvatar team={leaderTeam} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold tracking-widest text-grass uppercase">Líder</p>
                <p className="truncate font-semibold text-chalk">{leaderTeam.name}</p>
              </div>
              <span className="font-display tabular text-2xl text-chalk">
                {leader.points} <span className="text-xs text-mist">pts</span>
              </span>
            </>
          ) : (
            <div className="flex items-center -space-x-2">
              {teams.slice(0, 6).map((t) => (
                <TeamAvatar key={t.id} team={t} size="sm" className="ring-2 ring-night" />
              ))}
              <span className="pl-4 text-sm text-mist">¡Arranca pronto!</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Portada generada cuando el torneo no tiene imagen. */
export function GeneratedCover({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`mowed absolute inset-0 overflow-hidden bg-gradient-to-br from-pitch-3 via-pitch-2 to-night ${className}`}>
      <div className="absolute -top-10 -right-10 size-48 rounded-full bg-grass/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 size-48 rounded-full bg-cedar/15 blur-3xl" />
      <span className="font-display absolute right-4 bottom-2 left-4 truncate text-right text-7xl leading-none text-white/[0.06]">
        {name}
      </span>
    </div>
  );
}
