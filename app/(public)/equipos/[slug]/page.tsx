import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrophyIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/section-heading";
import { TeamAvatar } from "@/components/team-avatar";
import { MatchCard } from "@/components/tournament/match-card";
import { podium } from "@/components/tournament/podium-colors";
import { StatusBadge } from "@/components/tournament/status-badge";
import { getTeamView } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";
import { formatRange, formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/equipos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = getTeamView(await getSnapshot(), slug);
  if (!data) return { title: "Equipo no encontrado" };
  return {
    title: data.team.name,
    description: `Historial de ${data.team.name} en los torneos de Los Cedros Footgolf.`,
    alternates: { canonical: `/equipos/${data.team.slug}` },
  };
}

export default async function TeamPage({ params }: PageProps<"/equipos/[slug]">) {
  const { slug } = await params;
  const data = getTeamView(await getSnapshot(), slug);
  if (!data) notFound();
  const { team, historical, tournaments, recentMatches } = data;

  const stats = [
    { label: "Puntos", value: historical?.points ?? 0 },
    { label: "Títulos", value: historical?.titles ?? 0 },
    { label: "Torneos", value: historical?.tournamentsPlayed ?? 0 },
    { label: "Cruces ganados", value: historical?.won ?? 0 },
  ];

  return (
    <>
      <header className="mowed grain relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-pitch-2 to-night pt-24 pb-10 sm:pt-32">
        <div className="container-page flex flex-col gap-6">
          <Link href="/ranking" className="inline-flex w-fit items-center gap-1.5 text-sm text-mist transition hover:text-chalk">
            <ArrowLeft className="size-4" /> Ranking
          </Link>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <TeamAvatar team={team} size="2xl" ring />
            <div>
              {historical && <Eyebrow>#{historical.position} del ranking histórico</Eyebrow>}
              <h1 className="font-display mt-2 text-5xl text-balance text-chalk sm:text-7xl">{team.name}</h1>
              {historical && historical.titles > 0 && (
                <p className="mt-2 flex items-center justify-center gap-1 sm:justify-start" aria-label={`${historical.titles} títulos`}>
                  {Array.from({ length: historical.titles }).map((_, i) => (
                    <TrophyIcon key={i} className="size-6 text-gold" />
                  ))}
                </p>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-night/50 p-4">
                <dd className="font-display tabular text-4xl text-chalk">{s.value}</dd>
                <dt className="text-xs tracking-wide text-mist uppercase">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-page flex flex-col gap-12 py-10">
        <section className="flex flex-col gap-4">
          <Eyebrow>Torneos</Eyebrow>
          {tournaments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-mist">Todavía no jugó torneos.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tournaments.map(({ view, row }) => {
                const isChampion = view.champion?.id === team.id;
                const p = podium(row.position);
                return (
                  <li key={view.tournament.id}>
                    <Link
                      href={`/torneos/${view.tournament.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-pitch p-4 transition hover:border-grass/40"
                    >
                      <span className={cn("font-display w-10 text-center text-3xl", p ? p.text : "text-mist")}>{row.position}°</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-semibold text-chalk">
                          <span className="truncate">{view.tournament.name}</span>
                          {isChampion && <TrophyIcon className="size-4 shrink-0 text-gold" />}
                        </span>
                        <span className="text-xs text-mist">
                          {formatRange(view.startDate, view.endDate)} · {row.points} pts · {row.won} PG
                        </span>
                      </span>
                      <StatusBadge status={view.tournament.status} className="hidden sm:inline-flex" />
                      <ChevronRight className="size-4 text-mist" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {recentMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <Eyebrow>Últimos cruces</Eyebrow>
            <div className="grid gap-3 lg:grid-cols-2">
              {recentMatches.map((m, i) => (
                <Reveal key={m.match.id} delay={(i % 2) * 0.06}>
                  <MatchCard m={m} highlightTeamId={team.id} caption={`${m.tournament.name} · Fecha ${m.round.number} · ${formatShort(m.round.playDate)}`} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
