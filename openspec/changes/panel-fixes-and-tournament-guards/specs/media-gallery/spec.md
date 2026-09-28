## MODIFIED Requirements

### Requirement: Galería de la landing
La sección Galería de la landing SHALL mostrar únicamente imágenes incluidas en el código del sitio (declaradas en el índice de imágenes de la landing). MUST NOT mostrar fotos de torneos ni ninguna otra imagen guardada en la base o en Storage. Las fotos de torneos SHALL seguir viéndose en la pestaña "Fotos" de cada torneo.

#### Scenario: Torneos con fotos cargadas
- **WHEN** hay torneos publicados con fotos subidas desde el panel
- **THEN** la galería de la landing sigue mostrando solo las imágenes del sitio, y las fotos de torneos se ven en el detalle de cada torneo

#### Scenario: Cambiar una foto de la galería
- **WHEN** se reemplaza un archivo de la galería en la carpeta de imágenes de la landing y se despliega el sitio
- **THEN** la galería muestra la nueva imagen sin ningún cambio en la base
