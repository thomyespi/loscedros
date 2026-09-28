# media-gallery Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Carga opcional de fotos
El admin SHALL poder subir, de forma opcional, varias fotos a la vez a un torneo, asociándolas opcionalmente a una fecha concreta, con un epígrafe opcional. Las imágenes MUST comprimirse en el cliente (lado mayor de 1920px como máximo, en WebP) antes de subirse. Ningún flujo MUST exigir fotos.

#### Scenario: Subir fotos desde el celular
- **WHEN** el admin selecciona 10 fotos de la galería del celular para la Fecha 2
- **THEN** se suben comprimidas, mostrando el progreso, y quedan asociadas a la Fecha 2

### Requirement: Gestión de fotos
El admin SHALL poder borrar fotos, editar su epígrafe, cambiar su orden y marcar una foto como portada del torneo.

#### Scenario: Borrar foto
- **WHEN** el admin borra una foto
- **THEN** se elimina de la base de datos y de Storage

### Requirement: Galería pública
La pestaña "Fotos" del torneo SHALL mostrar una grilla adaptable con filtro por fecha y un visor a pantalla completa que permita deslizar con el dedo entre fotos. Si el torneo no tiene fotos, la pestaña MUST ocultarse.

#### Scenario: Deslizar en el visor
- **WHEN** un visitante abre una foto en mobile y desliza a la izquierda
- **THEN** ve la siguiente foto

### Requirement: Galería de la landing
La sección Galería de la landing SHALL mostrar únicamente imágenes incluidas en el código del sitio (declaradas en el índice de imágenes de la landing). MUST NOT mostrar fotos de torneos ni ninguna otra imagen guardada en la base o en Storage. Las fotos de torneos SHALL seguir viéndose en la pestaña "Fotos" de cada torneo.

#### Scenario: Torneos con fotos cargadas
- **WHEN** hay torneos publicados con fotos subidas desde el panel
- **THEN** la galería de la landing sigue mostrando solo las imágenes del sitio, y las fotos de torneos se ven en el detalle de cada torneo

#### Scenario: Cambiar una foto de la galería
- **WHEN** se reemplaza un archivo de la galería en la carpeta de imágenes de la landing y se despliega el sitio
- **THEN** la galería muestra la nueva imagen sin ningún cambio en la base

