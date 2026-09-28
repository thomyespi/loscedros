## 1. Ajustes rápidos de la landing

- [x] 1.1 En `components/landing/hero.tsx`, cambiar el `<dd>` de "Dónde" a "Malvinas Argentinas" con tamaño `text-xl sm:text-3xl leading-tight` para que entre en 360px
- [x] 1.2 En `components/landing/club.tsx`, quitar el highlight "equipos en el ranking"; eliminar la prop `stats` si queda sin uso y ajustar la llamada en `app/(public)/page.tsx`
- [x] 1.3 En `components/layout/site-footer.tsx`, agregar en la franja inferior "Sitio hecho por Gen12 Software" con link a `https://gen12software.com/` (`target="_blank" rel="noopener noreferrer"`), `text-xs text-mist` y el nombre en `text-chalk hover:text-grass`
- [x] 1.4 Quitar el link "Créditos de fotos" del footer, borrar `app/(public)/creditos` y `allCredits` de `content/media.ts`, y actualizar el README

## 2. Hero y banda

- [x] 2.1 En `hero.tsx`, en `lg`, ubicar el `<picture>` en la parte derecha (≈ `lg:left-[38%]`) con un degradé `from-night` en su borde izquierdo; ajustar los overlays existentes para que no dupliquen oscuridad
- [x] 2.2 Limitar el bloque de texto a `lg:max-w-[52%]` y bajar el tamaño máximo del título en `lg` para que no invada la foto
- [x] 2.3 Dar padding inferior al hero en todos los tamaños (`pb-14 lg:pb-20`, reemplazando `lg:pb-0`) y reubicar el chevron "Bajar" por encima de la banda
- [x] 2.4 En `components/landing/marquee.tsx`, quitar el `-mt-3` y mantener la rotación

## 3. Base de datos y tipos del mapa

- [x] 3.1 Nueva migración `supabase/migrations/20260928000001_course_map.sql`: columnas opcionales `course_map_path text`, `course_map_width int` y `course_map_height int` (con check `> 0`) en `site_settings`
- [x] 3.2 Actualizar `lib/supabase/database.types.ts` (Row/Insert/Update de `site_settings`)
- [x] 3.3 Sumar `courseMap: { path; width; height } | null` a `SiteSettings` (`lib/domain/types.ts`), armarlo en `toSettings` (`lib/data/mappers.ts`) solo si están los tres valores, y poner `null` en `DEFAULT_SETTINGS` (`lib/settings.ts`) y en los datos demo
- [x] 3.4 Revisar que `SettingsForm` siga comparando solo los campos de texto (el `dirty` y el `settingsSchema` no deben incluir `courseMap`)
- [x] 3.5 Correr `npm run db:verify` y, si el script lo permite, sumar un caso: anon no puede actualizar `course_map_path`

## 4. Panel: subir el mapa

- [x] 4.1 En `app/vestuario/(panel)/club/actions.ts`, agregar `setCourseMap({ path, width, height })` (con `requireAdmin`, validación con zod, la ruta tiene que empezar con `club/`, borrar el archivo anterior, borrar el nuevo si el update falla y llamar a `refreshPublicData()`) y `removeCourseMap()`
- [x] 4.2 Crear `components/admin/course-map-card.tsx`: vista previa del mapa actual, "Subir mapa" o "Reemplazar" (`compressPhoto(file, 2560)` + `uploadImage("media", "club", blob)`), "Quitar" con `ConfirmDialog`, spinner y botones deshabilitados durante la operación (`useTransition` + `router.refresh()`), y errores con `toast`
- [x] 4.3 Montar la tarjeta en `app/vestuario/(panel)/club/page.tsx` debajo del formulario y actualizar el subtítulo de la página

## 5. Landing: mostrar el mapa

- [x] 5.1 En `components/landing/course.tsx`, recibir `courseMap` y, si existe, renderizar un bloque `id="mapa"` (`scroll-mt-24`) con título "Mapa de la cancha", `next/image` (`mediaUrl(path)`, `width`/`height` reales, carga diferida) y "Ver en grande" que abre un `Dialog` a pantalla completa (componente cliente chico). Tocar la imagen también lo abre
- [x] 5.2 En `hero.tsx`, recibir `hasCourseMap` y mostrar el link secundario "Ver mapa de la cancha" (ícono `Map`) a `/#mapa` junto a los CTAs, solo si hay mapa
- [x] 5.3 Pasar `settings.courseMap` a `Course` y `hasCourseMap` a `Hero` desde `app/(public)/page.tsx`
- [x] 5.4 Actualizar la sección de imágenes del README: el mapa se sube desde el panel, no desde `public/landing/`

## 6. Ajustes tras la revisión visual

- [x] 6.0a Hero: en desktop el texto se alinea al borde izquierdo (sin el contenedor centrado) y la foto arranca en el 32 % con un degradé más corto, para que se vea más imagen y menos borde oscuro
- [x] 6.0b Hero: "Malvinas Argentinas" en una línea (en celular, "Dónde" ocupa su propia fila; desde `sm`, fila de 3 con `whitespace-nowrap`)
- [x] 6.0c Footer: crédito de Gen12 Software más visible, como botón tipo píldora con borde e ícono
- [x] 6.0d Mapa: vista compacta (tarjeta con texto a la izquierda y mapa con altura máxima a la derecha en desktop); el detalle queda para "Ver en grande"

## 7. Verificación

- [x] 6.1 `npm run typecheck`, `npm run lint` y `npm test` sin errores
- [x] 6.2 `npm run build` sin errores ni warnings nuevos
- [x] 6.3 Recordar aplicar la migración en Supabase antes del deploy
- [x] 6.4 Pedirle al usuario la revisión visual: hero en 1280/1440/1920 (jugador libre de texto), banda sin tapar datos en mobile y desktop, "Malvinas Argentinas" en 360px, club sin equipos, crédito de Gen12 en el footer, subir, reemplazar y quitar el mapa desde el celular, atajo y vista en grande
