## Context

El sitio es Next 16 (App Router) + Supabase. El panel (`/vestuario`) se renderiza siempre por request (`dynamic = "force-dynamic"`) y cada página carga un "snapshot" completo de la base (`getAdminSnapshot` → 8 consultas en paralelo). Las páginas públicas leen el mismo snapshot desde la Data Cache de Next (tag `PUBLIC_DATA_TAG`), que el admin invalida con `updateTag` al guardar.

Estado actual de cada punto:

- **Pop-up de equipo**: `TeamSheet` (`components/admin/teams-manager.tsx`) usa `<SheetContent side="bottom">`, igual que la edición de info del torneo en `tournament-admin.tsx`. En desktop queda una hoja pegada al borde inferior. Ya existe `components/ui/dialog.tsx` (Base UI) centrado con `top-1/2 left-1/2`.
- **Imágenes de la landing**: ya son archivos estáticos en `public/placeholder/*.webp`, declarados en `content/media.ts`. La única dependencia de la base es la **galería** de la landing: `app/(public)/page.tsx` usa las 8 fotos más recientes de `tournament_photos` y solo cae a `placeholderGallery` si no hay ninguna.
- **Lentitud**: por cada navegación del panel hay `proxy.ts` → `auth.getUser()` (red a Supabase Auth), luego el layout → `requireAdmin` → otro `auth.getUser()` + `rpc("is_admin")`, y recién después las 8 consultas del snapshot. No hay ningún `loading.tsx` en el panel, así que al tocar un link no pasa nada visible hasta que el servidor responde. Tras cada acción, `router.refresh()` repite todo.
- **Estados del torneo**: `changeTournamentStatus` solo valida, al finalizar, que exista al menos un resultado. `en_curso` no tiene ninguna validación. El trigger `check_tournament` solo maneja `finished_at` y el campeón.

## Goals / Non-Goals

**Goals:**
- Formularios del panel en un diálogo centrado, en mobile y desktop.
- Que la landing no dependa de la base para ninguna imagen, y que haya un único lugar documentado para cambiarlas.
- Feedback visual en < 100 ms al tocar cualquier link o botón, y menos latencia real por navegación del panel.
- Reglas de estado del torneo garantizadas en UI, server action y base.

**Non-Goals:**
- Subir imágenes de la landing desde el panel (quedan en el código a propósito).
- Cambiar el modelo de fotos de torneos, avatares o portadas (siguen en Storage).
- Reescribir el panel con UI optimista general o cambiar a otro esquema de caché del snapshot del admin.
- Validar cantidad de cruces por fecha más allá de "al menos uno" (puede haber equipos libres).

## Decisions

### 1. Diálogo centrado en lugar de hoja inferior
Reemplazar `Sheet side="bottom"` por `Dialog` de `components/ui/dialog.tsx` en `TeamSheet` y en el editor de info del torneo. El `DialogContent` se configura con `max-h-[calc(100dvh-2rem)] overflow-y-auto` y un ancho `sm:max-w-lg` para que formularios largos (con recorte de avatar) hagan scroll dentro del diálogo y nunca queden fuera de pantalla. En mobile el diálogo ocupa casi todo el ancho (`max-w-[calc(100%-2rem)]`).
- *Alternativa*: dejar la hoja en mobile y diálogo en desktop. Descartada: el pedido es explícito ("no en el centro") y un solo patrón es más simple de mantener.
- El `standings-table.tsx` (sitio público) también usa hoja inferior; se deja como está porque es un detalle de lectura, no un formulario. Si el usuario lo quiere igual, es el mismo cambio.
- El teclado virtual del celular: el diálogo centrado con `dvh` se reacomoda; se verifica en la revisión visual del usuario.

### 2. Imágenes de la landing: solo `public/landing/` + `content/media.ts`
- Renombrar `public/placeholder/` → `public/landing/` y actualizar el helper `img()` en `content/media.ts`.
- La galería de la landing usa siempre `landingGallery` (hoy `placeholderGallery`) de `content/media.ts`; se elimina el uso de `getRecentPhotos` en `app/(public)/page.tsx`. Si `getRecentPhotos` queda sin uso, se borra de `lib/data/selectors.ts`.
- `content/media.ts` queda como índice único: para cambiar una imagen se reemplaza el archivo en `public/landing/` (mismo nombre) o se cambia `src`/`width`/`height`/`alt` ahí. `credit` pasa a ser opcional por imagen: las fotos propias del club no llevan crédito y la página `/creditos` solo lista las que lo tienen (ya filtra por `title`; hay que quitar el `!` que asume que siempre existe).
- README: sección "Imágenes de la landing" con la tabla imagen → sección donde se ve → archivo.
- *Alternativa*: mantener "fotos de torneos si hay, si no muestras". Descartada por el pedido: la base es solo para torneos, equipos y config; la landing es contenido fijo del sitio.

