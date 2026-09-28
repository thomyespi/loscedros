# Los Cedros Footgolf

Sitio del club de footgolf **Los Cedros** (Malvinas Argentinas, Buenos Aires): landing, torneos por equipos con tabla en vivo, ranking histórico y un panel de administración oculto.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Motion · Supabase (Postgres, Auth, Storage) · Vercel.

---

## 1. Correr el proyecto en tu compu

Requisitos: Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>.

> **Modo demo:** si no configurás Supabase, el sitio funciona con **datos de ejemplo** (equipos, un torneo finalizado, uno en curso y uno próximo). Sirve para ver el diseño. El panel no funciona en este modo.

---

## 2. Crear y configurar Supabase

1. Creá un proyecto en <https://supabase.com>. (El proyecto actual, `loscedros`, está en **us-west-2 · Oregon**.)
2. Aplicá las migraciones de `supabase/migrations/` **en orden** (el nombre de cada archivo empieza con la fecha). Tenés dos opciones:
   - **Desde el panel:** SQL Editor → pegá el contenido de cada archivo → *Run*.
   - **Con la CLI:**
     ```bash
     npx supabase login
     npx supabase link --project-ref TU_REF
     npx supabase db push
     ```
3. *(Opcional)* Para arrancar con datos de prueba, ejecutá `supabase/seed.sql` en el SQL Editor. Para arrancar vacío, no lo ejecutes.
4. **Desactivá el registro público:** Authentication → Sign In / Providers → **desmarcá "Allow new users to sign up"**.
5. **Creá el usuario admin:** Authentication → Users → *Add user* → *Create new user* (email y contraseña, marcá *Auto Confirm User*).
6. **Dale acceso al panel.** Copiá el *UID* del usuario y ejecutá en el SQL Editor:
   ```sql
   insert into public.admins (user_id) values ('PEGÁ-ACÁ-EL-UID');
   ```
7. Copiá las claves en Project Settings → API y creá el archivo `.env.local` (tomá `.env.example` como base):
   ```bash
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SITE_URL=http://localhost:3000
   CRON_SECRET=un-texto-largo-y-secreto
   ```
8. En Authentication → URL Configuration, poné la **Site URL** (en local: `http://localhost:3000`; en producción: tu dominio).

---

## 3. El panel de administración

- Ruta: **`/vestuario`** (el login está en `/vestuario/ingresar`). No está enlazada desde ningún lado, no figura en el sitemap y le pide a Google que no la indexe.
- La seguridad real está en el login y en la base de datos: aunque alguien descubra la ruta, sin la cuenta admin no puede ver borradores ni modificar nada.
- **¿Te olvidaste la contraseña?** En Supabase: Authentication → Users → tu usuario → *Send password recovery* (o *Reset password*).
- **¿Querés cambiar la ruta?** Cambiá `ADMIN_BASE_PATH` en `lib/admin-path.ts`, el `matcher` en `proxy.ts` y renombrá la carpeta `app/vestuario`.

### Cómo se usa (flujo típico)
1. **Equipos:** creá los equipos (nombre y, si querés, una imagen).
2. **Torneos → Nuevo:** nombre, cantidad de fechas con su día y los equipos. Se crea como **borrador** (no es público).
3. **Publicalo** como *Próximo* o *En juego* desde la pantalla del torneo.
4. En cada **Fecha**: armá los cruces (tocás un equipo y después a su rival) y cargá el ganador de **Individual**, **Four Ball** y **Foursome** tocando el equipo. Se guarda solo.
5. Al terminar, **Finalizar torneo**: se guarda el campeón y suma un título en el ranking histórico.

### Reglas de puntos
- Cada modalidad ganada suma **3 puntos**. No hay empates.
- Desempate de la tabla del torneo: **puntos → cruces ganados → enfrentamiento directo → Individual ganadas → nombre**.
- Ranking histórico: **puntos → títulos → cruces ganados → Individual → nombre**.
- Los borradores **nunca** suman en el ranking.

---

## 4. Deploy en Vercel

1. Subí el repo a GitHub e importalo en <https://vercel.com/new>.
2. En *Environment Variables* cargá las 4 variables del paso 2.7 (con `SITE_URL` = la URL final).
3. Deploy. `vercel.json` ya configura:
   - Región **pdx1 (Portland)**, al lado de la base de Supabase (us-west-2), para que las consultas sean rápidas.
   - Un **cron semanal** (`/api/keep-alive`) que evita que Supabase pause el proyecto en el plan gratuito por inactividad.

### Dominio propio (cuando lo compres)
1. Vercel → Project → Settings → Domains → agregá el dominio y seguí las instrucciones de DNS.
2. Actualizá `SITE_URL` en Vercel y la **Site URL** de Supabase Auth con el dominio nuevo. Redeploy.

---

## 5. Cambiar contenido

| Qué | Dónde |
| --- | --- |
| Horarios (días abiertos + hora de apertura y cierre; todos los textos de horario del sitio salen de acá), WhatsApp, Instagram, dirección | Panel → **Club** (sin tocar código) |
| Textos de la landing (club, cancha, FAQ, modalidades, eventos) | `content/landing.ts` |
| Fotos de la landing (hero, galería, secciones) | `content/media.ts` + archivos en `public/landing/` |
| Logo | `components/brand/logo.tsx` y `app/icon.svg` |
| Colores y tipografías | `app/globals.css` (tokens) y `app/layout.tsx` (fuentes) |

