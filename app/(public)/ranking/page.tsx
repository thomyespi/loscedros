import type { Metadata } from "next";
import { Medal } from "lucide-react";
import { TrophyIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { CompetitionTabs } from "@/components/layout/competition-tabs";
import { PageHeader } from "@/components/page-header";
import { TeamAvatar } from "@/components/team-avatar";
import { podium } from "@/components/tournament/podium-colors";
import { StandingsTable } from "@/components/tournament/standings-table";
import { getHistorical, teamMap } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";
import { HISTORICAL_COLUMNS, historicalRows } from "@/lib/data/table-rows";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ranking histórico",
  description: "Puntos acumulados de todos los equipos en todos los torneos de Los Cedros Footgolf.",
  alternates: { canonical: "/ranking" },
};

export default async function RankingPage() {
  const snap = await getSnapshot();
  const rows = getHistorical(snap);
  const teamById = teamMap(snap);
  const podiumRows = rows.filter((r) => r.points > 0).slice(0, 3);
  const played = snap.tournaments.filter((t) => t.status === "en_curso" || t.status === "finalizado").length;

  return (
    <>
      <PageHeader
        top={<CompetitionTabs />}
        eyebrow="Desde el primer torneo"
        title="Ranking histórico"
        description="Todos los equipos, todos los torneos. Cada modalidad ganada suma 3 puntos para siempre."
      >
        <p className="text-sm text-mist">
          {played} {played === 1 ? "torneo disputado" : "torneos disputados"} · {rows.length} equipos
        </p>
      </PageHeader>

      <div className="container-page flex flex-col gap-8 py-10">
        {podiumRows.length === 3 && (
          <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Podio histórico">
            {[podiumRows[1], podiumRows[0], podiumRows[2]].map((row, i) => {
              const team = teamById.get(row.teamId)!;
              const p = podium(row.position)!;
              const heights = ["h-24 sm:h-32", "h-32 sm:h-44", "h-20 sm:h-24"];
              return (
                <Reveal as="li" key={row.teamId} delay={[0.15, 0, 0.3][i]} className="flex flex-col items-center gap-2 text-center">
                  <TeamAvatar team={team} size={row.position === 1 ? "xl" : "lg"} className={cn("ring-4", p.ring)} />
                  <span className="line-clamp-2 text-xs font-semibold text-chalk sm:text-base">{team.name}</span>
                  <span className="font-display tabular text-2xl text-chalk sm:text-3xl">
                    {row.points}
                    <span className="ml-1 text-xs text-mist">pts</span>
                  </span>
                  <div className={cn("flex w-full flex-col items-center justify-start rounded-t-2xl border-x border-t pt-2", p.border, p.soft, heights[i])}>
                    <span className={cn("font-display text-4xl sm:text-6xl", p.text)}>{row.position}</span>
                    {row.titles > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
                        <TrophyIcon className="size-3.5" /> {row.titles}
                      </span>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ol>
        )}

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <Medal className="size-10 text-grass" />
            <p className="font-display text-3xl text-chalk">El ranking arranca con el primer torneo</p>
          </div>
        ) : (
          <StandingsTable
            caption="Ranking histórico de equipos"
            columns={HISTORICAL_COLUMNS}
            rows={historicalRows(rows, teamById)}
            mode="link"
          />
        )}
        <p className="text-xs text-mist">
          Orden: puntos, títulos, cruces ganados, Individual ganadas. Los títulos cuentan los torneos finalizados ganados.
        </p>
      </div>
    </>
  );
}
