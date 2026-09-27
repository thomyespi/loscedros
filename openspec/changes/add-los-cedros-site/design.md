## Context

Proyecto nuevo, sin código previo. Los Cedros es un club de footgolf con cancha de 18 hoyos en Malvinas Argentinas (Buenos Aires). Casi todas las visitas son desde el celular. Hoy no hay logo, fotos ni videos, así que el diseño debe verse espectacular con recursos provisorios y permitir reemplazarlos fácilmente. El cliente creará el proyecto de Supabase más adelante: se entregan migraciones SQL aplicables con la Supabase CLI o pegándolas en el SQL Editor. Hosting en Vercel; dominio a definir.

Hay un solo admin, que carga resultados muchas veces desde la cancha con el celular. El volumen de datos es chico (decenas de equipos, pocos torneos por año, 3 resultados por cruce).

## Goals / Non-Goals

**Goals:**
- Una experiencia mobile de nivel "app deportiva": rápida, animada, con tablas legibles en 375px.
- Una única fuente de verdad (los resultados por modalidad); posiciones, campeón e histórico se derivan de ahí.
- Un panel oculto, seguro y cómodo de usar con una mano.
- Cero configuración manual de base de datos más allá de aplicar migraciones y crear el usuario admin.

**Non-Goals:**
- Jugadores por equipo, estadísticas individuales, tarifas, reservas online, pagos, playoffs.
- Multi-admin, roles o auditoría de cambios.
- CMS completo de la landing (solo los datos del club son editables).
- i18n (solo español rioplatense).

## Decisions

### 1. Stack
- **Next.js (última versión estable, App Router) + TypeScript + React Server Components.** Los datos públicos se leen en el servidor; hay muy poco JS en el cliente para las páginas de solo lectura.
- **Tailwind CSS v4 + shadcn/ui** (Radix) para los componentes accesibles del admin y de la UI pública (tabs, dialogs, sheets, dropdowns).
- **Motion** (ex Framer Motion) para las animaciones de scroll, contadores, transiciones de pestañas y la celebración del campeón (junto con `canvas-confetti`).
- **Supabase**: Postgres, Auth (email y contraseña) y Storage, con `@supabase/ssr` para las cookies de sesión en server components, middleware y server actions.
- **Zod** para validar formularios y server actions; **react-hook-form** en los formularios del admin.
- **Vitest** para la lógica de puntos, posiciones y utilidades. Sin tests e2e en navegador: la revisión visual y de uso la hace el cliente.
- Alternativa descartada: una API REST separada o tRPC. Las Server Actions alcanzan y reducen el código.

### 2. Dirección visual
Hay pocas webs de footgolf modernas: los sitios oficiales de referencia (FIFG, AFGL) son funcionales pero no inspiradores. Por eso la referencia visual se toma de apps y sitios deportivos premium: estética de "matchday" (apps de ligas de fútbol, Nike Football, Strava), con tipografía condensada gigante, fotos a sangre y marcadores tipo scoreboard.
- **Paleta:** base oscura "verde noche" (`#07130D`), superficies `#0E1F16`, acento principal **verde césped eléctrico** (`#9BE22D`), secundario **madera de cedro** (`#C8894A`) para detalles cálidos, y oro, plata y bronce para el podio. Tema oscuro por defecto (luce mejor con fotos de cancha y en el celular de noche), con secciones claras puntuales para dar ritmo.
- **Tipografía** (next/font): *Bricolage Grotesque* o *Anton* para los títulos grandes, en mayúsculas condensadas, e *Inter* para el texto y los números tabulares (`font-variant-numeric: tabular-nums` en las tablas).
- **Motivos gráficos:** textura sutil de césped y grano, un patrón de líneas de hoyo, el número 18 como elemento gráfico y la pelota como cursor o loader.
- **Logo provisorio:** wordmark "LOS CEDROS" con un ícono SVG de cedro estilizado integrado con una pelota. Vive en un único componente `<Logo/>` para reemplazarlo fácilmente.
- **Imágenes de muestra:** fotos de Unsplash o Pexels (licencia libre) guardadas en `/public/placeholder/`, listadas en `content/media.ts` para cambiarlas en un solo lugar.

