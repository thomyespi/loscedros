## 1. Setup del proyecto

- [x] 1.1 Crear la app Next.js (última estable, App Router, TypeScript, ESLint, `src/` no) en la raíz del repo e inicializar git con `.gitignore`
- [x] 1.2 Instalar y configurar Tailwind CSS v4 y shadcn/ui (button, input, dialog, sheet, tabs, dropdown-menu, toast/sonner, form, badge, skeleton)
- [x] 1.3 Instalar dependencias: `@supabase/supabase-js`, `@supabase/ssr`, `motion`, `zod`, `react-hook-form`, `@hookform/resolvers`, `browser-image-compression`, `react-easy-crop`, `canvas-confetti`, `lucide-react`, `date-fns` y `date-fns-tz`
- [x] 1.4 Configurar Vitest con el script `test` (sin Playwright, por decisión del cliente)
- [x] 1.5 Crear `.env.example` (URL y anon key de Supabase, `NEXT_PUBLIC_SITE_URL`) y la constante `ADMIN_BASE_PATH = "/vestuario"`
- [x] 1.6 Configurar `next.config`: `remotePatterns` de Supabase Storage y el header `X-Robots-Tag: noindex, nofollow` para `/vestuario/:path*`

## 2. Base de datos (migraciones Supabase)

- [x] 2.1 Migración `0001_schema.sql`: enums `tournament_status` y `modality_type`; tablas `admins`, `teams`, `tournaments`, `tournament_teams`, `rounds`, `matches`, `match_results`, `tournament_photos` y `site_settings` con PK, FK, índices y checks del diseño
- [x] 2.2 Migración `0002_integrity.sql`: triggers de equipos inscriptos, equipo único por fecha, ganador ∈ cruce, fechas no decrecientes, bloqueo al quitar un inscripto con cruces, y `updated_at`
- [x] 2.3 Migración `0003_rls.sql`: función `is_admin()` (security definer), RLS en todas las tablas, SELECT público filtrando borradores (también en las tablas hijas) y escritura solo para admin
- [x] 2.4 Migración `0004_storage.sql`: buckets `team-avatars` y `tournament-media` con lectura pública y escritura solo para admin
- [x] 2.5 Migración `0005_views_settings.sql`: vista `v_match_summary` y fila inicial de `site_settings` (horarios 9 a 19, WhatsApp 5491139567637, Instagram los_cedros_footgolf, dirección César Bacle 1500)
- [x] 2.6 `supabase/seed.sql` de demo: 8 equipos, un torneo finalizado con campeón, uno en curso con resultados parciales, uno próximo y uno en borrador
- [x] 2.7 Generar los tipos TypeScript de la base (`lib/supabase/database.types.ts`) a mano o con la CLI, según el esquema
- [x] 2.8 Verificar las migraciones contra un Postgres o Supabase local (`supabase start` o `db reset`) y probar las políticas RLS con los roles anon y admin

## 3. Capa de datos y lógica de dominio

- [x] 3.1 Clientes Supabase: `lib/supabase/server.ts` (con cookies), `lib/supabase/public.ts` (anónimo, cacheable) y `lib/supabase/browser.ts`
- [x] 3.2 `lib/standings/compute.ts`: función pura con puntos (3 por modalidad), PJ/PG/PP (solo cruces completos), IND/FB/FS y desempates (puntos → PG → mini-tabla de enfrentamiento directo → IND → nombre)
- [x] 3.3 Tests unitarios de `computeStandings`: tabla vacía, resultados parciales, cada criterio de desempate, triple empate y equipo libre
- [x] 3.4 `lib/standings/historical.ts`: agregación de todos los torneos publicados, títulos por `champion_team_id`, equipos incluidos (participantes y activos) y el orden del histórico, con sus tests
- [x] 3.5 Queries públicas con caché por tags: torneos por estado, detalle de torneo (fechas, cruces, resultados, fotos), histórico, equipo por slug, settings y fotos recientes
- [x] 3.6 Helpers: `lib/whatsapp.ts` (links con los mensajes de cada contexto), `lib/dates.ts` (formato en es-AR con zona Buenos Aires), `lib/slug.ts` y `lib/avatar.ts` (iniciales y color determinístico)
- [x] 3.7 Esquemas Zod compartidos (equipo, torneo, fechas, cruce, resultado, settings) con mensajes en español

