"use client";

import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { TrophyIcon } from "@/components/brand/icons";
import { TeamAvatar } from "@/components/team-avatar";
import type { Team } from "@/lib/domain/types";

/** Campeón destacado con festejo (confetti una sola vez por visita). */
export function ChampionBanner({ team, points, tournamentName }: { team: Team; points: number; tournamentName: string }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const key = `confetti:${tournamentName}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sin storage: festejamos igual
    }
    const colors = ["#9be22d", "#f2c94c", "#f2f5ef", "#c8894a"];
    const t = setTimeout(() => {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
      setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, colors }), 250);
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors }), 400);
    }, 500);
    return () => clearTimeout(t);
  }, [reduce, tournamentName]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/20 via-pitch to-night p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <TeamAvatar team={team} size="2xl" className="ring-4 ring-gold/80 ring-offset-4 ring-offset-night" />
          <TrophyIcon className="animate-float absolute -right-3 -bottom-2 size-12 text-gold drop-shadow-[0_6px_16px_rgb(242_201_76/0.6)]" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-gold uppercase">Campeón · {tournamentName}</p>
          <p className="font-display mt-1 text-5xl text-chalk sm:text-6xl">{team.name}</p>
          <p className="mt-1 text-mist">
            <span className="font-display text-2xl text-gold">{points}</span> puntos
          </p>
        </div>
      </div>
    </div>
  );
}