### 3. Mobile first en concreto
- **Navegación pública:** header compacto con el logo y una **bottom nav** fija (Inicio, Torneos, Ranking y un botón WhatsApp central destacado), con `env(safe-area-inset-bottom)`.
- **Tablas:** grid con columnas sticky (pos, equipo y PTS a la izquierda, fijas) y el resto con scroll horizontal dentro de un contenedor con sombra indicadora. Filas de 56px o más.
- **Selector de fechas:** chips horizontales con scroll-snap. Las pestañas de torneo se sincronizan con `?tab=`.
- **Admin:** layout de una columna, bottom nav (Inicio, Torneos, Equipos, Club) y acciones principales en una barra inferior pegajosa. La carga de resultados es un **toggle segmentado de 2 botones grandes por modalidad** (equipo A | equipo B) que guarda al instante, con feedback optimista y un toast de confirmación.
- **Probado** en 360, 375, 390 y 430px, en Safari iOS y Chrome Android.

### 4. Rutas

```
Público
/                         landing
/torneos                  listado
/torneos/[slug]           detalle (?tab=tabla|fechas|fotos&fecha=N)
/ranking                  histórico
/equipos/[slug]           página del equipo
/opengraph-image, /torneos/[slug]/opengraph-image

Admin (noindex, protegido por middleware)
/vestuario/ingresar
/vestuario                dashboard
/vestuario/equipos        listado + alta/edición (sheet)
/vestuario/torneos        listado
/vestuario/torneos/nuevo  wizard: datos → fechas → equipos
/vestuario/torneos/[id]   resumen, estado, equipos, fechas
/vestuario/torneos/[id]/fechas/[n]  cruces + resultados
/vestuario/torneos/[id]/fotos
/vestuario/club           datos del club
```
Elegimos "/vestuario" porque es temático, fácil de recordar para el admin y no obvio para el público. Se define en una única constante (`ADMIN_BASE_PATH`) por si se quiere cambiar.

### 5. Modelo de datos (Postgres)

```
admins(user_id uuid PK → auth.users)
teams(id uuid PK, name text, slug text UNIQUE, avatar_path text NULL,
      archived_at timestamptz NULL, created_at, updated_at)
      UNIQUE INDEX lower(name)
tournaments(id uuid PK, name text UNIQUE, slug text UNIQUE, description text NULL,
      cover_path text NULL, status tournament_status DEFAULT 'borrador',
      champion_team_id uuid NULL → teams, finished_at timestamptz NULL,
      created_at, updated_at)
      enum tournament_status: borrador | proximo | en_curso | finalizado
tournament_teams(tournament_id → tournaments ON DELETE CASCADE,
      team_id → teams ON DELETE RESTRICT, PK(tournament_id, team_id))
rounds(id uuid PK, tournament_id → tournaments CASCADE, number int, play_date date,
      UNIQUE(tournament_id, number))
matches(id uuid PK, round_id → rounds CASCADE, team_a_id, team_b_id → teams RESTRICT,
      created_at, CHECK(team_a_id <> team_b_id))
match_results(match_id → matches CASCADE, modality modality_type,
      winner_team_id → teams, score_note varchar(20) NULL,
      PK(match_id, modality))
      enum modality_type: individual | four_ball | foursome
tournament_photos(id uuid PK, tournament_id → tournaments CASCADE,
      round_id → rounds SET NULL NULL, path text, caption text NULL,
      sort_order int, created_at)
site_settings(id int PK CHECK(id = 1), opening_hours text, whatsapp text,
      instagram text, address text, updated_at)
```

**Integridad en la base, con triggers:**
- `matches`: ambos equipos inscriptos en el torneo de la fecha, y ningún equipo repetido en la misma fecha.
- `match_results`: `winner_team_id` ∈ {team_a_id, team_b_id}.
- `rounds`: `play_date` no decreciente según `number`.
- Borrar un inscripto con cruces lo impide la validación en la server action y un trigger.

Validamos en la base (y no solo en la app) porque es la última línea de defensa, en caso de que el admin tenga dos pestañas abiertas o haya una edición manual en Supabase.

### 6. Cálculo de posiciones: en TypeScript, no en SQL
El desempate por enfrentamiento directo entre N equipos (mini-tabla) es engorroso en SQL y difícil de testear. Con el volumen de datos del club, leer todos los resultados de un torneo (o de todos los torneos, para el histórico) es barato.
- `lib/standings/compute.ts`: `computeStandings(teams, matches, results) → Row[]`, una función pura.
- `lib/standings/historical.ts`: agrega por equipo sobre los torneos publicados y suma los títulos desde `tournaments.champion_team_id`.
- El campeón se **congela** al finalizar (`champion_team_id`), para que una corrección posterior o un cambio de criterio no reescriba la historia. Si se reabre el torneo, se limpia.
- Una vista SQL auxiliar `v_match_summary` (modalidades ganadas por equipo por cruce) simplifica las consultas públicas.
- Alternativa descartada: vistas materializadas o tablas de posiciones persistidas. Agregan sincronización y riesgo de desfasaje sin beneficio a esta escala.

