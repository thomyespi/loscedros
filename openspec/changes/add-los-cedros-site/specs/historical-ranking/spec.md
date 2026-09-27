## ADDED Requirements

### Requirement: Ranking histórico acumulado
El sistema SHALL mostrar en `/ranking` una tabla histórica que sume los resultados de todos los torneos publicados (sin contar los borradores), desde el primero. Las columnas SHALL ser: posición, equipo, títulos, torneos jugados, PJ, PG, modalidades ganadas (IND, FB, FS) y PTS.

#### Scenario: Suma entre torneos
- **WHEN** un equipo hizo 18 puntos en el Apertura y 12 en el Clausura
- **THEN** el ranking histórico le muestra 30 puntos y 2 torneos jugados

### Requirement: Equipos incluidos
El ranking histórico SHALL incluir a todos los equipos que participaron de al menos un torneo publicado (incluso archivados) y a todos los equipos activos, aunque tengan 0 puntos. Los equipos archivados que nunca jugaron MUST NOT aparecer.

#### Scenario: Equipo nuevo sin torneos
- **WHEN** existe un equipo activo que todavía no jugó ningún torneo
- **THEN** aparece en el ranking con 0 puntos

#### Scenario: Equipo archivado con historial
- **WHEN** un equipo archivado jugó torneos anteriores
- **THEN** aparece en el ranking con sus puntos acumulados

### Requirement: Títulos
La columna de títulos SHALL contar los torneos finalizados en los que el equipo fue campeón, y SHALL mostrar un ícono de trofeo con la cantidad.

#### Scenario: Bicampeón
- **WHEN** un equipo ganó dos torneos finalizados
- **THEN** su fila muestra 2 títulos con un ícono de trofeo

### Requirement: Orden del ranking histórico
El ranking SHALL ordenarse por: 1) puntos (desc.); 2) títulos (desc.); 3) cruces ganados (desc.); 4) modalidades Individual ganadas (desc.); 5) nombre (asc.).

#### Scenario: Empate en puntos
- **WHEN** dos equipos tienen los mismos puntos históricos y uno tiene más títulos
- **THEN** el que tiene más títulos queda arriba
