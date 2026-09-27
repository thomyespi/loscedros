## ADDED Requirements

### Requirement: Alta de equipos
El admin SHALL poder crear equipos con un nombre obligatorio (entre 2 y 40 caracteres, único sin distinguir mayúsculas) y un avatar opcional. El sistema MUST generar un slug único a partir del nombre.

#### Scenario: Crear equipo con avatar
- **WHEN** el admin crea el equipo "Los Pibes del Hoyo 9" subiendo una imagen
- **THEN** el equipo queda guardado con el slug `los-pibes-del-hoyo-9` y el avatar se ve en el listado

#### Scenario: Nombre duplicado
- **WHEN** el admin intenta crear un equipo con un nombre que ya existe (sin importar mayúsculas)
- **THEN** el sistema rechaza el alta con el mensaje "Ya existe un equipo con ese nombre"

### Requirement: Avatar del equipo
El avatar SHALL aceptar imágenes JPG, PNG o WebP, que se recortan a cuadrado y se comprimen en el cliente a un máximo de 512×512px en WebP antes de subirse a Storage. Si el equipo no tiene avatar, el sistema MUST mostrar uno generado con las iniciales del nombre sobre un color derivado de forma determinística del nombre.

#### Scenario: Foto grande del celular
- **WHEN** el admin sube una foto de 6 MB desde el celular
- **THEN** se sube una versión WebP de hasta 512×512px

#### Scenario: Sin avatar
- **WHEN** un equipo no tiene avatar
- **THEN** en todas las vistas se muestra un círculo con sus iniciales y siempre el mismo color para ese equipo

### Requirement: Edición de equipos
El admin SHALL poder editar el nombre y reemplazar o quitar el avatar de un equipo. El slug MUST mantenerse estable después de la creación para no romper links compartidos.

#### Scenario: Renombrar equipo
- **WHEN** el admin cambia el nombre de un equipo
- **THEN** el nuevo nombre aparece en todas las tablas y resultados, históricos incluidos, y su URL no cambia

### Requirement: Archivado y borrado de equipos
Un equipo que participa o participó de algún torneo MUST NOT poder borrarse. En su lugar el admin SHALL poder archivarlo: un equipo archivado no aparece al elegir equipos para nuevos torneos, pero se mantiene en tablas, resultados y ranking histórico. Un equipo sin participaciones SHALL poder borrarse definitivamente después de una confirmación.

#### Scenario: Borrar equipo con historial
- **WHEN** el admin intenta borrar un equipo que jugó un torneo
- **THEN** el sistema ofrece archivarlo en lugar de borrarlo

#### Scenario: Restaurar equipo archivado
- **WHEN** el admin desarchiva un equipo
- **THEN** vuelve a estar disponible para nuevos torneos

### Requirement: Listado de equipos en el admin
El panel SHALL listar los equipos con su avatar, nombre, cantidad de torneos jugados y estado (activo o archivado), con buscador por nombre y filtro por estado.

#### Scenario: Buscar equipo
- **WHEN** el admin escribe "cedr" en el buscador
- **THEN** el listado muestra solo los equipos cuyo nombre contiene "cedr"
