# public-tournaments Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Listado público de torneos
La página `/torneos` SHALL mostrar los torneos publicados agrupados en "En curso", "Próximos" y "Finalizados" (este último ordenado del más reciente al más antiguo). Cada tarjeta SHALL mostrar la portada o un fondo generado, el nombre, el estado, las fechas de inicio y fin, la cantidad de equipos y, según el caso, el líder actual o el campeón. Si no hay torneos publicados, SHALL mostrar un estado vacío con un CTA de consulta por WhatsApp. Debajo del listado (o del estado vacío) SHALL mostrar la sección "Modalidades de torneo" con las tres modalidades (Individual, Four Ball, Foursome) y cómo se suman los puntos.

#### Scenario: Listado con torneos
- **WHEN** hay un torneo en curso y dos finalizados
- **THEN** se muestra primero el grupo "En curso" y después "Finalizados", con cada campeón en su tarjeta

#### Scenario: Modalidades en torneos
- **WHEN** un visitante abre `/torneos`, haya o no torneos publicados
- **THEN** debajo del listado ve las tres modalidades con su descripción y la explicación de los puntos

### Requirement: Detalle del torneo
La página `/torneos/[slug]` SHALL mostrar un encabezado (nombre, estado, rango de fechas, cantidad de equipos y descripción) y pestañas: "Tabla", "Fechas" y, si hay fotos, "Fotos". La pestaña activa MUST reflejarse en la URL para poder compartirla. Un torneo en borrador o inexistente MUST devolver 404.

#### Scenario: Compartir pestaña
- **WHEN** un visitante abre la pestaña "Fechas" y comparte el link
- **THEN** quien lo abre ve directamente la pestaña "Fechas"

#### Scenario: Torneo en borrador
- **WHEN** alguien abre la URL de un torneo en borrador
- **THEN** recibe una página 404

### Requirement: Tabla responsive
En mobile, la tabla de posiciones SHALL mostrar fijas las columnas posición, equipo y PTS, y las demás columnas SHALL verse con scroll horizontal dentro de la tabla (sin scroll de página), manteniendo fija la columna del equipo. Los tres primeros puestos SHALL tener un tratamiento visual destacado (oro, plata y bronce). Tocar un equipo SHALL mostrar sus cruces en ese torneo.

#### Scenario: Tabla en 375px
- **WHEN** un visitante ve la tabla en un celular
- **THEN** ve posición, equipo y puntos sin desplazarse, y puede deslizar para ver el resto de las columnas

### Requirement: Fechas y resultados
La pestaña "Fechas" SHALL mostrar un selector horizontal de fechas (Fecha 1..N con su día) que abre por defecto la próxima fecha a jugar o la última jugada. Cada cruce SHALL mostrarse como una tarjeta con los dos equipos, la cantidad de modalidades ganadas por cada uno (por ejemplo 2–1), el detalle de cada modalidad (ganador y marcador opcional) y un indicador de "pendiente" si falta algún resultado. Los equipos libres de la fecha SHALL listarse aparte.

#### Scenario: Ver una fecha jugada
- **WHEN** un visitante selecciona la Fecha 2
- **THEN** ve cada cruce con su resultado 2–1 o 3–0 y quién ganó Individual, Four Ball y Foursome

#### Scenario: Fecha sin cruces
- **WHEN** una fecha todavía no tiene cruces
- **THEN** se muestra "Cruces a confirmar" junto al día de la fecha

### Requirement: Página del equipo
La página `/equipos/[slug]` SHALL mostrar el avatar y nombre del equipo, sus totales históricos (puntos, títulos, torneos jugados, cruces ganados), los torneos en los que participó con su posición final o actual, y sus últimos cruces.

#### Scenario: Ver equipo desde una tabla
- **WHEN** un visitante toca el nombre de un equipo en el ranking histórico
- **THEN** llega a la página del equipo con su historial

### Requirement: Datos actualizados
Las páginas públicas de torneos, ranking y equipos SHALL mostrar los datos actualizados inmediatamente después de cada cambio hecho en el admin, invalidando la caché de las rutas afectadas.

#### Scenario: Resultado recién cargado
- **WHEN** el admin carga un resultado y un visitante recarga el torneo
- **THEN** el visitante ve el resultado y la tabla actualizados

