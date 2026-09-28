import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CompetitionTabs } from "@/components/layout/competition-tabs";
import { PageHeader } from "@/components/page-header";
import { Modalities } from "@/components/tournament/modalities";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { buildTournamentView, groupTournaments, type TournamentView } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";

export const metadata: Metadata = {
  title: "Torneos",
  description: "Torneos de footgolf por equipos en Los Cedros: tablas de posiciones, fechas y resultados en vivo.",
  alternates: { canonical: "/torneos" },
};

export default async function TournamentsPage() {
  const snap = await getSnapshot();
  const groups = groupTournaments(snap);
  const view = (list: typeof groups.live) => list.map((t) => buildTournamentView(snap, t));
  const sections: { title: string; items: TournamentView[] }[] = [
    { title: "En juego", items: view(groups.live) },
    { title: "Próximos", items: view(groups.upcoming) },
    { title: "Finalizados", items: view(groups.finished) },
  ].filter((s) => s.items.length > 0);

  return (
    <>
      <PageHeader
        top={<CompetitionTabs />}
        eyebrow="Competencia"
        title="Torneos"
        description="Equipos amateur, tres modalidades por cruce y cada punto cuenta. Seguí la tabla y los resultados de cada fecha."
      />
      <div className="container-page flex flex-col gap-14 py-12">
        {sections.length === 0 ? (
          <Reveal className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <Trophy className="size-12 text-grass" />
            <h2 className="font-display text-4xl text-chalk">Se viene el primer torneo</h2>
            <p className="max-w-md text-mist">
              Todavía no hay torneos publicados. ¿Querés anotar a tu equipo? Escribinos y te avisamos cuando arranque.
            </p>
            <WhatsAppButton phone={snap.settings.whatsapp} context={{ kind: "torneos" }}>
              Quiero anotar a mi equipo
            </WhatsAppButton>
          </Reveal>
        ) : (
          sections.map((section) => (
            <section key={section.title} aria-labelledby={`t-${section.title}`}>
              <h2 id={`t-${section.title}`} className="mb-5 flex items-center gap-3 text-sm font-semibold tracking-[0.25em] text-mist uppercase">
                {section.title}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs tracking-normal text-chalk">{section.items.length}</span>
                <span className="h-px flex-1 bg-white/10" />
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((v, i) => (
                  <Reveal key={v.tournament.id} delay={(i % 3) * 0.08}>
                    <TournamentCard view={v} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))
        )}

        <Modalities />

        {sections.length > 0 && (
          <Reveal className="flex flex-col items-start gap-4 rounded-3xl border border-grass/25 bg-grass/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-chalk">¿Querés jugar el próximo torneo?</p>
              <p className="text-mist">Armá tu equipo y consultanos por WhatsApp.</p>
            </div>
            <WhatsAppButton phone={snap.settings.whatsapp} context={{ kind: "torneos" }} size="md">
              Anotar mi equipo
            </WhatsAppButton>
          </Reveal>
        )}
      </div>
    </>
  );
}
