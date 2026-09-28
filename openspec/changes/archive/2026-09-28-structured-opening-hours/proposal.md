## Why

El horario real del club es de miércoles a domingo, de 10 a 16:30 h, pero el sitio muestra "Todos los días de 9 a 19 h". Además, varios textos de la landing tienen el horario escrito a mano ("Abierto todos los días", "10 h abierto cada día") y el hero intenta adivinar el rango leyendo el texto libre. Si el horario vive en un solo dato estructurado (días + hora de apertura + hora de cierre), cualquier cambio desde el panel se refleja igual en toda la página.

## What Changes

- **BREAKING (datos)**: el horario deja de ser texto libre. `site_settings` guarda los días de apertura (lista de días de la semana) y las horas de apertura y cierre. La columna `opening_hours` se elimina.
- **Valor inicial**: miércoles a domingo, de 10:00 a 16:30.
- **Panel `/vestuario/club`**: la tarjeta "Horarios" pasa a tener 7 botones para marcar los días (Lun a Dom) y dos selectores de hora (abre / cierra, cada 30 minutos), con una vista previa de cómo se va a leer en el sitio. Valida que haya al menos un día y que el cierre sea posterior a la apertura.
- **Un solo formateador** arma todos los textos del horario a partir del dato: "Miércoles a domingo, de 10 a 16:30 h", la versión corta del hero ("10–16:30 h") y el título de días ("Abierto de miércoles a domingo" / "Abierto todos los días").
- **La landing deja de tener horarios escritos a mano**:
  - Hero: el dato "Horario" sale del formateador (se elimina `compactHours`).
  - El club: el destacado "10 h abierto cada día" pasa a ser la cantidad de días abiertos por semana.
  - La cancha: la tarjeta "Abierto todos los días" usa los días reales; el texto de horarios usa el formateador.
  - Cómo llegar y footer: usan el formateador.
  - Datos estructurados (JSON-LD): se suma `openingHoursSpecification` con los días y horas reales.

## Capabilities

### New Capabilities
<!-- Ninguna -->

### Modified Capabilities
- `site-settings`: el horario pasa de texto libre a días de la semana + hora de apertura + hora de cierre, con valor inicial miércoles a domingo de 10 a 16:30, y se edita con selectores. Todos los textos del horario del sitio salen de ese dato.
- `landing-page`: hero, El club, La cancha, Cómo llegar, footer y JSON-LD muestran el horario derivado de la configuración; ningún texto de la landing tiene días u horas escritos a mano.

## Impact

- **Base de datos**: nueva migración que agrega `open_days smallint[]`, `opens_at time` y `closes_at time` a `site_settings` (con checks), carga miércoles a domingo 10:00–16:30 y elimina `opening_hours`.
- **Código**: `lib/hours.ts` (nuevo: tipos y formateo), `lib/domain/types.ts`, `lib/data/mappers.ts`, `lib/settings.ts`, `lib/validation.ts`, `lib/demo/data.ts`, `lib/supabase/database.types.ts`, `app/vestuario/(panel)/club/actions.ts`, `components/admin/settings-form.tsx`, `components/landing/hero.tsx`, `club.tsx`, `course.tsx`, `location.tsx`, `components/layout/site-footer.tsx`, `app/(public)/page.tsx`, `content/landing.ts`, tests unitarios.
- **Sin cambios** en torneos, ranking, permisos ni Storage.
