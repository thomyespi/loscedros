## 1. Base de datos y tipos

- [x] 1.1 Nueva migración `supabase/migrations/20260929000001_structured_hours.sql`: agregar a `site_settings` `open_days smallint[] not null default '{3,4,5,6,7}'` (check `cardinality(open_days) >= 1 and open_days <@ '{1,2,3,4,5,6,7}'`), `opens_at time not null default '10:00'`, `closes_at time not null default '16:30'` (check `closes_at > opens_at`) y `drop column opening_hours`
- [x] 1.2 Actualizar `lib/supabase/database.types.ts` (Row/Insert/Update de `site_settings`: sale `opening_hours`, entran `open_days`, `opens_at`, `closes_at`)
- [x] 1.3 Correr `npm run db:verify` y ajustar el script si referencia `opening_hours`

## 2. Modelo y formateo del horario

- [x] 2.1 Crear `lib/hours.ts` con `Weekday` (1–7, ISO), `OpeningHours { days; opens; closes }`, nombres de días, `TIME_OPTIONS` (06:00 a 23:30 cada 30 min) y `normalizeDays` (sin repetidos, ordenado)
- [x] 2.2 Implementar `formatDays`, `formatTime`, `formatHours`, `formatHoursShort`, `openDaysTitle` y `toOpeningHoursSpec` según el design (rangos contiguos, rango que cruza el domingo, dos días, días sueltos, todos los días)
- [x] 2.3 Tests unitarios en `tests/unit/hours.test.ts`: mié–dom 10–16:30, todos los días 9–19, sáb y dom, lun/mié/vie, vie–lun, un solo día, horas en punto vs. con minutos, spec de schema.org
- [x] 2.4 Reemplazar `openingHours: string` por `hours: OpeningHours` en `SiteSettings` (`lib/domain/types.ts`), armarlo en `toSettings` (`lib/data/mappers.ts`, recortando segundos de `time`) y poner mié–dom 10:00–16:30 en `DEFAULT_SETTINGS` (`lib/settings.ts`); verificar que los datos demo lo tomen

## 3. Validación y panel

- [x] 3.1 En `lib/validation.ts`, reemplazar `openingHours` por `hours`: `days` (al menos uno, valores 1–7, normalizado), `opens`/`closes` (`HH:MM` en pasos de 30) y `refine` de cierre posterior a apertura con mensajes en español; actualizar `tests/unit/utils.test.ts`
- [x] 3.2 En `app/vestuario/(panel)/club/actions.ts`, `saveSettings` recibe `hours` y guarda `open_days`, `opens_at`, `closes_at`
- [x] 3.3 En `components/admin/settings-form.tsx`, reemplazar el input de texto por: 7 botones toggle "Lun … Dom" (`aria-pressed`, entran en 360 px), dos `<select>` "Abre" / "Cierra" con `TIME_OPTIONS`, y la vista previa "En el sitio se va a ver: …" con `formatHours`; mostrar los errores de días y horas
- [x] 3.4 Ajustar el cálculo de `dirty` para comparar `hours` por valor (días ordenados + horas)

## 4. Landing

- [x] 4.1 `components/landing/hero.tsx`: recibir `hours` y mostrar `formatHoursShort(hours)` en el dato "Horario"; borrar `compactHours`
- [x] 4.2 `components/landing/club.tsx` + `content/landing.ts`: reemplazar el destacado "10 h abierto cada día" por la cantidad de días abiertos ("días abiertos por semana" / "día abierto por semana"); `Club` recibe `hours`
- [x] 4.3 `components/landing/course.tsx` + `content/landing.ts`: la tarjeta de reloj usa `openDaysTitle(hours)` y el texto "Vení cuando quieras entre las {apertura} y las {cierre}; solo avisanos."; el bloque "Horarios" usa `formatHours`
- [x] 4.4 `components/landing/location.tsx` y `components/layout/site-footer.tsx`: mostrar `formatHours(settings.hours)`
- [x] 4.5 `app/(public)/page.tsx`: pasar `settings.hours` a Hero, Club y Course, y sumar `openingHoursSpecification: toOpeningHoursSpec(settings.hours)` al JSON-LD
- [x] 4.6 Buscar en `app/`, `components/`, `content/` y `lib/` que no quede ningún `openingHours` ni texto de días/horas de apertura escrito a mano (por ejemplo "todos los días", "9 a 19")

## 5. Cierre

- [x] 5.1 Actualizar el README (tabla de qué se edita desde el panel: "Horarios" ahora son días y horas)
- [x] 5.2 Correr `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`
- [x] 5.3 Aplicar en Supabase `20260929000001_structured_hours.sql` (solo agrega columnas; el sitio publicado sigue andando). El mapper usa el horario por defecto si recibe una fila cacheada sin las columnas nuevas
- [x] 5.4 Después del deploy, aplicar `20260929000002_drop_opening_hours.sql` (borra `opening_hours`)
