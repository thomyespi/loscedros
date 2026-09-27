"use client";

import { ArrowLeft, ArrowRight, Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createTournament } from "@/app/vestuario/(panel)/torneos/actions";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { formatLong } from "@/lib/dates";
import type { Team } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { roundDatesSchema, tournamentInfoSchema } from "@/lib/validation";
import { TeamMultiSelect } from "./team-multi-select";
import { Field, StickyActions, btn, inputClass, textareaClass } from "./ui";

const STEPS = ["Datos", "Fechas", "Equipos"] as const;

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function TournamentWizard({ teams, today }: { teams: Pick<Team, "id" | "name" | "avatarPath">[]; today: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dates, setDates] = useState<string[]>([addDays(today, 7)]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(s: number) {
    if (s === 0) {
      const r = tournamentInfoSchema.safeParse({ name, description });
      return r.success ? null : r.error.issues[0].message;
    }
    if (s === 1) {
      const r = roundDatesSchema.safeParse(dates);
      return r.success ? null : r.error.issues[0].message;
    }
    return teamIds.length >= 2 ? null : "El torneo necesita al menos 2 equipos";
  }

  function next() {
    const e = validate(step);
    setError(e);
    if (!e) setStep((s) => s + 1);
  }

  async function submit() {
    const e = validate(2);
    setError(e);
    if (e) return;
    setSaving(true);
    const res = await createTournament({ name, description, dates, teamIds });
    if (!res.ok) {
      setSaving(false);
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Torneo creado como borrador");
    router.push(`${ADMIN_BASE_PATH}/torneos/${res.data.id}`);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progreso */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Pasos">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-col gap-1.5">
            <span className={cn("h-1.5 rounded-full", i <= step ? "bg-grass" : "bg-white/10")} />
            <span className={cn("text-xs font-semibold", i === step ? "text-chalk" : "text-mist")}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Nombre del torneo" htmlFor="t-name" hint="Por ejemplo: Apertura 2027">
            <input id="t-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} autoFocus />
          </Field>
          <Field label="Descripción (opcional)" htmlFor="t-desc" hint={`${description.length}/600`}>
            <textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} className={textareaClass} />
          </Field>
          <p className="text-xs text-mist">La portada la podés agregar después, desde la pantalla del torneo.</p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-pitch p-3">
            <span className="font-semibold text-chalk">Cantidad de fechas</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={cn(btn.icon, "border border-white/15")}
                onClick={() => setDates((d) => (d.length > 1 ? d.slice(0, -1) : d))}
                disabled={dates.length <= 1}
                aria-label="Quitar fecha"
              >
                <Minus className="size-5" />
              </button>
              <span className="font-display tabular w-8 text-center text-3xl text-chalk">{dates.length}</span>
              <button
                type="button"
                className={cn(btn.icon, "border border-white/15")}
                onClick={() => setDates((d) => [...d, addDays(d.at(-1) ?? today, 14)])}
                disabled={dates.length >= 40}
                aria-label="Agregar fecha"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {dates.map((d, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-pitch p-3">
                <span className="font-display w-20 shrink-0 text-2xl text-grass">Fecha {i + 1}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <input
                    type="date"
                    value={d}
                    onChange={(e) => setDates((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
                    className={inputClass}
                    aria-label={`Día de la fecha ${i + 1}`}
                  />
                  {d && <span className="text-xs text-mist capitalize">{formatLong(d)}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 2 &&
        (teams.length < 2 ? (
          <p className="rounded-2xl border border-cedar/40 bg-cedar/10 p-4 text-sm text-chalk">
            Necesitás al menos 2 equipos activos. Crealos primero en la sección Equipos.
          </p>
        ) : (
          <TeamMultiSelect teams={teams} selected={teamIds} onChange={setTeamIds} />
        ))}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <StickyActions>
        {step > 0 ? (
          <button type="button" className={btn.secondary} onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={saving}>
            <ArrowLeft className="size-4" /> Atrás
          </button>
        ) : (
          <button type="button" className={btn.secondary} onClick={() => router.back()}>
            Cancelar
          </button>
        )}
        {step < 2 ? (
          <button type="button" className={btn.primary} onClick={next}>
            Siguiente <ArrowRight className="size-4" />
          </button>
        ) : (
          <button type="button" className={btn.primary} onClick={submit} disabled={saving || teamIds.length < 2}>
            {saving && <Loader2 className="size-4 animate-spin" />} Crear torneo
          </button>
        )}
      </StickyActions>
    </div>
  );
}
