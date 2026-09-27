## Why

Los Cedros, un club de footgolf ubicado en Malvinas Argentinas (Buenos Aires), no tiene presencia web propia. Necesita un sitio que atraiga visualmente a gente nueva (casi todas las visitas llegan desde el celular) y que resuelva su principal necesidad operativa: publicar los torneos entre equipos amateur, con resultados, tabla de posiciones y un ranking histórico que motive a los equipos a volver.

## What Changes

- Nuevo sitio público con Next.js (App Router) y Supabase, **diseñado primero para mobile**, con estética moderna, deportiva y animada.
- **Landing** completa: hero, torneo en vivo, qué es el footgolf, el club, la cancha de 18 hoyos, las modalidades, el top del ranking histórico, eventos y grupos, galería, cómo llegar, preguntas frecuentes, contacto y footer. Todos los contactos (reservas y consultas por torneos) se hacen por WhatsApp con un mensaje ya escrito. No se muestran tarifas.
- Sección pública **Torneos**: listado de torneos (próximos, en curso y finalizados), detalle con tabla de posiciones, fechas con sus cruces y resultados por modalidad, campeón destacado y galería opcional.
- **Ranking histórico** que acumula los puntos de todos los torneos, con títulos ganados.
- **Panel de administración oculto** en una ruta no pública (`/vestuario`), con login por email y contraseña de un único usuario admin, sin registro. También se tiene que poder usar cómodo desde el celular.
- Gestión de **equipos** (nombre y avatar; se archivan en vez de borrarse cuando tienen historial).
- Gestión de **torneos**: fechas (cantidad variable y día de calendario de cada una), equipos participantes, estado, cruces por fecha y ganador de cada modalidad (Individual, Four Ball y Foursome). Cada modalidad ganada suma 3 puntos y no hay empates.
- **Fotos opcionales** por torneo o por fecha.
- **Datos del club editables** desde el admin: horarios, WhatsApp, Instagram y dirección.
- Migraciones SQL de Supabase (esquema, RLS, storage y seed de demo), listas para aplicar sobre un proyecto nuevo.

## Capabilities

### New Capabilities
- `landing-page`: Home pública mobile-first con todas sus secciones, CTAs de WhatsApp, SEO e imágenes para compartir.
- `admin-access`: Ruta oculta del panel, login de un único admin, protección de rutas y políticas de acceso a datos.
- `team-management`: Alta, edición, avatar y archivado de equipos desde el admin.
- `tournament-management`: Alta y edición de torneos, sus fechas, equipos participantes y estados (incluido borrador no visible).
- `match-results`: Cruces por fecha y carga del ganador de cada modalidad con marcador opcional.
- `tournament-standings`: Cálculo de la tabla de posiciones de cada torneo con criterios de desempate y determinación del campeón.
- `historical-ranking`: Tabla histórica acumulada de todos los torneos con títulos ganados.
- `public-tournaments`: Vistas públicas de listado y detalle de torneos, resultados, fechas y galería.
- `media-gallery`: Carga opcional de fotos por torneo o por fecha y su visualización.
- `site-settings`: Datos del club editables (horarios y contacto) consumidos por la landing.

### Modified Capabilities
<!-- Ninguna: proyecto nuevo, no existen specs previas. -->

## Impact

- **Código nuevo**: aplicación Next.js + TypeScript + Tailwind CSS + shadcn/ui + Motion en la raíz del repositorio.
- **Dependencias externas**: Supabase (Postgres, Auth y Storage) y Vercel como hosting. El dominio se configura más adelante.
- **Base de datos**: migraciones en `supabase/migrations/` y `supabase/seed.sql`. El cliente crea el proyecto de Supabase y las aplica.
- **Contenido**: todavía no hay logo, fotos ni videos. Se usan un logo tipográfico provisorio e imágenes de muestra con licencia libre, fáciles de reemplazar.
- **Fuera de alcance (por ahora)**: jugadores por equipo, tarifas, reservas online, playoffs o finales, más de un usuario admin y otros idiomas.
