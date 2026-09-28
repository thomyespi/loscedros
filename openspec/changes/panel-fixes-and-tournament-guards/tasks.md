## 1. Diálogos centrados en el panel

- [x] 1.1 En `components/admin/teams-manager.tsx`, reemplazar `Sheet`/`SheetContent side="bottom"` de `TeamSheet` por `Dialog`/`DialogContent` de `components/ui/dialog.tsx`, con `sm:max-w-lg`, `max-h-[calc(100dvh-2rem)] overflow-y-auto` y los mismos estilos de fondo (`bg-night`, borde)
- [x] 1.2 Mantener el bloqueo de cierre mientras guarda (`onOpenChange` ignora el cierre si `saving`) y verificar que el `ConfirmDialog` anidado sigue funcionando dentro del diálogo
- [x] 1.3 Hacer el mismo cambio en el editor de datos del torneo de `components/admin/tournament-admin.tsx` (hoja inferior actual en la línea ~305)
- [x] 1.4 Confirmar con grep que no quedan `side="bottom"` en `components/admin/`

## 2. Imágenes de la landing en el código

- [x] 2.1 Mover `public/placeholder/*` a `public/landing/` (con `git mv`) y actualizar el helper `img()` de `content/media.ts`
- [x] 2.2 Hacer `credit` opcional en `content/media.ts`, renombrar `placeholderGallery` → `landingGallery` y ajustar `allCredits` para no asumir que siempre hay crédito
- [x] 2.3 En `app/(public)/page.tsx`, usar siempre `landingGallery` en la galería y quitar la lectura de `getRecentPhotos`/`mediaUrl`
- [x] 2.4 Borrar `getRecentPhotos` de `lib/data/selectors.ts` si quedó sin uso
- [x] 2.5 Grep de `placeholder/` en todo el repo (OG images, créditos, README, seed) y actualizar las referencias
- [x] 2.6 Agregar al README la sección "Imágenes de la landing": tabla imagen → sección → archivo, y cómo reemplazarlas (mismo nombre o editar `content/media.ts`)

## 3. Reglas de estado del torneo

- [x] 3.1 Crear la función pura `tournamentReadiness` (p. ej. en `lib/domain/readiness.ts`) que, dado rondas, cruces y resultados de un torneo, devuelva `canStart`, `canFinish`, `reason` y la fecha a completar
- [x] 3.2 Tests unitarios en `tests/unit/readiness.test.ts`: Fecha 1 sin cruces, Fecha 1 con cruces y resto vacías, fecha intermedia sin cruces, cruce con 2 de 3 resultados, todo completo
- [x] 3.3 En `changeTournamentStatus` (`app/vestuario/(panel)/torneos/actions.ts`), validar con `tournamentReadiness` antes de pasar a `en_curso` (desde `borrador`/`proximo`) y a `finalizado`, devolviendo `reason` como error; quitar el chequeo viejo de "no hay resultados"
- [x] 3.4 Pasar `canStart`, `canFinish`, `reason` y la fecha afectada a `AdminTournamentData` desde `app/vestuario/(panel)/torneos/[id]/page.tsx`
- [x] 3.5 En `StatusCard`, deshabilitar los botones de transición no permitidos y mostrar el motivo con un link a `fechas/[n]`; quitar del diálogo de finalizar el aviso de cruces incompletos
- [x] 3.6 Nueva migración `supabase/migrations/20260927000001_tournament_status_rules.sql` que recrea `check_tournament()` sumando las reglas, evaluadas solo cuando cambia el estado (INSERT o `old.status is distinct from new.status`), con mensajes `P0001` en castellano
- [x] 3.7 Correr `npm run db:verify` y agregar casos a la verificación de migraciones si el script lo permite (arrancar sin cruces falla, finalizar incompleto falla, reabrir funciona)
- [x] 3.8 Revisar el seed/datos demo (`supabase/seed.sql`, `lib/demo/data.ts`) para que ningún torneo `en_curso`/`finalizado` viole las reglas nuevas
- [x] 3.9 Antes del deploy, consultar en Supabase si hay torneos existentes que ya violan las reglas e informarlo

## 4. Respuesta inmediata y latencia

- [x] 4.1 Leer en `node_modules/next/dist/docs/` las guías de `loading.js`/streaming y de `useLinkStatus` (confirmar que existe en Next 16.3) antes de escribir código
- [x] 4.2 Agregar `loading.tsx` con esqueletos (usando `components/ui/skeleton.tsx`) en `app/vestuario/(panel)/` y en `torneos`, `torneos/[id]`, `torneos/[id]/fechas/[n]`, `equipos` y `club`
- [x] 4.3 Agregar `loading.tsx` en las rutas públicas sin uno: `app/(public)/torneos`, `torneos/[slug]` y `equipos/[slug]`
- [x] 4.4 Indicador de carga en el link tocado en `components/admin/admin-nav.tsx`, `components/layout/bottom-nav.tsx` y `components/layout/site-header.tsx`
- [x] 4.5 Unificar el manejo de acciones del panel: botones deshabilitados con spinner desde el primer toque hasta que termina el `router.refresh()` (envolver en `useTransition`) en `tournament-admin.tsx`, `teams-manager.tsx`, `photos-manager.tsx`, `round-manager.tsx` y `settings-form.tsx`
- [x] 4.6 En `proxy.ts`, reemplazar `auth.getUser()` por `auth.getClaims()` para decidir la redirección al login; dejar `requireAdmin` con `getUser()` + `is_admin`
- [x] 4.7 Verificar que la región de las funciones en Vercel coincida con la del proyecto Supabase; si no, configurar `regions` en `vercel.json`

## 5. Verificación

- [x] 5.1 `npm run typecheck`, `npm run lint` y `npm test` sin errores
- [x] 5.2 `npm run build` sin errores ni warnings nuevos
- [x] 5.3 Pedirle al usuario la revisión visual: diálogo de equipo centrado (mobile y desktop), esqueletos de carga, botones de estado deshabilitados con su motivo, galería de la landing
