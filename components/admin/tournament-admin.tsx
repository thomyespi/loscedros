"use client";

import { CalendarPlus, ChevronRight, ImagePlus, Loader2, Minus, Plus, Save, Trash2, UserMinus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  addRound,
  addTournamentTeams,
  changeTournamentStatus,
  deleteTournament,
  removeLastRound,
  removeTournamentTeam,
  saveRoundDates,
  setTournamentCover,
  updateTournamentInfo,
} from "@/app/vestuario/(panel)/torneos/actions";
import { TeamAvatar } from "@/components/team-avatar";
import { StatusBadge } from "@/components/tournament/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACCEPTED_IMAGES, compressPhoto, uploadImage } from "@/lib/admin/image";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { formatLong } from "@/lib/dates";
import type { ReadinessIssue } from "@/lib/domain/readiness";
import type { Team, TournamentStatus } from "@/lib/domain/types";
import { mediaUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { TeamMultiSelect } from "./team-multi-select";
import { useAdminAction } from "./use-admin-action";
import { Card, Field, btn, inputClass, textareaClass } from "./ui";

export interface AdminTournamentData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverPath: string | null;
  status: TournamentStatus;
  championName: string | null;
  /** Motivo por el que no se puede arrancar (null = se puede). */
  startIssue: ReadinessIssue | null;
  /** Motivo por el que no se puede finalizar (null = se puede). */
  finishIssue: ReadinessIssue | null;
  totalMatches: number;
  teams: (Pick<Team, "id" | "name" | "avatarPath"> & { matches: number })[];
  availableTeams: Pick<Team, "id" | "name" | "avatarPath">[];
  rounds: { id: string; number: number; playDate: string; matches: number; pending: number }[];
}

export function TournamentAdmin({ t }: { t: AdminTournamentData }) {
  return (
    <div className="flex flex-col gap-4">
      <StatusCard t={t} />
      <RoundsCard t={t} />
      <TeamsCard t={t} />
      <InfoCard t={t} />
      <DangerCard t={t} />
    </div>
  );
}

/* ───────────── Estado ───────────── */

const TRANSITIONS: Record<TournamentStatus, { to: TournamentStatus; label: string; primary?: boolean }[]> = {
  borrador: [
    { to: "proximo", label: "Publicar como próximo", primary: true },
    { to: "en_curso", label: "Publicar en juego" },
  ],
  proximo: [
    { to: "en_curso", label: "Arrancar torneo", primary: true },
    { to: "borrador", label: "Volver a borrador" },
  ],
  en_curso: [
    { to: "finalizado", label: "Finalizar torneo", primary: true },
    { to: "proximo", label: "Volver a próximo" },
  ],
  finalizado: [{ to: "en_curso", label: "Reabrir torneo" }],
};

const HINTS: Record<TournamentStatus, string> = {
  borrador: "Nadie lo ve todavía. Publicalo cuando esté listo.",
  proximo: "Visible en el sitio como próximo torneo.",
  en_curso: "Visible con tabla y resultados en vivo.",
  finalizado: "Terminado. El campeón quedó guardado.",
};

