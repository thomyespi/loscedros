import { z } from "zod";
import { MODALITIES } from "@/lib/domain/types";
import { normalizeDays, type Weekday } from "@/lib/hours";

const uuid = z.string().uuid({ message: "Identificador inválido" });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Elegí un día válido" });
const halfHour = z.string().regex(/^([01]\d|2[0-3]):(00|30)$/, { message: "Elegí una hora válida" });

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(40, { message: "El nombre puede tener hasta 40 caracteres" }),
});

export const roundDatesSchema = z
  .array(isoDate)
  .min(1, { message: "El torneo necesita al menos una fecha" })
  .max(40, { message: "Demasiadas fechas" })
  .refine((dates) => dates.every((d, i) => i === 0 || d >= dates[i - 1]), {
    message: "Las fechas deben estar en orden cronológico",
  });

export const tournamentInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(60, { message: "El nombre puede tener hasta 60 caracteres" }),
  description: z
    .string()
    .trim()
    .max(600, { message: "La descripción puede tener hasta 600 caracteres" })
    .optional()
    .transform((v) => (v ? v : null)),
});

export const createTournamentSchema = tournamentInfoSchema.extend({
  dates: roundDatesSchema,
  teamIds: z.array(uuid).min(2, { message: "El torneo necesita al menos 2 equipos" }),
});

export const matchSchema = z
  .object({ roundId: uuid, teamAId: uuid, teamBId: uuid })
  .refine((m) => m.teamAId !== m.teamBId, { message: "Un equipo no puede jugar contra sí mismo" });

export const resultSchema = z.object({
  matchId: uuid,
  modality: z.enum(MODALITIES as [string, ...string[]]).transform((m) => m as (typeof MODALITIES)[number]),
  winnerTeamId: uuid.nullable(),
  scoreNote: z
    .string()
    .trim()
    .max(20, { message: "El marcador puede tener hasta 20 caracteres" })
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export const settingsSchema = z.object({
  hours: z
    .object({
      days: z
        .array(z.number().int().min(1).max(7))
        .transform(normalizeDays)
        .pipe(z.array(z.custom<Weekday>()).min(1, { message: "Marcá al menos un día" })),
      opens: halfHour,
      closes: halfHour,
    })
    // "HH:MM" se compara bien como texto.
    .refine((h) => h.closes > h.opens, { message: "La hora de cierre tiene que ser después de la apertura" }),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(
      z.string().regex(/^\d{10,15}$/, {
        message: "Usá el formato internacional sin espacios ni signos, por ejemplo 5491139567637",
      }),
    ),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))
    .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, { message: "Usuario de Instagram inválido" })),
  address: z
    .string()
    .trim()
    .min(5, { message: "Indicá la dirección" })
    .max(160, { message: "Hasta 160 caracteres" }),
});

export const photoMetaSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(140, { message: "El epígrafe puede tener hasta 140 caracteres" })
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

/** Primer mensaje de error legible de un resultado de Zod. */
export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Datos inválidos";
}
