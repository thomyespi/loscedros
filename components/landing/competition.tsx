import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RankingTop, rankingTop } from "@/components/landing/ranking-top";
import { Spotlight } from "@/components/landing/spotlight";
import { SectionHeading } from "@/components/section-heading";
import type { Spotlight as SpotlightData } from "@/lib/data/selectors";
import type { Team } from "@/lib/domain/types";
import type { HistoricalRow } from "@/lib/standings/historical";
import { cn } from "@/lib/utils";

/** "Competencia": torneo destacado + top del ranking, al final de la home. Se oculta si no hay nada que mostrar. */
export function Competition({
  spotlight,
  historical,
  teamById,
}: {
  spotlight: SpotlightData | null;
  historical: HistoricalRow[];
  teamById: Map<string, Team>;
}) {
  const top = rankingTop(historical);
  if (!spotlight && top.length === 0) return null;
  const both = spotlight && top.length > 0;

  return (
    <section id="competencia" className="scroll-mt-24 border-t border-white/10 bg-pitch/40 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Competencia"
          title="Torneos y ranking"
          description="Para los que vienen a competir: el torneo del momento y los equipos que más puntos juntaron."
          action={
            <Link href="/torneos" className="group hidden items-center gap-2 font-semibold text-grass sm:inline-flex">
              Ver todos los torneos <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          }
        />
        <div className={cn("mt-10 grid gap-10", both && "lg:grid-cols-2 lg:gap-8")}>
          {spotlight && <Spotlight spotlight={spotlight} />}
          {top.length > 0 && <RankingTop top={top} teamById={teamById} />}
        </div>
      </div>
    </section>
  );
}
