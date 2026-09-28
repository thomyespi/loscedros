## MODIFIED Requirements

### Requirement: Imágenes de la landing en el código
Todas las imágenes de la landing (hero, secciones y galería) SHALL ser archivos del propio sitio, ubicados en `public/landing/` y declarados en un único índice (`content/media.ts`) con su ruta, dimensiones, texto alternativo y, si corresponde, crédito. La landing MUST NOT leer imágenes de la base de datos ni de Storage, con una única excepción: el mapa del momento de la cancha, que carga el admin. La base y Storage SHALL usarse solo para imágenes que carga el admin: avatares de equipos, portadas y fotos de torneos, y el mapa de la cancha. El README SHALL documentar qué imagen se ve en cada sección y cómo reemplazarla. El sitio MUST NOT tener una página de créditos de fotos ni links a ella (las imágenes de muestra se reemplazan por fotos propias del club).

#### Scenario: Reemplazar la imagen del hero
- **WHEN** se reemplaza `public/landing/hero.webp` por una foto del club con el mismo nombre
- **THEN** el hero muestra la nueva foto después del deploy, sin tocar la base

#### Scenario: Landing sin base disponible
- **WHEN** la base no tiene fotos de torneos ni mapa cargados
- **THEN** todas las imágenes de la landing se ven igual que siempre y no aparece la sección del mapa

#### Scenario: Sin página de créditos
- **WHEN** un visitante entra a `/creditos` o revisa el footer
- **THEN** la ruta devuelve la página de "no encontrado" y el footer no tiene un link "Créditos de fotos"

## ADDED Requirements

### Requirement: Legibilidad del hero
En desktop (≥ 1024px), el texto del hero (título, subtítulo, CTAs y datos) MUST NOT superponerse a la persona de la foto de fondo. La banda que se desplaza debajo del hero MUST NOT tapar ningún contenido del hero en ningún tamaño de pantalla. El dato "Dónde" del hero SHALL decir "Malvinas Argentinas" y MUST verse completo, sin generar scroll horizontal, en 360px.

#### Scenario: Hero en desktop
- **WHEN** un visitante abre la home en un viewport de 1440px
- **THEN** el jugador de la foto se ve completo al costado del texto, sin quedar detrás del título

#### Scenario: Banda debajo del hero
- **WHEN** un visitante abre la home en 375px, 1280px o 1440px
- **THEN** la fila Hoyos / Horario / Dónde se ve completa y la banda que se desplaza queda debajo, sin taparla

#### Scenario: Dónde completo
- **WHEN** un visitante mira los datos del hero en 360px
- **THEN** lee "Malvinas Argentinas" completo

### Requirement: Estadísticas del club
Los datos destacados de la sección "El club" MUST NOT incluir la cantidad de equipos en el ranking.

#### Scenario: Ranking con equipos
- **WHEN** el ranking histórico tiene 12 equipos
- **THEN** la sección "El club" no muestra ningún dato "equipos en el ranking"

### Requirement: Mapa de la cancha en la landing
Cuando hay un mapa del momento cargado, la sección "La cancha" SHALL mostrarlo en un bloque con ancla `#mapa`, con carga diferida, sus dimensiones reales (sin salto de layout) y la opción de verlo en grande a pantalla completa. El hero SHALL mostrar un atajo "Ver mapa de la cancha" que lleve a `#mapa`. Si no hay mapa cargado, MUST NOT mostrarse ni el bloque ni el atajo.

#### Scenario: Con mapa cargado
- **WHEN** el admin cargó un mapa y un visitante toca "Ver mapa de la cancha" en el hero
- **THEN** la página baja hasta el mapa dentro de "La cancha"

#### Scenario: Ver en grande
- **WHEN** un visitante toca "Ver en grande" (o la imagen, en el celular)
- **THEN** el mapa se abre a pantalla completa y se puede cerrar para volver a la página

#### Scenario: Sin mapa
- **WHEN** no hay mapa cargado
- **THEN** ni "La cancha" ni el hero muestran referencias al mapa, y no queda espacio vacío

### Requirement: Agradecimiento a Gen12 Software
El footer de todas las páginas públicas SHALL incluir un agradecimiento discreto pero visible a Gen12 Software por el desarrollo del sitio, con un link a `https://gen12software.com/` que se abra en una pestaña nueva. MUST NOT ser una sección propia ni competir visualmente con el contenido del club.

#### Scenario: Link al desarrollador
- **WHEN** un visitante toca "Gen12 Software" en el footer
- **THEN** se abre https://gen12software.com/ en una pestaña nueva
