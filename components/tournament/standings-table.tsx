"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { TrophyIcon } from "@/components/brand/icons";
import { TeamAvatar } from "@/components/team-avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Team } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { MatchCard, type MatchCardData } from "./match-card";
import { podium } from "./podium-colors";

export interface TableColumn {
  key: string;
  label: string;
  title: string;
}

export interface TableRow {
  team: Team;
  position: number;
  points: number;
  titles?: number;
  values: Record<string, number>;
}

export interface TeamMatches {
  label: string;
  match: MatchCardData;
}

/**
 * Tabla de posiciones mobile-first: posición, equipo y puntos quedan fijos a la izquierda;
 * el resto de las columnas se desliza dentro de la tabla (nunca la página).
 * - mode "sheet": tocar un equipo abre sus cruces del torneo.
 * - mode "link": tocar un equipo lleva a su página.
 */
export function StandingsTable({
  columns,
  rows,
  mode,
  matchesByTeam,
  caption,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  mode: "sheet" | "link";
  matchesByTeam?: Record<string, TeamMatches[]>;
  caption: string;
}) {
  const [openTeam, setOpenTeam] = useState<Team | null>(null);
  const grid = { gridTemplateColumns: `repeat(${columns.length}, minmax(2.75rem, 1fr))` };

  const rowContent = (row: TableRow): ReactNode => {
    const p = podium(row.position);
    return (
      <>
        <span className="sticky left-0 z-10 flex w-[13.5rem] shrink-0 items-center gap-2.5 bg-inherit py-2.5 pr-2 pl-3 sm:w-[19rem]">
          <span className={cn("font-display tabular w-6 shrink-0 text-center text-2xl", p ? p.text : "text-mist")}>{row.position}</span>
          <TeamAvatar team={row.team} size="sm" className={cn(p && `ring-2 ${p.ring}`)} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-chalk sm:text-base">{row.team.name}</span>
            {row.titles ? (
              <span className="flex items-center gap-1 text-[0.7rem] font-semibold text-gold">
                <TrophyIcon className="size-3" /> {row.titles} {row.titles === 1 ? "título" : "títulos"}
              </span>
            ) : null}
          </span>
          <span className="font-display tabular w-10 shrink-0 text-right text-2xl text-chalk">{row.points}</span>
        </span>
        <span className="grid flex-1 items-center text-center text-sm text-mist tabular" style={grid}>
          {columns.map((c) => (
            <span key={c.key} className={cn("px-1", c.key === "won" && "text-chalk")}>
              {row.values[c.key] ?? 0}
            </span>
          ))}
        </span>
        <ChevronRight className="mr-2 size-4 shrink-0 text-mist/50" aria-hidden />
      </>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-pitch">
      <div className="no-scrollbar overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
        <div className="min-w-fit" role="table" aria-label={caption}>
          <div role="row" className="flex items-center border-b border-white/10 bg-pitch-2 text-[0.65rem] font-semibold tracking-wider text-mist uppercase">
            <div className="sticky left-0 z-10 flex w-[13.5rem] shrink-0 items-center gap-2.5 bg-pitch-2 py-3 pr-2 pl-3 sm:w-[19rem]" role="columnheader">
              <span className="w-6 text-center">#</span>
              <span className="flex-1 pl-10">Equipo</span>
              <span className="w-10 text-right text-grass" title="Puntos">Pts</span>
            </div>
            <div className="grid flex-1 text-center" style={grid}>
              {columns.map((c) => (
                <span key={c.key} role="columnheader" title={c.title} className="px-1">
                  {c.label}
                </span>
              ))}
            </div>
            <span className="mr-2 w-4 shrink-0" />
          </div>
          {rows.map((row) => {
            const p = podium(row.position);
            const cls = cn(
              "flex min-h-14 w-full items-center border-b border-white/5 bg-pitch text-left transition-colors last:border-b-0 hover:bg-pitch-2 focus-visible:bg-pitch-2 focus-visible:outline-none",
              p && "bg-gradient-to-r from-white/[0.03] to-transparent",
            );
            return mode === "link" ? (
              <Link key={row.team.id} href={`/equipos/${row.team.slug}`} role="row" className={cls}>
                {rowContent(row)}
              </Link>
            ) : (
              <button key={row.team.id} type="button" role="row" className={cls} onClick={() => setOpenTeam(row.team)}>
                {rowContent(row)}
              </button>
            );
          })}
        </div>
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-1 border-t border-white/5 px-3 py-2.5 text-[0.7rem] text-mist">
        {columns.map((c) => (
          <span key={c.key}>
            <b className="text-chalk/80">{c.label}</b> {c.title}
          </span>
        ))}
      </p>

      {mode === "sheet" && (
        <Sheet open={!!openTeam} onOpenChange={(o) => !o && setOpenTeam(null)}>
          <SheetContent side="bottom" className="max-h-[88dvh] rounded-t-3xl border-white/10 bg-night">
            {openTeam && (
              <>
                <SheetHeader className="flex-row items-center gap-3">
                  <TeamAvatar team={openTeam} size="lg" />
                  <div className="min-w-0">
                    <SheetTitle className="font-display truncate text-3xl text-chalk">{openTeam.name}</SheetTitle>
                    <SheetDescription>Cruces en este torneo</SheetDescription>
                  </div>
                </SheetHeader>
                <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-[calc(1.5rem+var(--safe-bottom))]">
                  {(matchesByTeam?.[openTeam.id] ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-mist">
                      Todavía no jugó cruces en este torneo.
                    </p>
                  ) : (
                    matchesByTeam![openTeam.id].map((tm, i) => (
                      <MatchCard key={i} m={tm.match} caption={tm.label} highlightTeamId={openTeam.id} />
                    ))
                  )}
                  <Link
                    href={`/equipos/${openTeam.slug}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 font-semibold text-chalk"
                  >
                    Ver historial del equipo <ChevronRight className="size-4" />
                  </Link>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
