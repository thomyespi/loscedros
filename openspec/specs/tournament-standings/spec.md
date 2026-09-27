# tournament-standings Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Tabla de posiciones del torneo
Cada torneo SHALL tener una tabla de posiciones con todos sus equipos inscriptos (aunque todavía no hayan jugado) y estas columnas: posición, equipo (avatar y nombre), PJ (cruces completos jugados), PG (cruces ganados), PP (cruces perdidos), modalidades ganadas por tipo (IND, FB, FS) y PTS (puntos). La tabla MUST calcularse siempre a partir de los resultados cargados y nunca guardarse a mano.

#### Scenario: Tabla inicial
- **WHEN** un torneo tiene 6 equipos inscriptos y ningún resultado
- **THEN** la tabla muestra los 6 equipos con todo en 0, ordenados alfabéticamente

#### Scenario: Corrección de resultado
- **WHEN** el admin cambia el ganador de una modalidad
- **THEN** la tabla pública refleja el cambio en la siguiente carga de la página

### Requirement: Criterios de desempate
La tabla SHALL ordenarse por: 1) puntos (desc.); 2) cruces ganados (desc.); 3) enfrentamiento directo: puntos obtenidos solamente en los cruces entre los equipos empatados (desc.); 4) modalidades Individual ganadas (desc.); 5) nombre del equipo (asc.), como último recurso determinístico. El criterio 3 MUST calcularse como una mini-tabla entre todos los equipos que siguen empatados después del criterio 2.

#### Scenario: Desempate por cruces ganados
- **WHEN** A y B tienen 18 puntos, A ganó 3 cruces y B ganó 2
- **THEN** A queda por encima de B

#### Scenario: Desempate por enfrentamiento directo
- **WHEN** A y B empatan en puntos y en cruces ganados, y en su único cruce A ganó 2 modalidades y B 1
- **THEN** A queda por encima de B

#### Scenario: Triple empate
- **WHEN** A, B y C empatan en puntos y cruces ganados
- **THEN** se ordenan según los puntos obtenidos solo en los cruces entre A, B y C y, si persiste el empate, por modalidades Individual ganadas

### Requirement: Campeón del torneo
Cuando un torneo está `finalizado`, el campeón SHALL ser el equipo guardado al finalizarlo (primero de la tabla según los criterios de desempate).

#### Scenario: Visualización del campeón
- **WHEN** un visitante abre un torneo finalizado
- **THEN** ve al campeón destacado con su avatar y una animación de celebración

### Requirement: Lógica de cálculo testeada
El cálculo de la tabla y de los desempates SHALL implementarse como una función pura en TypeScript, con tests unitarios que cubran cada criterio de desempate, los resultados parciales y los equipos sin cruces.

#### Scenario: Suite de tests
- **WHEN** se ejecuta `npm test`
- **THEN** pasan todos los tests de la lógica de posiciones