### Imágenes de la landing

Las imágenes de la landing son parte del sitio (código), no de la base: viven en `public/landing/` y se declaran en un único índice, `content/media.ts`. La base y Storage guardan solo lo que carga el admin (avatares de equipos, portadas y fotos de torneos, que se ven en la pestaña **Fotos** de cada torneo, y el mapa de la cancha).

| Imagen (`content/media.ts`) | Dónde se ve | Archivo |
| --- | --- | --- |
| `hero` | Portada (desktop) | `public/landing/hero.webp` |
| `heroMobile` | Portada (celular) | `public/landing/hero-mobile.webp` |
| `teeShot` | Sección "Qué es" (`#que-es`) | `public/landing/tee-shot.webp` |
| `greenGolden` | "El club" (`#club`, foto grande) y galería | `public/landing/green-golden.webp` |
| `teamGroup` | "El club" (`#club`, foto chica) y galería | `public/landing/team-group.webp` |
| `flag9` | "La cancha" (`#cancha`, fondo) y galería | `public/landing/flag-9.webp` |
| `flagHill` | Galería | `public/landing/flag-hill.webp` |
| `course` | Galería | `public/landing/course.webp` |
| `teamFlag` | Galería | `public/landing/team-flag.webp` |
| `playersMountains` | Galería | `public/landing/players-mountains.webp` |

**Cómo reemplazar una imagen:**

- **Mismo nombre:** reemplazá el archivo en `public/landing/` por tu foto (idealmente WebP, 1600–1920 px de ancho). Si cambia la proporción, actualizá `width` y `height` en `content/media.ts`.
- **Otro archivo:** copialo a `public/landing/` y en `content/media.ts` cambiá el nombre, `width`, `height` y `alt`.
- Si la foto es del club, borrá su `credit`. Las fotos de muestra actuales son de Wikimedia Commons (licencias CC) y se van a reemplazar por fotos propias; `credit` solo registra de dónde salen, el sitio no tiene página de créditos.
- El orden de la galería se define en `landingGallery` (mismo archivo).

**Excepción: el mapa de la cancha.** El mapa del momento no está en `public/landing/`. Lo sube el admin desde **Datos del club** (`/vestuario/club`) y se guarda en Storage (`tournament-media/club/`). Se ve en "La cancha" (`#mapa`) y, mientras haya uno cargado, el inicio muestra el atajo "Ver mapa de la cancha". Al reemplazarlo o quitarlo, el archivo anterior se borra.

> ⚠️ Los textos del club y de la cancha en `content/landing.ts` son **provisorios**: revisalos con Los Cedros.

---

## 6. Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm test` | Tests de la lógica de puntos, desempates, ranking y utilidades |
| `npm run db:verify` | Aplica migraciones + seed en un Postgres en memoria y verifica RLS y reglas de integridad (no necesita Docker) |
| `npm run db:seed` | Regenera `supabase/seed.sql` a partir de `lib/demo/data.ts` |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

---

## 7. Checklist de revisión visual (mobile primero)

Probá en el celular (y con las herramientas de desarrollo en 360, 375, 390, 430, 768 y 1440 px):

- [ ] Ninguna página se mueve de costado (sin scroll horizontal).
- [ ] Botones y links fáciles de tocar con el pulgar (≈ 44 px o más).
- [ ] La barra inferior no tapa contenido y respeta el borde del iPhone.
- [ ] Hero: se lee bien el título sobre la foto; la foto vertical se ve en el celular.
- [ ] Tabla de torneo: posición, equipo y puntos quedan fijos; el resto se desliza dentro de la tabla.
- [ ] Tocar un equipo en la tabla abre sus cruces.
- [ ] Pestaña Fechas: el selector de fechas se desliza y cada cruce muestra el 2–1 y el ganador por modalidad.
- [ ] Botones de WhatsApp: abren la app con el mensaje ya escrito.
- [ ] "Cómo llegar" abre Google Maps.
- [ ] Panel: crear equipo con foto desde el celular, crear torneo, armar cruces y cargar resultados con una mano.
- [ ] Con "Reducir movimiento" activado en el sistema, las animaciones se calman.
- [ ] Lighthouse (Chrome → DevTools → Lighthouse → Mobile): objetivo ≥ 90 en Performance y ≥ 95 en Accesibilidad en `/`, `/torneos/…` y `/ranking`.

---

## 8. Estructura

```
app/(public)/          sitio público (landing, torneos, ranking, equipos, créditos)
app/vestuario/         panel de administración (login, equipos, torneos, fechas, fotos, club)
components/            UI pública, del panel y de torneos
content/               textos e imágenes de la landing
lib/standings/         cálculo de tablas y ranking (funciones puras, testeadas)
lib/data/              lectura de datos (snapshot + selectores)
lib/demo/              datos de ejemplo (modo demo y seed)
supabase/migrations/   esquema, integridad, RLS, storage
tests/unit/            tests (Vitest)
```
