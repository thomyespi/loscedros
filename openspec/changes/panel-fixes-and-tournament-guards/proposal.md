## Why

Probando el panel aparecieron varios problemas de uso y de reglas de negocio: el formulario de equipo se abre pegado abajo de la pantalla, los botones tardan en reaccionar y no dan señal de que algo está pasando, se puede arrancar un torneo sin ningún cruce armado y se puede finalizar con fechas a medio cargar. Además hay que dejar claro dónde viven las imágenes: las de la landing son parte del sitio (código), y la base solo guarda lo que carga el admin (torneos, equipos y configuración).

## What Changes

- **Formularios del panel centrados**: los paneles "Nuevo/Editar equipo" y "Editar torneo" pasan de hoja inferior (`Sheet side="bottom"`) a un diálogo centrado en la pantalla, con scroll interno si no entra.
- **Imágenes de la landing solo en el código**: todas las imágenes de la landing (hero, secciones y galería) salen de `public/landing/` y se declaran en un único archivo, `content/media.ts`. **BREAKING**: la galería de la landing deja de mostrar las fotos de torneos que se suben a la base; las fotos de torneos se siguen viendo en la pestaña "Fotos" de cada torneo. En Storage/base quedan solo los avatares de equipos, las portadas y las fotos de torneos.
- **Carpeta renombrada y documentada**: `public/placeholder/` pasa a `public/landing/` y el README explica cómo reemplazar cada imagen.
- **Respuesta inmediata al tocar**: pantallas de carga (`loading.tsx`) en las rutas del panel y del sitio público, indicador en los links de navegación mientras la página carga, y botones que se deshabilitan y muestran un spinner apenas se tocan. También se reducen los viajes a Supabase por cada navegación del panel.
- **No arrancar sin cruces**: un torneo no puede pasar a `en_curso` (ni "Arrancar torneo" ni "Publicar en juego") si la Fecha 1 no tiene al menos un cruce. Después se pueden seguir editando cruces libremente.
- **No finalizar incompleto**: un torneo no puede pasar a `finalizado` si alguna fecha no tiene cruces o si algún cruce no tiene los 3 resultados cargados. Se elimina la opción actual de "finalizar igual" con resultados incompletos.
- Ambas reglas se validan en la server action, se reflejan en la UI (botón deshabilitado con el motivo) y la base las garantiza con un trigger.

## Capabilities

### New Capabilities
<!-- Ninguna: todo son cambios sobre capacidades existentes. -->

### Modified Capabilities
- `tournament-management`: "Estados del torneo" exige cruces en la Fecha 1 para pasar a `en_curso` y todas las fechas completas para pasar a `finalizado` (se quita la confirmación para finalizar incompleto).
- `media-gallery`: "Galería de la landing" muestra solo imágenes incluidas en el sitio, nunca fotos subidas a la base.
- `landing-page`: nuevo requisito sobre el origen de las imágenes de la landing y sobre la respuesta visual inmediata al navegar.
- `admin-access`: "Panel usable en mobile" pide formularios en diálogo centrado y respuesta inmediata (carga visible y botones con estado pendiente).

## Impact

- **Componentes**: `components/admin/teams-manager.tsx`, `components/admin/tournament-admin.tsx` (diálogos, estado de los botones de estado), `components/admin/admin-nav.tsx`, `components/layout/bottom-nav.tsx` y `site-header.tsx` (indicador de carga en links), `components/landing/*` y `app/(public)/page.tsx` (galería estática).
- **Rutas**: nuevos `loading.tsx` en `app/vestuario/(panel)/**` y `app/(public)/**`.
- **Server actions**: `changeTournamentStatus` en `app/vestuario/(panel)/torneos/actions.ts`.
- **Auth**: `lib/auth.ts` y `proxy.ts` (menos llamadas a Supabase Auth por request).
- **Base de datos**: nueva migración que extiende el trigger `check_tournament` con las dos reglas de estado.
- **Archivos estáticos**: `public/placeholder/*` → `public/landing/*`; `content/media.ts`, página de créditos y README.
- Sin dependencias nuevas.
