"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/app/vestuario/(panel)/club/actions";
import type { SiteSettings } from "@/lib/domain/types";
import { TIME_OPTIONS, WEEKDAYS, formatHours, formatTime, normalizeDays, sameHours, type OpeningHours, type Weekday } from "@/lib/hours";
import { formatPhone } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { settingsSchema } from "@/lib/validation";
import { Card, Field, StickyActions, btn, inputClass } from "./ui";

/** Solo los campos de texto: el mapa se guarda aparte, desde su propia tarjeta. */
type ClubInfo = Omit<SiteSettings, "courseMap">;
type Errors = Partial<Record<keyof ClubInfo, string>>;
type TextKey = "whatsapp" | "instagram" | "address";

export function SettingsForm({ initial }: { initial: ClubInfo }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, startTransition] = useTransition();
  const dirty =
    !sameHours(values.hours, initial.hours) || (["whatsapp", "instagram", "address"] as const).some((k) => values[k] !== initial[k]);

  const set = (k: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const setHours = (patch: Partial<OpeningHours>) => setValues((v) => ({ ...v, hours: { ...v.hours, ...patch } }));
  const toggleDay = (d: Weekday) =>
    setHours({ days: values.hours.days.includes(d) ? values.hours.days.filter((x) => x !== d) : normalizeDays([...values.hours.days, d]) });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = settingsSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as keyof ClubInfo] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    // En transición: "Guardar" queda con el spinner hasta que termina el refresh.
    startTransition(async () => {
      const res = await saveSettings(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Datos del club guardados");
      startTransition(() => {
        setValues(parsed.data);
        router.refresh();
      });
    });
  }

  const digits = values.whatsapp.replace(/\D/g, "");

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Card title="Horarios">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p id="s-days" className="text-sm font-medium text-chalk">
              Días abiertos
            </p>
            <div role="group" aria-labelledby="s-days" className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map(({ day, name, short }) => {
                const on = values.hours.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    aria-label={name}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "h-12 rounded-xl border text-sm font-semibold transition active:scale-[0.97]",
                      on ? "border-grass bg-grass text-night" : "border-white/12 bg-night/60 text-mist hover:text-chalk",
                    )}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Abre" htmlFor="s-opens">
              <select id="s-opens" value={values.hours.opens} onChange={(e) => setHours({ opens: e.target.value })} className={inputClass}>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)} h
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cierra" htmlFor="s-closes">
              <select id="s-closes" value={values.hours.closes} onChange={(e) => setHours({ closes: e.target.value })} className={inputClass}>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)} h
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {errors.hours ? (
            <p className="text-sm text-destructive">{errors.hours}</p>
          ) : values.hours.days.length > 0 ? (
            <p className="text-xs text-mist">
              En el sitio se va a ver: <span className="font-semibold text-chalk">{formatHours(values.hours)}</span>
            </p>
          ) : null}
        </div>
      </Card>
      <Card title="Contacto">
        <div className="flex flex-col gap-4">
          <Field
            label="WhatsApp"
            htmlFor="s-wa"
            error={errors.whatsapp}
            hint={digits.length >= 10 ? `Se verá como ${formatPhone(digits)}` : "Formato internacional: 54 9 11 + número"}
          >
            <input id="s-wa" inputMode="tel" value={values.whatsapp} onChange={set("whatsapp")} className={inputClass} aria-invalid={!!errors.whatsapp} />
          </Field>
          <Field label="Instagram" htmlFor="s-ig" error={errors.instagram} hint="Solo el usuario, sin @">
            <input id="s-ig" value={values.instagram} onChange={set("instagram")} autoCapitalize="none" className={inputClass} aria-invalid={!!errors.instagram} />
          </Field>
        </div>
      </Card>
      <Card title="Ubicación">
        <Field label="Dirección" htmlFor="s-addr" error={errors.address} hint="Se usa para el mapa y el botón «Cómo llegar».">
          <input id="s-addr" value={values.address} onChange={set("address")} maxLength={160} className={inputClass} aria-invalid={!!errors.address} />
        </Field>
      </Card>
      <StickyActions>
        <button type="submit" className={btn.primary} disabled={!dirty || saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Guardar
        </button>
      </StickyActions>
    </form>
  );
}
