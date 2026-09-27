import { ArrowLeft, CalendarDays, Flag, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/section-heading";
import { ChampionBanner } from "@/components/tournament/champion-banner";
import { PhotoGallery } from "@/components/tournament/photo-gallery";
import { RoundsSection } from "@/components/tournament/rounds-section";
import { StandingsTable } from "@/components/tournament/standings-table";
import { StatusBadge } from "@/components/tournament/status-badge";
import { TabsNav, type TournamentTab } from "@/components/tournament/tabs-nav";
import { GeneratedCover } from "@/components/tournament/tournament-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { buildTournamentView, findTournament } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";
import { TOURNAMENT_COLUMNS, matchesByTeam, tournamentRows } from "@/lib/data/table-rows";
import { formatRange } from "@/lib/dates";
import { mediaUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/torneos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = findTournament(await getSnapshot(), slug);
  if (!t) return { title: "Torneo no encontrado" };
  return {
    title: t.name,
    description: t.description ?? `Tabla de posiciones, fechas y resultados del torneo ${t.name} en Los Cedros Footgolf.`,
    alternates: { canonical: `/torneos/${t.slug}` },
  };
}

export default async function TournamentPage({ params, searchParams }: PageProps<"/torneos/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const snap = await getSnapshot();
  const tournament = findTournament(snap, slug);
  if (!tournament) notFound();

  const view = buildTournamentView(snap, tournament);
  const hasPhotos = view.photos.length > 0;
  const requested = typeof sp.tab === "string" ? sp.tab : "tabla";
  const tab: TournamentTab = requested === "fechas" || (requested === "fotos" && hasPhotos) ? requested : "tabla";
  const fechaParam = Number(typeof sp.fecha === "string" ? sp.fecha : NaN);
  const cover = mediaUrl(tournament.coverPath);
  const range = formatRange(view.startDate, view.endDate);
  const championRow = view.champion ? view.standings.find((s) => s.teamId === view.champion!.id) : null;

  const roundLabel = new Map(view.rounds.map((r) => [r.round.id, `Fecha ${r.round.number}`]));
  const photoFilter = tab === "fotos" && Number.isFinite(fechaParam) ? view.rounds.find((r) => r.round.number === fechaParam)?.round.id : undefined;
  const photos = view.photos
    .filter((p) => !photoFilter || p.roundId === photoFilter)
    .map((p) => ({ id: p.id, src: mediaUrl(p.path)!, caption: p.caption, label: p.roundId ? (roundLabel.get(p.roundId) ?? null) : null }));
  const roundsWithPhotos = view.rounds.filter((r) => view.photos.some((p) => p.roundId === r.round.id));

  return (
    <>
      <header className="relative isolate overflow-hidden pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="absolute inset-0 -z-10">
          {cover ? (
            <Image src={cover} alt="" fill preload sizes="100vw" className="object-cover" />
          ) : (
            <GeneratedCover name={tournament.name} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/80 to-night/40" />
        </div>
        <div className="container-page flex flex-col gap-4">
          <Link href="/torneos" className="inline-flex w-fit items-center gap-1.5 text-sm text-mist transition hover:text-chalk">
            <ArrowLeft className="size-4" /> Torneos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tournament.status} />
            {view.pendingMatches > 0 && tournament.status === "en_curso" && (
              <span className="text-xs text-mist">{view.pendingMatches} cruces con resultados pendientes</span>
            )}
          </div>
          <h1 className="font-display text-6xl text-balance text-chalk sm:text-8xl">{tournament.name}</h1>
          <ul className="flex flex-wrap gap-2 text-sm">
            {range && (
              <li className="glass inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-chalk">
                <CalendarDays className="size-4 text-grass" /> {range}
              </li>
            )}
            <li className="glass inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-chalk">
              <Users className="size-4 text-grass" /> {view.teams.length} equipos
            </li>
            <li className="glass inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-chalk">
              <Flag className="size-4 text-grass" /> {view.rounds.length} {view.rounds.length === 1 ? "fecha" : "fechas"}
            </li>
          </ul>
          {tournament.description && <p className="max-w-2xl text-pretty text-chalk/80">{tournament.description}</p>}
          {tournament.status !== "finalizado" && (
            <WhatsAppButton
              phone={snap.settings.whatsapp}
              context={{ kind: "torneo", tournamentName: tournament.name }}
              variant="outline"
              size="md"
              className="w-fit"
            >
              Consultar por WhatsApp
            </WhatsAppButton>
          )}
        </div>
      </header>

      <div className="container-page flex flex-col gap-6 pb-10">
        {view.champion && championRow && (
          <ChampionBanner team={view.champion} points={championRow.points} tournamentName={tournament.name} />
        )}

        <TabsNav slug={tournament.slug} active={tab} showPhotos={hasPhotos} photoCount={view.photos.length} />

        {tab === "tabla" && (
          <section aria-label="Tabla de posiciones" className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <Eyebrow>Tabla de posiciones</Eyebrow>
              <span className="text-xs text-mist">Tocá un equipo para ver sus cruces</span>
            </div>
            <StandingsTable
              caption={`Tabla de posiciones de ${tournament.name}`}
              columns={TOURNAMENT_COLUMNS}
              rows={tournamentRows(view.standings, view.teamById)}
              mode="sheet"
              matchesByTeam={matchesByTeam(view)}
            />
            <p className="text-xs text-mist">
              3 puntos por modalidad ganada. Desempate: cruces ganados, enfrentamiento directo, Individual ganadas.
            </p>
          </section>
        )}

        {tab === "fechas" && (
          <RoundsSection
            slug={tournament.slug}
            rounds={view.rounds}
            selected={Number.isFinite(fechaParam) ? fechaParam : view.defaultRoundNumber}
          />
        )}

        {tab === "fotos" && (
          <section aria-label="Fotos" className="flex flex-col gap-4">
            {roundsWithPhotos.length > 0 && (
              <nav aria-label="Filtrar por fecha" className="no-scrollbar -mx-4 overflow-x-auto px-4">
                <ul className="flex w-max gap-2">
                  {[{ n: null as number | null, label: "Todas" }, ...roundsWithPhotos.map((r) => ({ n: r.round.number, label: `Fecha ${r.round.number}` }))].map(
                    (f) => {
                      const active = f.n === null ? !photoFilter : fechaParam === f.n;
                      return (
                        <li key={f.label}>
                          <Link
                            href={`/torneos/${tournament.slug}?tab=fotos${f.n ? `&fecha=${f.n}` : ""}`}
                            scroll={false}
                            replace
                            className={cn(
                              "flex h-10 items-center rounded-full border px-4 text-sm font-semibold",
                              active ? "border-grass bg-grass text-night" : "border-white/10 text-mist",
                            )}
                          >
                            {f.label}
                          </Link>
                        </li>
                      );
                    },
                  )}
                </ul>
              </nav>
            )}
            <PhotoGallery photos={photos} />
          </section>
        )}
      </div>
    </>
  );
}
