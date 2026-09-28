## Why

Después de revisar la landing publicada aparecieron varios detalles: en desktop el jugador de la foto del hero queda detrás del título, la banda que se desplaza tapa los datos del final del hero y algunos textos y datos no son los que el club quiere mostrar. Además, el club cambia seguido el recorrido de la cancha y necesita publicar el mapa vigente sin depender de un deploy.

## What Changes

- **Hero en desktop**: el texto y el jugador de la foto dejan de superponerse. La foto se ubica a la derecha, con un degradé hacia el fondo, y el bloque de texto se limita a la mitad izquierda.
- **Hero, dato "Dónde"**: muestra "Malvinas Argentinas" en lugar de "Malvinas".
- **Banda que se desplaza (marquee)**: deja de tapar el final del hero (los datos Hoyos / Horario / Dónde) en todos los tamaños de pantalla.
- **El club**: se quita el dato "equipos en el ranking" de las estadísticas.
- **Agradecimiento a Gen12 Software**: una línea discreta pero visible en el footer ("Sitio hecho con ♥ por Gen12 Software") con link a https://gen12software.com/.
- **Mapa del momento**:
  - El admin puede subir, reemplazar y quitar una imagen del mapa de la cancha desde `/vestuario/club`.
  - La sección "La cancha" muestra el mapa (con opción de verlo en grande) cuando hay uno cargado; si no hay, no se muestra nada.
  - El hero suma un atajo "Ver mapa de la cancha" que lleva al mapa, visible solo si hay mapa cargado.
- **Excepción a la regla de imágenes**: el mapa es la única imagen de la landing que se lee de Storage. El resto sigue en `public/landing/`.

## Capabilities

### New Capabilities
<!-- Ninguna -->

### Modified Capabilities
- `landing-page`: el hero muestra "Malvinas Argentinas", no tapa al jugador y suma el atajo al mapa. La banda no tapa el hero. El club no muestra "equipos en el ranking". La cancha muestra el mapa del momento. El footer incluye el agradecimiento a Gen12 Software. La regla "Imágenes de la landing en el código" suma la excepción del mapa.
- `site-settings`: la configuración del club suma el mapa del momento (imagen opcional), editable desde `/vestuario/club`.

## Impact

- **Código**: `components/landing/hero.tsx`, `marquee.tsx`, `club.tsx`, `course.tsx`, `components/layout/site-footer.tsx`, `app/(public)/page.tsx`, `components/admin/settings-form.tsx` (o un componente nuevo para el mapa), `app/vestuario/(panel)/club/actions.ts`, `lib/domain/types.ts`, `lib/data/mappers.ts`, `lib/settings.ts`, `lib/demo/data.ts`, `lib/supabase/database.types.ts`.
- **Base de datos**: una migración nueva agrega a `site_settings` las columnas `course_map_path`, `course_map_width` y `course_map_height`, todas opcionales. Se reutiliza el bucket `tournament-media` (carpeta `club/`), así que no hacen falta políticas de Storage nuevas.
- **Sin cambios** en torneos, ranking ni permisos.