function StatusCard({ t }: { t: AdminTournamentData }) {
  const [run, pending] = useAdminAction();
  const [confirm, setConfirm] = useState<TournamentStatus | null>(null);

  /** Motivo por el que la transición no está permitida (mismas reglas que el servidor y la base). */
  const blockedBy = (to: TournamentStatus): ReadinessIssue | null =>
    to === "finalizado" ? t.finishIssue : to === "en_curso" && (t.status === "borrador" || t.status === "proximo") ? t.startIssue : null;
  const issues = [...new Set(TRANSITIONS[t.status].map((tr) => blockedBy(tr.to)).filter((i) => i !== null))];

  async function apply(to: TournamentStatus) {
    const data = await run(() => changeTournamentStatus(t.id, to));
    if (data !== undefined) {
      toast.success(to === "finalizado" && data.champion ? `¡Torneo finalizado! Campeón: ${data.champion} 🏆` : "Estado actualizado");
    }
    setConfirm(null);
  }

  return (
    <Card title="Estado">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={t.status} />
          {t.championName && <span className="text-sm text-gold">🏆 {t.championName}</span>}
        </div>
        <p className="text-sm text-mist">{HINTS[t.status]}</p>
        {t.status !== "borrador" && (
          <Link href={`/torneos/${t.slug}`} target="_blank" className="w-fit text-sm font-semibold text-grass">
            Ver en el sitio ↗
          </Link>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {TRANSITIONS[t.status].map((tr) => (
            <button
              key={tr.to}
              type="button"
              className={tr.primary ? btn.primary : btn.secondary}
              disabled={pending || !!blockedBy(tr.to)}
              onClick={() => (tr.to === "finalizado" || t.status === "finalizado" ? setConfirm(tr.to) : apply(tr.to))}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {tr.label}
            </button>
          ))}
        </div>
        {issues.map((issue) => (
          <p key={issue.reason} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-cedar/40 bg-cedar/10 px-3 py-2 text-sm text-chalk">
            <span>{issue.reason}</span>
            {issue.round !== null && (
              <Link href={`${ADMIN_BASE_PATH}/torneos/${t.id}/fechas/${issue.round}`} className="inline-flex items-center gap-0.5 font-semibold text-grass">
                Ir a la Fecha {issue.round} <ChevronRight className="size-4" />
              </Link>
            )}
          </p>
        ))}
      </div>
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "finalizado" ? "¿Finalizar el torneo?" : "¿Reabrir el torneo?"}
        description={
          confirm === "finalizado"
            ? "Se va a guardar como campeón al primero de la tabla y sumará un título en el ranking histórico."
            : "El torneo vuelve a estar en juego y se borra el campeón guardado (se recalcula al finalizar de nuevo)."
        }
        confirmLabel={confirm === "finalizado" ? "Finalizar" : "Reabrir"}
        onConfirm={() => apply(confirm!)}
      />
    </Card>
  );
}

/* ───────────── Fechas ───────────── */

function RoundsCard({ t }: { t: AdminTournamentData }) {
  const [run, pending] = useAdminAction();
  const [dates, setDates] = useState(() => Object.fromEntries(t.rounds.map((r) => [r.id, r.playDate])));
  const [newDate, setNewDate] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const dirty = t.rounds.some((r) => dates[r.id] !== r.playDate);
  const last = t.rounds.at(-1);

  return (
    <Card title={`Fechas (${t.rounds.length})`}>
      <ul className="flex flex-col gap-2">
        {t.rounds.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-night/40 p-3">
            <div className="flex items-center gap-3">
              <span className="font-display w-20 shrink-0 text-2xl text-grass">Fecha {r.number}</span>
              <input
                type="date"
                value={dates[r.id] ?? r.playDate}
                onChange={(e) => setDates((d) => ({ ...d, [r.id]: e.target.value }))}
                className={cn(inputClass, "min-w-0 flex-1")}
                aria-label={`Día de la fecha ${r.number}`}
              />
            </div>
            <Link
              href={`${ADMIN_BASE_PATH}/torneos/${t.id}/fechas/${r.number}`}
              className="flex min-h-11 items-center justify-between rounded-xl bg-white/5 px-3 text-sm transition hover:bg-white/10"
            >
              <span className="text-mist">
                {r.matches === 0 ? "Sin cruces" : `${r.matches} ${r.matches === 1 ? "cruce" : "cruces"}`}
                {r.pending > 0 && <span className="text-cedar-soft"> · {r.pending} pendientes</span>}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-grass">
                {r.matches === 0 ? "Armar cruces" : "Cruces y resultados"} <ChevronRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {dirty && (
        <button
          type="button"
          className={cn(btn.primary, "mt-3 w-full")}
          disabled={pending}
          onClick={() => run(() => saveRoundDates(t.id, t.rounds.map((r) => ({ id: r.id, number: r.number, playDate: dates[r.id] ?? r.playDate }))), "Fechas guardadas")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar días
        </button>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
        <p className="text-sm font-medium text-chalk">Agregar fecha {t.rounds.length + 1}</p>
        <div className="flex gap-2">
          <input type="date" value={newDate} min={last?.playDate} onChange={(e) => setNewDate(e.target.value)} className={cn(inputClass, "flex-1")} aria-label="Día de la nueva fecha" />
          <button
            type="button"
            className={cn(btn.secondary, "shrink-0")}
            disabled={!newDate || pending}
            onClick={async () => {
              await run(() => addRound(t.id, newDate), "Fecha agregada");
              setNewDate("");
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />} Agregar
          </button>
        </div>
        {last && t.rounds.length > 1 && last.matches === 0 && (
          <button type="button" className={cn(btn.ghost, "w-fit")} onClick={() => setConfirmRemove(true)} disabled={pending}>
            <Minus className="size-4" /> Quitar la Fecha {last.number}
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={`¿Quitar la Fecha ${last?.number}?`}
        description={last ? `Es la del ${formatLong(last.playDate)}.` : undefined}
        confirmLabel="Quitar"
        destructive
        onConfirm={async () => {
          await run(() => removeLastRound(t.id), "Fecha quitada");
          setConfirmRemove(false);
        }}
      />
    </Card>
  );
}

/* ───────────── Equipos ───────────── */

function TeamsCard({ t }: { t: AdminTournamentData }) {
  const [run, pending] = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [removing, setRemoving] = useState<AdminTournamentData["teams"][number] | null>(null);
  const locked = t.status === "finalizado";

  return (
    <Card
      title={`Equipos (${t.teams.length})`}
      action={
        !locked && t.availableTeams.length > 0 ? (
          <button type="button" className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-grass hover:bg-grass/10" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Agregar
          </button>
        ) : null
      }
    >
      <ul className="flex flex-col divide-y divide-white/5">
        {t.teams.map((team) => (
          <li key={team.id} className="flex min-h-14 items-center gap-3">
            <TeamAvatar team={team} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-chalk">{team.name}</span>
              <span className="text-xs text-mist">{team.matches} cruces</span>
            </span>
            {!locked && team.matches === 0 && t.teams.length > 2 && (
              <button type="button" className={btn.icon} onClick={() => setRemoving(team)} aria-label={`Quitar ${team.name}`} disabled={pending}>
                <UserMinus className="size-5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {locked && <p className="mt-2 text-xs text-mist">Torneo finalizado: reabrilo para modificar los equipos.</p>}

      <Dialog open={adding} onOpenChange={(o) => { if (pending) return; setAdding(o); if (!o) setSelected([]); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto rounded-3xl border border-white/10 bg-night p-5 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-chalk">Agregar equipos</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <TeamMultiSelect teams={t.availableTeams} selected={selected} onChange={setSelected} />
            <button
              type="button"
              className={btn.primary}
              disabled={!selected.length || pending}
              onClick={async () => {
                await run(() => addTournamentTeams(t.id, selected), `${selected.length} ${selected.length === 1 ? "equipo agregado" : "equipos agregados"}`);
                setAdding(false);
                setSelected([]);
              }}
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Agregar {selected.length || ""}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`¿Quitar a ${removing?.name}?`}
        description="Deja de participar de este torneo."
        confirmLabel="Quitar"
        destructive
        onConfirm={async () => {
          await run(() => removeTournamentTeam(t.id, removing!.id), "Equipo quitado");
          setRemoving(null);
        }}
      />
    </Card>
  );
}

/* ───────────── Datos y portada ───────────── */

function InfoCard({ t }: { t: AdminTournamentData }) {
  const [run, pending] = useAdminAction();
  const [name, setName] = useState(t.name);
  const [description, setDescription] = useState(t.description ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = name !== t.name || description !== (t.description ?? "");
  const cover = mediaUrl(t.coverPath);

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { blob } = await compressPhoto(file, 1920);
      const path = await uploadImage("media", `tournaments/${t.id}`, blob);
      await run(() => setTournamentCover(t.id, path), "Portada actualizada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card title="Datos del torneo">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-night/50">
          {cover ? (
            <Image src={cover} alt="Portada" fill sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-mist">Sin portada (se usa un fondo generado)</div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-night/70">
              <Loader2 className="size-8 animate-spin text-grass" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className={cn(btn.secondary, "flex-1")} onClick={() => fileRef.current?.click()} disabled={uploading || pending}>
            <ImagePlus className="size-4" /> {cover ? "Cambiar portada" : "Subir portada"}
          </button>
          {cover && (
            <button type="button" className={btn.icon} onClick={() => run(() => setTournamentCover(t.id, null), "Portada quitada")} disabled={pending || uploading} aria-label="Quitar portada">
              {pending ? <Loader2 className="size-5 animate-spin" /> : <X className="size-5" />}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            className="sr-only"
            onChange={(e) => {
              onCover(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        <Field label="Nombre" htmlFor="ti-name">
          <input id="ti-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} />
        </Field>
        <Field label="Descripción" htmlFor="ti-desc" hint={`${description.length}/600`}>
          <textarea id="ti-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} className={textareaClass} />
        </Field>
        {dirty && (
          <button type="button" className={btn.primary} disabled={pending} onClick={() => run(() => updateTournamentInfo(t.id, { name, description }), "Datos guardados")}>
            {pending && <Loader2 className="size-4 animate-spin" />} Guardar datos
          </button>
        )}
        <Link href={`${ADMIN_BASE_PATH}/torneos/${t.id}/fotos`} className="flex min-h-12 items-center justify-between rounded-xl bg-white/5 px-4 text-sm font-semibold text-chalk hover:bg-white/10">
          Fotos del torneo (opcional) <ChevronRight className="size-4 text-mist" />
        </Link>
      </div>
    </Card>
  );
}

/* ───────────── Zona peligrosa ───────────── */

function DangerCard({ t }: { t: AdminTournamentData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <Card title="Zona peligrosa" className="border-destructive/25">
      <p className="mb-3 text-sm text-mist">
        Borrar el torneo elimina sus fechas, cruces, resultados y fotos. El ranking histórico se recalcula sin él.
      </p>
      <button type="button" className={cn(btn.danger, "w-full")} onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> Borrar torneo
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Borrar el torneo?"
        description={`Se eliminan ${t.rounds.length} fechas y ${t.totalMatches} cruces. No se puede deshacer.`}
        confirmLabel="Borrar para siempre"
        destructive
        typeToConfirm={t.name}
        onConfirm={async () => {
          const res = await deleteTournament(t.id, t.name);
          if (!res.ok) return void toast.error(res.error);
          toast.success("Torneo borrado");
          router.replace(`${ADMIN_BASE_PATH}/torneos`);
        }}
      />
    </Card>
  );
}

