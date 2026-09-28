"use client";

import { AlertTriangle, Check, Loader2, Swords, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createMatch, deleteMatch, setResult } from "@/app/vestuario/(panel)/torneos/[id]/fechas/actions";
import { TeamAvatar } from "@/components/team-avatar";
import { MODALITIES, MODALITY_LABEL, type Modality, type Team } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { Card, EmptyState, btn } from "./ui";

type MiniTeam = Pick<Team, "id" | "name" | "avatarPath">;

export interface AdminMatch {
  id: string;
  teamA: MiniTeam;
  teamB: MiniTeam;
  results: Partial<Record<Modality, { winnerTeamId: string; scoreNote: string | null }>>;
}

export interface RoundManagerProps {
  roundId: string;
  matches: AdminMatch[];
  free: MiniTeam[];
  /** "idA|idB" (ordenados) → números de fecha en que ya se enfrentaron. */
  previousMeetings: Record<string, number[]>;
  locked: boolean;
}

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export function RoundManager({ roundId, matches, free, previousMeetings, locked }: RoundManagerProps) {
  return (
    <div className="flex flex-col gap-4">
      {locked && (
        <p className="rounded-2xl border border-cedar/40 bg-cedar/10 p-3 text-sm text-chalk">
          El torneo está finalizado. Reabrilo desde la pantalla del torneo para modificar cruces o resultados.
        </p>
      )}
      {matches.length === 0 && free.length < 2 && (
        <EmptyState title="No hay equipos disponibles para armar cruces" />
      )}
      {matches.map((m) => (
        <MatchEditor key={m.id} match={m} locked={locked} />
      ))}
      {!locked && free.length >= 2 && <PairingBuilder roundId={roundId} free={free} previousMeetings={previousMeetings} />}
      {matches.length > 0 && free.length === 1 && (
        <p className="rounded-2xl border border-white/10 bg-pitch p-3 text-sm text-mist">
          Libre en esta fecha: <b className="text-chalk">{free[0].name}</b>
        </p>
      )}
    </div>
  );
}

/* ───────────── Armado de cruces ───────────── */

