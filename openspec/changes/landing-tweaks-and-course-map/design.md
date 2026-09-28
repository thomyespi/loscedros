## Context

La landing ya está publicada. Casi todos los puntos son ajustes visuales chicos. El único con datos es el mapa del momento: una imagen que el admin reemplaza cada vez que cambia el recorrido.

Estado actual relevante:
- `components/landing/hero.tsx`: la foto `hero.webp` (1920×1278) cubre todo el hero con `object-cover`. El jugador está entre el 15 % y el 45 % del ancho de la imagen, justo donde va el título gigante (`max-w-3xl`, hasta `10.5rem`). En desktop el hero usa `lg:pb-0` y `lg:items-center`.
- `components/landing/marquee.tsx`: la banda tiene `-mt-3 -rotate-1`, así que se monta sobre el borde inferior del hero. Con `lg:pb-0`, la fila de datos (`<dl>` Hoyos / Horario / Dónde) queda debajo de la banda.
- `components/landing/club.tsx`: suma `{ value: stats.teams, label: "equipos en el ranking" }` a los highlights.
- `site_settings` es una fila única (`id = 1`) con RLS: lectura pública y update solo para admin. Storage: bucket público `tournament-media` (5 MB, webp/jpeg/png), escritura solo para admin.
- Las subidas del panel usan `compressPhoto` + `uploadImage` (`lib/admin/image.ts`) desde el navegador, y después una server action guarda la ruta. Así funcionan las fotos de torneos.

## Goals / Non-Goals

**Goals:**
- Que el jugador del hero se vea completo en desktop sin tocar la foto.
- Que la banda nunca tape contenido del hero.
- Un flujo simple para subir, reemplazar y quitar el mapa desde el celular.
- Que la landing se vea bien con o sin mapa cargado.

**Non-Goals:**
- Historial de mapas, varios mapas o mapas por torneo.
- Mapa interactivo o por hoyo (es una sola imagen).
- Cambiar la foto del hero ni la versión mobile (`hero-mobile.webp` ya tiene el jugador centrado y abajo del texto).

## Decisions

### 1. Hero en desktop: la foto a la derecha
En `lg`, el `<picture>` pasa de `inset-0` a ocupar la parte derecha del hero (≈ `lg:left-[38%]`), con un degradé `from-night` en su borde izquierdo para fundirse con el fondo. El bloque de texto se limita a `lg:max-w-[52%]` y el título baja su tamaño máximo en `lg` para que "hasta el hoyo" no invada la foto. Con la imagen corrida, el jugador queda entre el 45 % y el 65 % del ancho del viewport, fuera del texto.
- *Descartado:* espejar la foto (`scale-x-[-1]`), porque invierte el texto de la camiseta. Tampoco sirve `object-position`: con viewports más anchos que la foto, `cover` recorta arriba y abajo, no a los costados.
- Mobile no cambia.

### 2. La banda no tapa el hero
Se quita el `-mt-3` de la banda (se mantiene la rotación) y el hero lleva padding inferior en todos los tamaños (`pb-14 lg:pb-20`), para que la rotación de ±1° a 1440 px (≈ 12 px) no alcance la fila de datos. El chevron "Bajar" se ubica por encima de la banda.

### 3. Mapa: columnas en `site_settings` y archivo en `tournament-media/club/`
Migración `supabase/migrations/20260928000001_course_map.sql`:
```sql
alter table public.site_settings
  add column course_map_path text,
  add column course_map_width int check (course_map_width > 0),
  add column course_map_height int check (course_map_height > 0);
```
- Las políticas de RLS y Storage no cambian: el update de `site_settings` y la escritura en `tournament-media` ya son solo para admin.
- El archivo se sube a `club/course-map-<timestamp>.webp`. Cada reemplazo usa un nombre nuevo, así el CDN no sirve la versión vieja, y la server action borra el archivo anterior con `removeFiles`.
- Se guardan el ancho y el alto para renderizar con `next/image` sin salto de layout.
- *Descartado:* una tabla `course_maps` con historial, porque no se pidió.

