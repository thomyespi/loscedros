## MODIFIED Requirements

### Requirement: Listado público de torneos
La página `/torneos` SHALL mostrar los torneos publicados agrupados en "En curso", "Próximos" y "Finalizados" (este último ordenado del más reciente al más antiguo). Cada tarjeta SHALL mostrar la portada o un fondo generado, el nombre, el estado, las fechas de inicio y fin, la cantidad de equipos y, según el caso, el líder actual o el campeón. Si no hay torneos publicados, SHALL mostrar un estado vacío con un CTA de consulta por WhatsApp. Debajo del listado (o del estado vacío) SHALL mostrar la sección "Modalidades de torneo" con las tres modalidades (Individual, Four Ball, Foursome) y cómo se suman los puntos.

#### Scenario: Listado con torneos
- **WHEN** hay un torneo en curso y dos finalizados
- **THEN** se muestra primero el grupo "En curso" y después "Finalizados", con cada campeón en su tarjeta

#### Scenario: Modalidades en torneos
- **WHEN** un visitante abre `/torneos`, haya o no torneos publicados
- **THEN** debajo del listado ve las tres modalidades con su descripción y la explicación de los puntos