function PairingBuilder({ roundId, free, previousMeetings }: { roundId: string; free: MiniTeam[]; previousMeetings: Record<string, number[]> }) {
  const router = useRouter();
  const [first, setFirst] = useState<MiniTeam | null>(null);
  const [pendingPair, setPendingPair] = useState<{ a: MiniTeam; b: MiniTeam; rounds: number[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  function create(a: MiniTeam, b: MiniTeam) {
    startTransition(async () => {
      const res = await createMatch({ roundId, teamAId: a.id, teamBId: b.id });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${a.name} vs ${b.name}`);
      // Sigue pendiente hasta que el cruce nuevo ya está en pantalla.
      startTransition(() => {
        setFirst(null);
        setPendingPair(null);
        router.refresh();
      });
    });
  }

  function pick(team: MiniTeam) {
    if (isPending) return;
    if (!first) return setFirst(team);
    if (first.id === team.id) return setFirst(null);
    const prev = previousMeetings[pairKey(first.id, team.id)];
    if (prev?.length) setPendingPair({ a: first, b: team, rounds: prev });
    else create(first, team);
  }

  return (
    <Card title="Armar cruce">
      <p className="mb-3 text-sm text-mist">
        {first ? (
          <>
            Elegí el rival de <b className="text-grass">{first.name}</b>
          </>
        ) : (
          "Tocá un equipo y después a su rival."
        )}
      </p>

      {pendingPair ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-cedar/40 bg-cedar/10 p-4">
          <p className="flex items-start gap-2 text-sm text-chalk">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-cedar" />
            {pendingPair.a.name} y {pendingPair.b.name} ya se enfrentaron en la{" "}
            {pendingPair.rounds.map((n) => `Fecha ${n}`).join(", ")}.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={btn.secondary} onClick={() => { setPendingPair(null); setFirst(null); }}>
              Cambiar
            </button>
            <button type="button" className={btn.primary} onClick={() => create(pendingPair.a, pendingPair.b)} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />} Crear igual
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {free.map((t) => {
            const selected = first?.id === t.id;
            const repeat = first && !selected && previousMeetings[pairKey(first.id, t.id)]?.length;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  disabled={isPending}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition",
                    selected ? "border-grass bg-grass/15" : "border-white/10 bg-night/40 hover:border-white/30",
                  )}
                >
                  <TeamAvatar team={t} size="md" />
                  <span className="line-clamp-2 text-sm leading-tight font-medium text-chalk">{t.name}</span>
                  {repeat ? <span className="absolute top-2 right-2 size-2 rounded-full bg-cedar" title="Ya se enfrentaron" /> : null}
                  {selected && <Check className="absolute top-2 right-2 size-4 text-grass" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {isPending && !pendingPair && (
        <p className="mt-3 flex items-center gap-2 text-sm text-mist">
          <Loader2 className="size-4 animate-spin" /> Creando cruce…
        </p>
      )}
    </Card>
  );
}

/* ───────────── Resultados ───────────── */

function MatchEditor({ match, locked }: { match: AdminMatch; locked: boolean }) {
  const router = useRouter();
  const [results, setResults] = useState(match.results);
  const [savingModality, setSavingModality] = useState<Modality | null>(null);
  const [isPending, startTransition] = useTransition();
  const saving = isPending ? savingModality : null;
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Si el servidor trae datos nuevos (router.refresh), sincronizamos durante el render.
  const [synced, setSynced] = useState(match.results);
  if (synced !== match.results) {
    setSynced(match.results);
    setResults(match.results);
  }

  const aWins = MODALITIES.filter((m) => results[m]?.winnerTeamId === match.teamA.id).length;
  const bWins = MODALITIES.filter((m) => results[m]?.winnerTeamId === match.teamB.id).length;
  const complete = MODALITIES.every((m) => results[m]);

  function save(modality: Modality, winnerTeamId: string | null, scoreNote: string | null) {
    const previous = results;
    setResults((r) => {
      const next = { ...r };
      if (winnerTeamId) next[modality] = { winnerTeamId, scoreNote };
      else delete next[modality];
      return next;
    });
    setSavingModality(modality);
    // En transición: el spinner y el bloqueo duran hasta que termina el refresh.
    startTransition(async () => {
      const res = await setResult({ matchId: match.id, modality, winnerTeamId, scoreNote });
      if (!res.ok) {
        setResults(previous);
        toast.error(res.error);
        return;
      }
      toast.success(winnerTeamId ? `${MODALITY_LABEL[modality]}: guardado` : `${MODALITY_LABEL[modality]}: borrado`, { duration: 1200 });
      startTransition(() => router.refresh());
    });
  }

  const side = (team: MiniTeam, wins: number) => (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
      <TeamAvatar team={team} size="md" />
      <span className="line-clamp-2 text-sm leading-tight font-semibold text-chalk">{team.name}</span>
      <span className={cn("font-display text-3xl", complete && wins >= 2 ? "text-grass" : "text-chalk")}>{wins}</span>
    </div>
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-pitch">
      <div className="flex items-start gap-2 p-4">
        {side(match.teamA, aWins)}
        <div className="flex flex-col items-center gap-1 pt-3">
          <Swords className="size-5 text-mist" />
          <span className={cn("rounded-full px-2 py-0.5 text-[0.6rem] font-bold tracking-wider uppercase", complete ? "bg-grass/15 text-grass" : "bg-cedar/15 text-cedar-soft")}>
            {complete ? "Completo" : `${MODALITIES.filter((m) => results[m]).length}/3`}
          </span>
        </div>
        {side(match.teamB, bWins)}
      </div>

      <ul className="flex flex-col gap-3 border-t border-white/5 p-4">
        {MODALITIES.map((mod) => (
          <ModalityRow
            key={`${mod}:${results[mod]?.scoreNote ?? ""}`}
            modality={mod}
            teamA={match.teamA}
            teamB={match.teamB}
            value={results[mod]}
            saving={saving === mod}
            disabled={locked || (saving !== null && saving !== mod)}
            onSave={(winner, note) => save(mod, winner, note)}
          />
        ))}
      </ul>

      {!locked && (
        <div className="border-t border-white/5 px-4 py-2">
          <button type="button" className={cn(btn.ghost, "h-10 px-2 text-sm hover:text-destructive")} onClick={() => setConfirmDelete(true)} disabled={isPending}>
            {isPending && !saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Borrar cruce
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Borrar este cruce?"
        description={
          Object.keys(results).length
            ? `${match.teamA.name} vs ${match.teamB.name} tiene resultados cargados: también se borran.`
            : `${match.teamA.name} vs ${match.teamB.name}`
        }
        confirmLabel="Borrar"
        destructive
        onConfirm={async () => {
          const res = await deleteMatch(match.id);
          if (!res.ok) return void toast.error(res.error);
          toast.success("Cruce borrado");
          setConfirmDelete(false);
          startTransition(() => router.refresh());
        }}
      />
    </article>
  );
}

function ModalityRow({
  modality,
  teamA,
  teamB,
  value,
  saving,
  disabled,
  onSave,
}: {
  modality: Modality;
  teamA: MiniTeam;
  teamB: MiniTeam;
  value: { winnerTeamId: string; scoreNote: string | null } | undefined;
  saving: boolean;
  disabled: boolean;
  onSave: (winner: string | null, note: string | null) => void;
}) {
  const [note, setNote] = useState(value?.scoreNote ?? "");

  const option = (team: MiniTeam) => {
    const on = value?.winnerTeamId === team.id;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        disabled={disabled}
        onClick={() => !on && onSave(team.id, note.trim() || null)}
        className={cn(
          "flex min-h-13 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50",
          on ? "bg-grass text-night shadow-[0_6px_20px_-8px_rgb(155_226_45/0.8)]" : "bg-night/50 text-chalk ring-1 ring-white/10 hover:ring-white/30",
        )}
      >
        {on && <Check className="size-4 shrink-0" strokeWidth={3} />}
        <span className="truncate">{team.name}</span>
      </button>
    );
  };

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-mist uppercase">{MODALITY_LABEL[modality]}</span>
        <span className="flex items-center gap-1">
          {saving && <Loader2 className="size-4 animate-spin text-grass" />}
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onSave(null, null)}
              className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs text-mist hover:bg-white/5 hover:text-destructive"
              aria-label={`Borrar resultado de ${MODALITY_LABEL[modality]}`}
            >
              <X className="size-3.5" /> Borrar
            </button>
          )}
        </span>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={`Ganador de ${MODALITY_LABEL[modality]}`}>
        {option(teamA)}
        {option(teamB)}
      </div>
      {value && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            const clean = note.trim() || null;
            if (clean !== (value.scoreNote ?? null)) onSave(value.winnerTeamId, clean);
          }}
          maxLength={20}
          disabled={disabled}
          placeholder="Marcador (opcional): 3&2, 1 UP…"
          className="h-10 rounded-lg border border-white/10 bg-night/40 px-3 text-sm text-chalk placeholder:text-mist/60 outline-none focus:border-grass"
          aria-label={`Marcador de ${MODALITY_LABEL[modality]}`}
        />
      )}
    </li>
  );
}