### 4. Server actions
En `app/vestuario/(panel)/club/actions.ts`:
- `setCourseMap({ path, width, height })`: exige admin, valida que `path` empiece con `club/`, lee la ruta anterior, hace el update, borra el archivo anterior y llama a `refreshPublicData()`. Si el update falla, borra el archivo recién subido.
- `removeCourseMap()`: pone las tres columnas en `null`, borra el archivo y llama a `refreshPublicData()`.
- `saveSettings` no cambia: sigue actualizando solo los campos de texto, para no pisar el mapa.

### 5. Panel: tarjeta "Mapa de la cancha" en `/vestuario/club`
Componente cliente `components/admin/course-map-card.tsx`, fuera del formulario de texto (tiene su propio guardado inmediato). Muestra una vista previa del mapa actual y los botones "Subir mapa" / "Reemplazar" y "Quitar" (con `ConfirmDialog`). Comprime con `compressPhoto(file, 2560)`: un lado máximo mayor que el de las fotos, para que se lean los números de los hoyos. Durante la subida muestra un spinner y deshabilita los botones, igual que `photos-manager.tsx`.

### 6. Landing: mapa en La cancha y atajo en el hero
- `SiteSettings` suma `courseMap: { path: string; width: number; height: number } | null`. `toSettings` lo arma solo si los tres valores existen. `DEFAULT_SETTINGS` y los datos demo usan `null`.
- `Course` recibe `courseMap`. Si existe, renderiza debajo de las features un bloque con `id="mapa"` (`scroll-mt-24`): título "Mapa de la cancha", la imagen con `next/image` (`mediaUrl(path)`, `loading="lazy"`) y un botón "Ver en grande" que abre un `Dialog` a pantalla completa con la imagen. En mobile, tocar la imagen también lo abre. Si no hay mapa, no se renderiza nada.
- `Hero` recibe `hasCourseMap`. Si es verdadero, suma un link secundario "Ver mapa de la cancha" (ícono `Map`) a `/#mapa`, junto a los CTAs, con estilo de link de texto para no competir con "Ver torneos" ni "Avisá que venís". Si no hay mapa, el link no aparece.
- El header y la barra inferior no cambian.

### 7. Agradecimiento a Gen12 Software
En la franja inferior del footer, junto a "Créditos de fotos": "Sitio hecho por **Gen12 Software**", con link a `https://gen12software.com/` (`target="_blank" rel="noopener"`), texto `text-xs` en `text-mist` y el nombre en `text-chalk` con hover `text-grass`. Queda discreto pero visible en todas las páginas públicas, sin una sección propia.

### 8. Textos
- Hero: el dato "Dónde" pasa a "Malvinas Argentinas". Para que entre en la grilla de 3 columnas en 360 px, el `<dd>` usa un tamaño menor (`text-xl sm:text-3xl`) con `leading-tight`, y puede ocupar dos líneas.
- El club: se quita el highlight de equipos. Se elimina la prop `stats.teams` de `Club` si queda sin uso y se simplifica la llamada en `page.tsx`.

## Risks / Trade-offs

- **Los mapas son imágenes con texto chico** → se comprime a un lado máximo de 2560 y se ofrece la vista en grande. Si aun así pesa más de 5 MB, el bucket lo rechaza y el panel muestra el error.
- **Excepción a la regla "la landing no lee Storage"** → se documenta en el spec. Si Storage falla, la sección del mapa simplemente no aparece (con `courseMap` en `null`, el snapshot ya cae a los valores por defecto).
- **Cambio de layout del hero en desktop** → lo tiene que revisar el usuario visualmente en 1280, 1440 y 1920 px.

## Migration Plan

1. Aplicar `20260928000001_course_map.sql` en Supabase antes del deploy. Las columnas son opcionales, así que el código viejo sigue funcionando.
2. Regenerar o editar a mano `lib/supabase/database.types.ts`.
3. Deploy. El admin sube el primer mapa desde `/vestuario/club`.
Para volver atrás, alcanza con revertir el código: las columnas extra no molestan.
