# match-results Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Cruces por fecha
En cada fecha, el admin SHALL poder crear cruces entre dos equipos inscriptos en el torneo. Un equipo MUST NOT enfrentarse a sí mismo y MUST NOT aparecer en más de un cruce en la misma fecha. Los equipos inscriptos que no tienen cruce en una fecha SHALL mostrarse como "Libre" en esa fecha. Los mismos dos equipos SHALL poder enfrentarse en distintas fechas.

#### Scenario: Armar cruces
- **WHEN** el admin arma en la Fecha 1 los cruces A vs B y C vs D en un torneo de 5 equipos
- **THEN** la fecha muestra los dos cruces y al equipo E como "Libre"

#### Scenario: Equipo repetido en la fecha
- **WHEN** el admin intenta crear el cruce A vs C en una fecha donde A ya juega contra B
- **THEN** el sistema lo rechaza y el selector no ofrece a A como opción

### Requirement: Selector cómodo de cruces
La pantalla de una fecha SHALL permitir armar los cruces tocando equipos de una lista (primero uno, después su rival), mostrando solo los equipos todavía libres en esa fecha, y SHALL advertir, sin bloquear, si ese cruce ya se jugó en otra fecha del torneo.

#### Scenario: Cruce repetido
- **WHEN** el admin arma A vs B en la Fecha 3 y ya se habían enfrentado en la Fecha 1
- **THEN** se muestra la advertencia "Ya se enfrentaron en la Fecha 1", pero el cruce se puede guardar

### Requirement: Ganador por modalidad
Cada cruce SHALL tener tres modalidades: Individual, Four Ball y Foursome. Para cada una, el admin SHALL poder marcar al ganador, que MUST ser uno de los dos equipos del cruce (no hay empate). Cada modalidad SHALL admitir además un marcador opcional en texto libre (hasta 20 caracteres, por ejemplo "3&2" o "1 UP"). El admin SHALL poder cambiar o borrar un resultado ya cargado.

#### Scenario: Cargar ganador
- **WHEN** el admin toca el equipo A en la fila Individual del cruce A vs B
- **THEN** A queda como ganador de la modalidad Individual y se guarda sin necesidad de otro botón

#### Scenario: Ganador ajeno al cruce
- **WHEN** alguien intenta guardar como ganador a un equipo que no pertenece al cruce
- **THEN** la base de datos rechaza la operación

### Requirement: Puntaje
Cada modalidad ganada SHALL otorgar 3 puntos al equipo ganador y 0 al perdedor. Los resultados parciales (un cruce con menos de 3 modalidades cargadas) MUST sumar los puntos de las modalidades ya cargadas.

#### Scenario: Cruce completo
- **WHEN** A gana Individual y Four Ball, y B gana Foursome
- **THEN** A suma 6 puntos y B suma 3 en ese cruce

### Requirement: Estado del cruce
Un cruce SHALL considerarse "completo" cuando tiene las 3 modalidades cargadas y "pendiente" en otro caso. El ganador del cruce SHALL ser el equipo que ganó 2 o 3 modalidades, y solo se determina cuando el cruce está completo.

#### Scenario: Cruce pendiente
- **WHEN** un cruce tiene cargadas solo 2 modalidades, una para cada equipo
- **THEN** se muestra como "pendiente", sin ganador del cruce, y los dos equipos suman sus 3 puntos parciales

### Requirement: Borrado de cruces
El admin SHALL poder borrar un cruce, lo que MUST eliminar también sus resultados, previa confirmación si tenía resultados cargados.

#### Scenario: Borrar cruce con resultados
- **WHEN** el admin borra un cruce que tiene resultados
- **THEN** el sistema pide confirmación y, al aceptar, elimina el cruce y sus resultados