## 4. Sistema de diseño y layout público

- [x] 4.1 Tokens de diseño en Tailwind (paleta verde noche, césped, cedro, podio), tipografías con next/font y utilidades de números tabulares
- [x] 4.2 Componentes base: `<Logo/>` provisorio en SVG, `<TeamAvatar/>` con fallback de iniciales, `<SectionHeading/>`, `<Reveal/>` (animación de scroll que respeta reduced motion), `<CountUp/>` y `<WhatsAppButton/>`
- [x] 4.3 Layout público: header compacto, bottom nav mobile con safe-area y botón WhatsApp central, header desktop y footer (contacto, redes, horarios y dirección desde settings)
- [x] 4.4 Seleccionar y optimizar las imágenes de muestra (hero, cancha, galería) en `/public/placeholder/` y registrarlas en `content/media.ts`
- [x] 4.5 Textos de `content/`: qué es el footgolf, el club, la cancha, las modalidades, eventos y grupos, FAQ (8–10 preguntas)

## 5. Landing

- [x] 5.1 Hero a pantalla completa con imagen o video, overlay, eslogan animado y CTAs "Ver torneos" y "Avisá que venís"
- [x] 5.2 Bloque "Torneo en vivo" (en curso → próximo → último campeón → oculto) con el top 3 y la próxima fecha
- [x] 5.3 Secciones "¿Qué es el footgolf?", "El club" y "La cancha" (18 hoyos, horarios, servicios, contadores animados)
- [x] 5.4 Sección "Modalidades" con tarjetas de Individual, Four Ball y Foursome que explican cada una
- [x] 5.5 Sección "Ranking histórico" con el top 5 y un link a `/ranking`
- [x] 5.6 Secciones "Eventos y grupos" (CTA WhatsApp) y "Galería" (fotos recientes o de muestra)
- [x] 5.7 "Cómo llegar": mapa embebido con carga diferida y botón a Google Maps; "Preguntas frecuentes" en acordeón
- [x] 5.8 SEO: metadata por página, Open Graph por defecto, `sitemap.ts`, `robots.ts` (sin mencionar el admin) y JSON-LD `SportsActivityLocation`

## 6. Torneos, ranking y equipos (público)

- [x] 6.1 `/torneos`: grupos En curso, Próximos y Finalizados, tarjetas con portada o fondo generado, líder o campeón, y estado vacío con CTA
- [x] 6.2 `/torneos/[slug]`: encabezado, pestañas sincronizadas con `?tab=`, 404 para borradores o torneos inexistentes, y CTA "Consultar por WhatsApp"
- [x] 6.3 Componente `<StandingsTable/>` responsive (columnas sticky, scroll interno, podio destacado, fila expandible con los cruces del equipo)
- [x] 6.4 Pestaña "Fechas": chips con scroll-snap (fecha por defecto: próxima o última jugada), tarjetas de cruce con marcador 2–1, detalle por modalidad, estado pendiente y equipos libres
- [x] 6.5 Banner de campeón con animación y confetti para los torneos finalizados
- [x] 6.6 `/ranking`: tabla histórica con títulos (trofeo), torneos jugados y links a los equipos
- [x] 6.7 `/equipos/[slug]`: totales históricos, torneos jugados con su posición y últimos cruces
- [x] 6.8 Imágenes OG dinámicas por torneo (`opengraph-image.tsx`) con el nombre y el líder o campeón
- [x] 6.9 Estados de carga (skeletons) y páginas `not-found` y `error` con la estética del sitio