### 7. Lectura, caché e invalidación
- Las páginas públicas son server components con `fetch` a Supabase etiquetado (`unstable_cache`/`"use cache"` con tags `tournaments`, `tournament:<id>`, `teams`, `settings`).
- Cada server action del admin llama a `revalidateTag` con los tags afectados, así el público ve los cambios al instante sin rebuild.
- Cliente anónimo con la anon key para lecturas públicas (RLS filtra borradores); cliente con la sesión del admin para las escrituras.

### 8. Seguridad
- Middleware en `/vestuario/*`: refresca la sesión con `@supabase/ssr`; sin sesión redirige a `/vestuario/ingresar`.
- Doble chequeo en el servidor: el layout del admin y **cada server action** validan `is_admin()`. El middleware no alcanza como única barrera.
- RLS: `is_admin()` es `SECURITY DEFINER` y chequea `auth.uid()` contra `admins`. Las políticas de SELECT anónimo en los torneos filtran `status <> 'borrador'` y, en las tablas hijas, lo hacen por `EXISTS` con el torneo padre.
- Storage: buckets públicos de lectura `team-avatars` y `tournament-media`; escritura solo con `is_admin()`.
- En el panel de Supabase: "Allow new users to sign up" desactivado. El admin se crea desde Authentication → Add user, y su id se inserta en `admins` (queda documentado en el README).
- Rate limiting del login: el que trae Supabase Auth. Headers `noindex` en `next.config` para `/vestuario/:path*`. `robots.txt` no menciona la ruta, porque listarla la delataría.

### 9. Imágenes
- Compresión en el cliente con `browser-image-compression` y un recorte cuadrado para los avatares (`react-easy-crop`). La subida va directo a Storage con la sesión del admin, así se evita el límite de body de las server actions.
- Se muestran con `next/image` (con `remotePatterns` al dominio de Supabase), `sizes` bien definidos y placeholder blur.

### 10. Estructura del repo

```
app/(public)/…   app/vestuario/…   components/{ui,public,admin}
lib/{supabase,standings,whatsapp,dates,validation}
content/ (textos fijos de la landing: FAQ, modalidades, club)
supabase/migrations/*.sql  supabase/seed.sql  tests/
```

### 11. Textos de la landing
Los textos fijos van en `content/*.ts`, tipados (FAQ, qué es el footgolf, modalidades, eventos), para editar sin tocar componentes. Se redactan con tono cercano rioplatense.

## Risks / Trade-offs

- [Sin fotos reales, el sitio puede sentirse genérico] → Diseño basado en tipografía, color y textura, más imágenes de muestra seleccionadas y centralizadas para cambiarlas en minutos cuando haya fotos.
- [Una ruta oculta puede filtrarse] → La seguridad real está en el login, `admins` y RLS; la ruta oculta solo evita curiosos.
- [El admin olvida la contraseña] → Recuperación por email de Supabase Auth, o reseteo desde el panel de Supabase (documentado).
- [Calcular las tablas en TS en cada request] → Volumen ínfimo más caché con tags; si crece mucho, se puede migrar a una vista materializada sin cambiar la UI.
- [Cambios de criterio de desempate] → Todo está en una función pura testeada, con un solo lugar para modificar. Los campeones pasados quedan congelados.
- [Resultados cargados con conexión mala en la cancha] → La UI optimista revierte y avisa si falla; el guardado es idempotente (upsert por `match_id, modality`).
- [Plan gratuito de Supabase que se pausa por inactividad] → Documentarlo; un cron de Vercel (ping semanal) evita la pausa.

## Migration Plan

1. El cliente crea el proyecto en Supabase (región São Paulo, `sa-east-1`, por latencia).
2. `supabase link` y `supabase db push`, o pegar las migraciones en orden en el SQL Editor. Opcional: `seed.sql` con datos de demo.
3. Desactivar el signup, crear el usuario admin e insertar su id en `admins`.
4. Cargar las variables en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) y desplegar.
5. Cuando haya dominio: configurarlo en Vercel y actualizar `NEXT_PUBLIC_SITE_URL` y la Site URL de Supabase Auth.
6. Rollback: redeploy de la versión anterior en Vercel. Las migraciones son aditivas.

## Open Questions

- Días de apertura: se asume "todos los días de 9 a 19 h" (editable desde el admin).
- Textos del club (historia, año de fundación, servicios de la cancha): se redactan provisorios hasta que el cliente los pase.
- Si más adelante se agregan jugadores por equipo, el modelo lo admite con una tabla `players` y columnas opcionales en `match_results`, sin romper lo existente.
