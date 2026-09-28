"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/app/vestuario/(panel)/club/actions";
import type { SiteSettings } from "@/lib/domain/types";
import { formatPhone } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";
import { Card, Field, StickyActions, btn, inputClass } from "./ui";

/** Solo los campos de texto: el mapa se guarda aparte, desde su propia tarjeta. */
type ClubInfo = Omit<SiteSettings, "courseMap">;
type Errors = Partial<Record<keyof ClubInfo, string>>;

export function SettingsForm({ initial }: { initial: ClubInfo }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, startTransition] = useTransition();
  const dirty = (Object.keys(initial) as (keyof ClubInfo)[]).some((k) => values[k] !== initial[k]);

  const set = (k: keyof ClubInfo) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

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
        <Field label="Horarios de apertura" htmlFor="s-hours" error={errors.openingHours} hint='Por ejemplo: "Todos los días de 9 a 19 h"'>
          <input id="s-hours" value={values.openingHours} onChange={set("openingHours")} maxLength={80} className={inputClass} aria-invalid={!!errors.openingHours} />
        </Field>
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
