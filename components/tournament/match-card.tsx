import Link from "next/link";
import { TeamAvatar } from "@/components/team-avatar";
import { MODALITIES, MODALITY_LABEL, type MatchResult, type Team } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export interface MatchCardData {
  teamA: Team;
  teamB: Team;
  results: MatchResult[];
  aWins: number;
  bWins: number;
  isComplete: boolean;
  winnerId: string | null;
}

/** Tarjeta de un cruce: marcador de modalidades y detalle de cada una. */
export function MatchCard({ m, highlightTeamId, caption }: { m: MatchCardData; highlightTeamId?: string; caption?: string }) {
  const byModality = new Map(m.results.map((r) => [r.modality, r]));
  const side = (team: Team, wins: number, align: "left" | "right") => {
    const lost = m.isComplete && m.winnerId !== team.id;
    return (
      <Link
        href={`/equipos/${team.slug}`}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center gap-2 text-center transition-opacity",
          lost && "opacity-55",
          align === "right" && "sm:flex-row-reverse sm:text-right",
          align === "left" && "sm:flex-row sm:text-left",
        )}
      >
        <TeamAvatar team={team} size="lg" className={cn(m.winnerId === team.id && "ring-2 ring-grass ring-offset-2 ring-offset-pitch")} />
        <span
          className={cn(
            "line-clamp-2 text-sm leading-tight font-semibold text-chalk sm:text-base",
            highlightTeamId === team.id && "text-grass",
          )}
        >
          {team.name}
        </span>
        <span className="sr-only">{wins} modalidades ganadas</span>
      </Link>
    );
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-pitch">
      {caption && <p className="border-b border-white/5 px-4 py-2 text-xs text-mist">{caption}</p>}
      <div className="flex items-center gap-2 p-4">
        {side(m.teamA, m.aWins, "left")}
        <div className="flex shrink-0 flex-col items-center gap-1 px-1">
          <div className="font-display tabular flex items-center gap-2 text-4xl text-chalk">
            <span className={cn(m.isComplete && m.winnerId === m.teamA.id && "text-grass")}>{m.aWins}</span>
            <span className="text-2xl text-mist/60">–</span>
            <span className={cn(m.isComplete && m.winnerId === m.teamB.id && "text-grass")}>{m.bWins}</span>
          </div>
          {!m.isComplete && (
            <span className="rounded-full bg-cedar/15 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-cedar-soft uppercase">
              {m.results.length === 0 ? "Por jugar" : "Pendiente"}
            </span>
          )}
        </div>
        {side(m.teamB, m.bWins, "right")}
      </div>
      <ul className="grid grid-cols-3 border-t border-white/5 text-center">
        {MODALITIES.map((mod) => {
          const r = byModality.get(mod);
          const winner = r ? (r.winnerTeamId === m.teamA.id ? m.teamA : m.teamB) : null;
          return (
            <li key={mod} className="flex flex-col items-center gap-1.5 border-white/5 px-1 py-3 not-last:border-r">
              <span className="text-[0.62rem] font-semibold tracking-wider text-mist uppercase">{MODALITY_LABEL[mod]}</span>
              {winner ? (
                <>
                  <TeamAvatar team={winner} size="sm" />
                  <span className="max-w-full truncate px-1 text-xs font-medium text-chalk">{winner.name}</span>
                  {r?.scoreNote && <span className="tabular text-[0.7rem] text-grass">{r.scoreNote}</span>}
                </>
              ) : (
                <>
                  <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/20 text-xs text-mist">?</span>
                  <span className="text-xs text-mist">A definir</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
