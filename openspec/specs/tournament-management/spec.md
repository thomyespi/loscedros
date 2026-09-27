# tournament-management Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Alta de torneos
El admin SHALL poder crear un torneo con un nombre obligatorio (único), una descripción opcional, una imagen de portada opcional, la cantidad de fechas (entero ≥ 1, sin máximo fijo), el día de calendario de cada fecha y los equipos participantes (al menos 2, elegidos entre los equipos activos). El torneo MUST crearse en estado "borrador". El sistema MUST generar un slug único.

#### Scenario: Crear torneo de 4 fechas
- **WHEN** el admin crea "Clausura 2026" con 4 fechas, un día asignado a cada una y 6 equipos
- **THEN** el torneo queda en borrador, con las Fechas 1 a 4 en sus días y los 6 equipos inscriptos

#### Scenario: Menos de dos equipos
- **WHEN** el admin intenta guardar un torneo con un solo equipo
- **THEN** el sistema rechaza el guardado con el mensaje "El torneo necesita al menos 2 equipos"

### Requirement: Días de las fechas
Cada fecha SHALL tener un número correlativo (1..N) y un día de calendario (sin hora; el lugar es siempre Los Cedros). Los días MUST ser no decrecientes según el número de fecha. Los días MUST mostrarse en la zona horaria America/Argentina/Buenos_Aires.

#### Scenario: Días desordenados
- **WHEN** el admin asigna a la Fecha 2 un día anterior al de la Fecha 1
- **THEN** el sistema rechaza el cambio y avisa que las fechas deben estar en orden cronológico

### Requirement: Agregar y quitar fechas
El admin SHALL poder agregar fechas al final de un torneo existente. Una fecha SHALL poder quitarse solo si no tiene cruces cargados y es la última. Al quitarla, las fechas restantes conservan su numeración.

#### Scenario: Quitar fecha con cruces
- **WHEN** el admin intenta quitar una fecha que tiene cruces
- **THEN** el sistema lo impide e indica que primero hay que borrar sus cruces

### Requirement: Equipos participantes
El admin SHALL poder agregar equipos a un torneo en cualquier estado que no sea "finalizado". Un equipo MUST NOT poder quitarse de un torneo si tiene cruces cargados en él.

#### Scenario: Quitar equipo que ya jugó
- **WHEN** el admin intenta quitar un equipo que tiene cruces en el torneo
- **THEN** el sistema lo impide con un mensaje explicativo

### Requirement: Estados del torneo
Un torneo SHALL tener uno de estos estados: `borrador`, `proximo`, `en_curso` o `finalizado`, que el admin cambia manualmente. Los torneos en `borrador` MUST NOT ser visibles al público. Al pasar a `finalizado`, el sistema SHALL calcular y guardar el campeón (el primero de la tabla) y MUST pedir confirmación si hay cruces sin los 3 resultados cargados. Un torneo finalizado SHALL poder reabrirse (volver a `en_curso`), lo que borra el campeón guardado.

#### Scenario: Publicar torneo
- **WHEN** el admin cambia un torneo de `borrador` a `proximo`
- **THEN** el torneo aparece en la sección pública de torneos

#### Scenario: Finalizar con resultados incompletos
- **WHEN** el admin finaliza un torneo con cruces a los que les faltan resultados
- **THEN** el sistema muestra cuántos cruces están incompletos y pide confirmación antes de finalizar

#### Scenario: Campeón guardado
- **WHEN** el admin finaliza un torneo
- **THEN** el equipo primero en la tabla queda registrado como campeón y suma un título en el ranking histórico

### Requirement: Edición y borrado de torneos
El admin SHALL poder editar nombre, descripción y portada en cualquier estado. Borrar un torneo MUST exigir que el admin escriba su nombre como confirmación, y MUST eliminar en cascada sus fechas, cruces, resultados y fotos.

#### Scenario: Borrado confirmado
- **WHEN** el admin escribe el nombre exacto del torneo y confirma el borrado
- **THEN** el torneo y todos sus datos asociados se eliminan, y el ranking histórico se recalcula sin él

### Requirement: Dashboard del admin
La portada del panel SHALL mostrar accesos rápidos: el torneo en curso con su próxima fecha y un botón "Cargar resultados", la cantidad de cruces pendientes de resultado, y atajos para crear equipo y crear torneo.

#### Scenario: Acceso rápido a resultados
- **WHEN** el admin entra a `/vestuario` y hay un torneo en curso
- **THEN** ve un botón que lo lleva directo a la fecha más próxima de ese torneo

