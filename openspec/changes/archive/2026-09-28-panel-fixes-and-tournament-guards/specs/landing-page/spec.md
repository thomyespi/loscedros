## ADDED Requirements

### Requirement: Imágenes de la landing en el código
Todas las imágenes de la landing (hero, secciones y galería) SHALL ser archivos del propio sitio, ubicados en `public/landing/` y declarados en un único índice (`content/media.ts`) con su ruta, dimensiones, texto alternativo y, si corresponde, crédito. La landing MUST NOT leer imágenes de la base de datos ni de Storage. La base y Storage SHALL usarse solo para imágenes que carga el admin: avatares de equipos, portadas y fotos de torneos. El README SHALL documentar qué imagen se ve en cada sección y cómo reemplazarla. La página de créditos SHALL listar solo las imágenes que tienen crédito.

#### Scenario: Reemplazar la imagen del hero
- **WHEN** se reemplaza `public/landing/hero.webp` por una foto del club con el mismo nombre
- **THEN** el hero muestra la nueva foto después del deploy, sin tocar la base

#### Scenario: Landing sin base disponible
- **WHEN** la base no tiene fotos de torneos cargadas
- **THEN** todas las imágenes de la landing se ven igual que siempre

#### Scenario: Foto propia sin crédito
- **WHEN** una imagen del índice no tiene crédito
- **THEN** no aparece en la página de créditos

### Requirement: Respuesta inmediata al navegar
Al tocar un link de navegación del sitio público (barra inferior, header o links a torneos y equipos), el sitio SHALL dar una señal visual inmediata (indicador en el link o pantalla de carga con esqueleto) mientras la página siguiente se carga. Ninguna navegación MUST dejar la pantalla sin cambios visibles hasta que el servidor responda.

#### Scenario: Abrir un torneo desde el listado
- **WHEN** un visitante toca un torneo en `/torneos`
- **THEN** ve al instante un estado de carga y luego el detalle del torneo
