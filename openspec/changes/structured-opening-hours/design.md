## Context

Hoy `site_settings.opening_hours` es un `text` (3 a 80 caracteres) que el admin escribe a mano en `/vestuario/club`. Se muestra tal cual en La cancha, Cómo llegar y el footer. El hero lo "comprime" con una regex (`compactHours`) que solo entiende horas enteras ("9 a 19") y rompe con "10 a 16:30". Además `content/landing.ts` tiene el horario escrito a mano en dos lugares: el destacado `{ value: 10, suffix: " h", label: "abierto cada día" }` de El club y la tarjeta "Abierto todos los días" de La cancha. El JSON-LD de la home no incluye horario.

El horario real es miércoles a domingo, de 10:00 a 16:30, con el mismo rango todos los días.

## Goals / Non-Goals

**Goals:**
- Un único dato estructurado (días + apertura + cierre) como fuente de todos los textos de horario del sitio.
- Edición en el panel sin texto libre: días marcables y selectores de hora.
- Textos en español rioplatense, naturales para rangos contiguos ("Miércoles a domingo") y para días sueltos ("Lunes, miércoles y viernes").

**Non-Goals:**
- Horarios distintos por día (ej. sábado hasta más tarde). Un solo rango para todos los días abiertos.
- Feriados, cierres por lluvia o excepciones puntuales.
- Indicador "Abierto ahora / Cerrado".

## Decisions

### 1. Modelo de datos: `open_days smallint[]` + `opens_at time` + `closes_at time`

Días con numeración ISO (1 = lunes … 7 = domingo), porque la semana del club se piensa de lunes a domingo y simplifica ordenar y detectar rangos. Checks en la base: `open_days` no vacío, valores entre 1 y 7 (`open_days <@ '{1,2,3,4,5,6,7}'`, `cardinality(open_days) >= 1`), `closes_at > opens_at`. En el código se normaliza (sin repetidos, ordenado) antes de guardar.

- *Alternativa*: `jsonb` con un rango por día. Más flexible, pero nadie lo pidió y complica el panel y el formateo. Si en el futuro hace falta, se migra desde este modelo sin perder datos.
- *Alternativa*: bitmask `int`. Más compacto, pero ilegible en el SQL editor de Supabase.

En TypeScript: `SiteSettings.hours: { days: Weekday[]; opens: string; closes: string }` con `Weekday = 1..7` y horas `"HH:MM"`. El mapper recorta los segundos que devuelve Postgres (`"10:00:00"` → `"10:00"`).

### 2. Migración en dos pasos

`20260929000001_structured_hours.sql` agrega las tres columnas con default (`{3,4,5,6,7}`, `10:00`, `16:30`), así la fila existente queda con el horario real. Se aplica antes del deploy: el código publicado sigue leyendo `opening_hours` y el build nuevo ya encuentra las columnas. `20260929000002_drop_opening_hours.sql` borra `opening_hours` y se aplica después del deploy. No se intenta parsear el texto viejo.

Como el cliente público cachea las respuestas (`force-cache`, 1 h), puede llegar una fila guardada antes de la migración: el mapper usa entonces el horario por defecto.

### 3. Formateo centralizado en `lib/hours.ts`

Funciones puras, testeables:
- `formatDays(days)`: 7 días → "Todos los días"; rango contiguo de 3 o más → "Miércoles a domingo"; dos días → "Sábado y domingo"; sueltos → "Lunes, miércoles y viernes". Un rango que cruza el domingo (ej. vie, sáb, dom, lun) se trata como contiguo empezando por el día que sigue al hueco más largo ("Viernes a lunes").
- `formatTime("16:30")` → "16:30"; `formatTime("10:00")` → "10".
- `formatHours(h)` → "Miércoles a domingo, de 10 a 16:30 h".
- `formatHoursShort(h)` → "10–16:30 h" (hero).
- `openDaysTitle(h)` → "Abierto todos los días" o "Abierto de miércoles a domingo" (con el día en minúscula dentro de la frase).
- `toOpeningHoursSpec(h)` → objeto `OpeningHoursSpecification` de schema.org (`dayOfWeek` con URLs `https://schema.org/Wednesday`, `opens`, `closes`).

Así ningún componente arma textos de horario por su cuenta, y `compactHours` desaparece.

### 4. Panel: botones de días + `<select>` de horas cada 30 minutos

- Días: 7 botones tipo toggle (`aria-pressed`) con etiqueta corta "Lun … Dom", en una fila que entra en 360 px. Consistentes con los estilos de `components/admin/ui`.
- Horas: dos `<select>` nativos ("Abre" / "Cierra") con opciones de 06:00 a 23:30 cada 30 minutos. Se prefiere `<select>` a `<input type="time">` porque se ve y se comporta igual en todos los celulares y evita horas "raras" (10:07).
- Debajo, una vista previa: "En el sitio se va a ver: Miércoles a domingo, de 10 a 16:30 h".
- Validación con zod en `settingsSchema` (compartida por el formulario y la server action): al menos un día, horas con formato `HH:MM` en pasos de 30, cierre posterior a la apertura. El `dirty` del formulario compara por valor (arrays ordenados), no por referencia.

### 5. Contenido derivado en la landing

`content/landing.ts` sigue teniendo los textos fijos, pero los ítems que dependen del horario se marcan para que el componente los complete:
- El club: el destacado pasa a `{ value: <cantidad de días>, label: "días abiertos por semana" }` (con 1 día, "día abierto por semana"). `Club` recibe `hours` como prop.
- La cancha: la tarjeta de reloj usa `openDaysTitle(hours)` como título y su texto pasa a "Vení cuando quieras entre las {apertura} y las {cierre}; solo avisanos."

`app/(public)/page.tsx` pasa `settings.hours` a Hero, Club y Course; Location y el footer ya reciben `settings`.

## Risks / Trade-offs

- [La migración elimina `opening_hours`: si se despliega el código viejo contra la base nueva, el sitio falla al mapear] → aplicar la migración y el deploy en la misma ventana; el código nuevo no depende de la columna vieja.
- [Un solo rango para todos los días: si el club abre distinto el fin de semana, no se puede expresar] → aceptado por ahora (no-goal); el modelo permite migrar a rangos por día.
- [Pasos de 30 minutos: una hora como 16:45 no se puede cargar] → suficiente para el club; ampliar a 15 minutos es cambiar una constante.
- [Rango que cruza la medianoche (ej. 20 a 02)] → no soportado; la validación exige cierre posterior a apertura.

## Migration Plan

1. Crear `supabase/migrations/2026092900000x_structured_hours.sql` (agregar columnas con default y checks, `drop column opening_hours`).
2. Actualizar `database.types.ts`, mappers, defaults y datos demo.
3. Aplicar la migración en Supabase y desplegar el código.
4. Rollback: una migración inversa que vuelva a agregar `opening_hours text` con el texto armado por `formatHours` y revierta el código.

## Open Questions

- Ninguna bloqueante. Se asume el mismo rango horario para todos los días abiertos (confirmado por el horario actual: miércoles a domingo de 10 a 16:30).
