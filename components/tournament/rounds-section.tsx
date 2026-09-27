import { CalendarClock, Coffee } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { TeamAvatar } from "@/components/team-avatar";
import type { RoundView } from "@/lib/data/selectors";
import { formatLong, formatShort, relativeDay } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { MatchCard } from "./match-card";

export function RoundsSection({ slug, rounds, selected }: { slug: string; rounds: RoundView[]; selected: number }) {
  const current = rounds.find((r) => r.round.number === selected) ?? rounds[0];
  if (!current) {
    return <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-mist">Este torneo todavía no tiene fechas.</p>;
  }
  const rel = relativeDay(current.round.playDate);

  return (
    <div className="flex flex-col gap-5">
      {/* Selector de fechas: chips con scroll horizontal */}
      <nav aria-label="Fechas" className="no-scrollbar fade-x -mx-4 overflow-x-auto px-4">
        <ul className="flex w-max snap-x gap-2 py-1">
          {rounds.map((r) => {
            const active = r.round.number === current.round.number;
            const played = r.matches.some((m) => m.results.length > 0);
            return (
              <li key={r.round.id} className="snap-start">
                <Link
                  href={`/torneos/${slug}?tab=fechas&fecha=${r.round.number}`}
                  scroll={false}
                  replace
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-[6.5rem] flex-col items-center rounded-2xl border px-4 py-2.5 transition-colors",
                    active ? "border-grass bg-grass text-night" : "border-white/10 bg-pitch text-chalk hover:border-white/25",
                  )}
                >
                  <span className="font-display text-xl leading-tight">Fecha {r.round.number}</span>
                  <span className={cn("text-xs capitalize", active ? "text-night/75" : "text-mist")}>{formatShort(r.round.playDate)}</span>
                  <span
                    className={cn(
                      "mt-1 size-1.5 rounded-full",
                      played ? (active ? "bg-night" : "bg-grass") : active ? "bg-night/30" : "bg-white/20",
                    )}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-display text-4xl text-chalk">Fecha {current.round.number}</h2>
        <span className="text-mist capitalize">{formatLong(current.round.playDate)}</span>
        {rel && <span className="rounded-full bg-grass/15 px-2.5 py-0.5 text-xs font-semibold text-grass">{rel}</span>}
      </div>

      {current.matches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center">
          <CalendarClock className="size-10 text-cedar" />
          <p className="font-display text-3xl text-chalk">Cruces a confirmar</p>
          <p className="text-mist capitalize">{formatLong(current.round.playDate)} · Los Cedros</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {current.matches.map((m, i) => (
            <Reveal key={m.match.id} delay={i * 0.05}>
              <MatchCard m={m} />
            </Reveal>
          ))}
        </div>
      )}

      {current.matches.length > 0 && current.free.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-pitch/60 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-mist">
            <Coffee className="size-4 text-cedar" /> Libre{current.free.length > 1 ? "s" : ""}:
          </span>
          {current.free.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-2 text-sm text-chalk">
              <TeamAvatar team={t} size="xs" /> {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