### 3. Respuesta inmediata
Tres capas, de mayor a menor impacto percibido:
1. **`loading.tsx`** en `app/vestuario/(panel)/` (y en los segmentos con datos pesados: `torneos/[id]`, `torneos/[id]/fechas/[n]`, `equipos`) y en `app/(public)/` (`torneos`, `torneos/[slug]`, `equipos/[slug]`). Con esto la navegación muestra un esqueleto al instante mientras el servidor responde. Antes de escribir, leer la guía de `loading`/streaming en `node_modules/next/dist/docs/` porque Next 16 puede diferir.
2. **Links con estado pendiente**: en `admin-nav.tsx`, `bottom-nav.tsx` y el header público, usar `useLinkStatus` (si existe en esta versión; confirmarlo en las docs) para mostrar un indicador en el link tocado.
3. **Botones**: `useRun` en `tournament-admin.tsx` ya maneja `pending`; unificar para que todos los botones que disparan server actions (equipos, fotos, fechas, club) usen `useTransition` y queden deshabilitados con spinner desde el primer toque, incluyendo el `router.refresh()` posterior (hoy `pending` se apaga antes de que termine el refresh, y la pantalla queda "congelada" un rato con datos viejos).

Latencia real del panel:
- `proxy.ts`: reemplazar `auth.getUser()` por `auth.getClaims()` (verificación local del JWT con claves asimétricas, sin ida y vuelta a Auth cuando el proyecto usa signing keys). Solo decide si redirigir al login; la seguridad real sigue en `requireAdmin` + RLS.
- `requireAdmin`: mantener `getUser()` + `is_admin` (es la barrera de seguridad), pero ya está deduplicado por request con `cache`; revisar que ninguna página lo invoque fuera de ese cache.
- *Alternativa*: cachear el snapshot del admin. Descartada: el admin necesita ver siempre datos frescos y el volumen es chico; el cuello está en la cantidad de viajes en serie, no en el tamaño.
- Medir en build de producción (`next build && next start`), no en `next dev`, que compila rutas bajo demanda y exagera la lentitud. Si la región de la función en Vercel no coincide con la del proyecto Supabase, cada consulta suma decenas de ms: se verifica y, si difiere, se configura `regions` en `vercel.json`.

### 4. Reglas de estado del torneo
Una sola función pura compartida, `tournamentReadiness(snapshot, tournamentId)` en `lib/domain/` (o `lib/standings/`), que devuelve:
- `canStart`: la Fecha 1 tiene al menos un cruce.
- `canFinish`: todas las fechas tienen al menos un cruce y todos los cruces tienen los 3 resultados.
- `reason`: texto para mostrar ("Armá los cruces de la Fecha 1 para arrancar", "Faltan resultados en la Fecha 3 (2 cruces)", "La Fecha 4 no tiene cruces").

Se usa en tres lugares:
- **UI** (`StatusCard`): el botón "Arrancar torneo"/"Publicar en juego"/"Finalizar torneo" queda deshabilitado y debajo se muestra `reason` con un link a la fecha afectada. El diálogo de confirmación de finalizar ya no muestra el aviso de "cruces incompletos" porque ese caso no puede ocurrir.
- **Server action** `changeTournamentStatus`: vuelve a calcular con el snapshot y rechaza con `reason`.
- **Base**: nueva migración que extiende `check_tournament()` para que, **solo cuando el estado cambia** (`tg_op = 'INSERT'` o `old.status is distinct from new.status`):
  - a `en_curso` desde `borrador`/`proximo`: exista algún `matches` en la ronda `number = 1` del torneo;
  - a `finalizado`: no exista ronda sin cruces ni cruce con menos de 3 `match_results`.
  Reabrir (`finalizado` → `en_curso`) pasa la regla de inicio porque ya había cruces.
- Una vez en juego, borrar o editar cruces sigue permitido (pedido explícito: "después se puede editar").
- *Alternativa*: validar solo en la app. Descartada para mantener el criterio del proyecto: "reglas de integridad que la base garantiza aunque la app falle".

## Risks / Trade-offs

- [La galería de la landing ya no muestra fotos reales de torneos] → Es lo pedido; las fotos siguen en cada torneo. Hay que reemplazar las imágenes de muestra por fotos del club en `public/landing/` para que la landing no quede con fotos de otros lugares.
- [`getClaims()` hace llamada de red si el proyecto sigue con JWT secret simétrico (HS256)] → Verificar el tipo de clave en Supabase; si es simétrica, no empeora nada y se puede migrar a signing keys desde el dashboard.
- [Torneos existentes en `en_curso` sin cruces o `finalizado` incompletos] → El trigger solo valida en el cambio de estado, así que los datos existentes no rompen. Se revisa con una consulta antes de aplicar la migración y se informa al usuario si hay alguno.
- [Trigger con consultas extra al cambiar estado] → Se ejecuta solo en transiciones, que son raras; costo despreciable.
- [`loading.tsx` en el segmento raíz del panel hace que el layout no espere] → Correcto y deseado; el layout sigue validando al admin.

## Migration Plan

1. Consulta previa en Supabase: torneos `en_curso` sin cruces en Fecha 1 y `finalizado` con fechas incompletas (solo informativo).
2. Aplicar la migración del trigger (`supabase/migrations/2026092700000X_tournament_status_rules.sql`) y correr `npm run db:verify`.
3. Deploy del código. Rollback: revertir el deploy; la migración se revierte recreando `check_tournament()` desde `20260926000002_integrity.sql`.

## Open Questions

- ¿La hoja inferior de la tabla de posiciones pública (detalle de un equipo) también debería pasar a diálogo centrado? Por ahora queda fuera.
- ¿Hay ya fotos reales del club para reemplazar las de muestra en `public/landing/`? Si las hay, se pueden sumar en este mismo cambio.