## 7. Admin: acceso y shell

- [x] 7.1 Middleware de sesión para `/vestuario/*` con redirección a `/vestuario/ingresar`
- [x] 7.2 Página de login (email y contraseña, error genérico, estados de carga) y acción de logout
- [x] 7.3 Helper `requireAdmin()` usado en el layout y en todas las server actions (valida la sesión y la pertenencia a `admins`)
- [x] 7.4 Shell del admin mobile-first: bottom nav (Inicio, Torneos, Equipos, Club), header con "Salir" y toasts
- [x] 7.5 Dashboard: torneo en curso con acceso directo a la próxima fecha, cruces pendientes y atajos de alta

## 8. Admin: equipos

- [x] 8.1 Listado con buscador, filtro activo/archivado y cantidad de torneos jugados
- [x] 8.2 Sheet de alta y edición con nombre único, slug estable y validaciones
- [x] 8.3 Subida de avatar: recorte cuadrado, compresión a WebP de 512px, subida a Storage y reemplazo o quitado
- [x] 8.4 Archivar y desarchivar; borrado definitivo solo sin participaciones (con confirmación)

## 9. Admin: torneos y fechas

- [x] 9.1 Listado de torneos por estado
- [x] 9.2 Wizard de alta: datos y portada → cantidad de fechas y días (validación de orden) → selección de equipos activos (mínimo 2)
- [x] 9.3 Pantalla del torneo: edición de datos, alta y baja de inscriptos (con bloqueo si tienen cruces), agregar y quitar la última fecha, y editar días
- [x] 9.4 Cambio de estado con confirmaciones: publicar, iniciar, finalizar (aviso de cruces incompletos y guardado del campeón) y reabrir
- [x] 9.5 Borrado de torneo escribiendo su nombre, con limpieza de archivos en Storage

## 10. Admin: cruces y resultados

- [x] 10.1 Pantalla de fecha: lista de cruces y equipos libres, y armado de cruces con toque-toque (solo equipos libres, aviso de cruce repetido)
- [x] 10.2 Carga de resultados: toggle segmentado grande por modalidad con guardado optimista (upsert), borrado del resultado y marcador opcional
- [x] 10.3 Borrado de cruce con confirmación si tiene resultados
- [x] 10.4 `revalidateTag` en todas las acciones (torneo, histórico, equipos, home) y manejo de errores con reversión del estado optimista

## 11. Admin: fotos y datos del club

- [x] 11.1 Subida múltiple de fotos con compresión (1920px en WebP), asociación opcional a una fecha y progreso
- [x] 11.2 Gestión de fotos: epígrafe, orden, borrado (base y Storage) y "usar como portada"
- [x] 11.3 Pestaña pública "Fotos": grilla, filtro por fecha y visor fullscreen con swipe
- [x] 11.4 `/vestuario/club`: formulario de horarios, WhatsApp (validado), Instagram y dirección, con revalidación de `settings`

## 12. Calidad y entrega

- [x] 12.1 Verificación automatizada sin navegador: `npm test`, `npm run db:verify`, `tsc`, `eslint` y `next build` en verde
- [x] 12.2 Checklist de QA visual para el cliente (360 a 1440px, sin scroll horizontal, áreas táctiles de 44px o más) en el README; la revisión la hace el cliente
- [x] 12.3 Buenas prácticas de performance y accesibilidad aplicadas (imágenes optimizadas, carga diferida, contraste, labels); la medición con Lighthouse la hace el cliente
- [x] 12.4 Revisar que no haya referencias a `/vestuario` en el HTML público, el sitemap ni el robots
- [x] 12.5 README en español: setup local, aplicar migraciones, desactivar el signup, crear el admin e insertarlo en `admins`, variables de entorno, deploy en Vercel, dominio y cómo reemplazar el logo y las imágenes
- [x] 12.6 Cron de Vercel semanal (ping a Supabase) para evitar la pausa del plan gratuito
