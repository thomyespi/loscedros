## MODIFIED Requirements

### Requirement: Ubicación y horarios
La sección "Cómo llegar" SHALL mostrar la dirección (César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires), un mapa embebido con carga diferida y un botón "Cómo llegar" que abra Google Maps con la ruta. Los horarios SHALL leerse de la configuración del sitio y mostrarse con el texto completo del formateador (por ejemplo "Miércoles a domingo, de 10 a 16:30 h").

#### Scenario: Abrir la ruta
- **WHEN** un visitante toca "Cómo llegar" desde el celular
- **THEN** se abre Google Maps con el destino cargado

#### Scenario: Horario en Cómo llegar
- **WHEN** el horario configurado es miércoles a domingo, de 10:00 a 16:30
- **THEN** "Cómo llegar" muestra "Miércoles a domingo, de 10 a 16:30 h"

### Requirement: Estadísticas del club
Los datos destacados de la sección "El club" MUST NOT incluir la cantidad de equipos en el ranking. El dato sobre apertura SHALL mostrar la cantidad de días abiertos por semana según la configuración, y MUST NOT tener un número de horas o días escrito a mano.

#### Scenario: Ranking con equipos
- **WHEN** el ranking histórico tiene 12 equipos
- **THEN** la sección "El club" no muestra ningún dato "equipos en el ranking"

#### Scenario: Días abiertos
- **WHEN** el horario configurado es miércoles a domingo
- **THEN** "El club" muestra "5 días abiertos por semana"

## ADDED Requirements

### Requirement: Horario derivado en toda la landing
Todos los lugares de la landing que muestran días u horas de apertura SHALL derivarlos del horario configurado: el dato "Horario" del hero (texto corto, por ejemplo "10–16:30 h"), la tarjeta de apertura de "La cancha" (título "Abierto todos los días" o "Abierto de <día> a <día>"), el texto de horarios de "La cancha", "Cómo llegar" y el footer. La home SHALL incluir el horario en sus datos estructurados (`openingHoursSpecification` de schema.org) con los días y horas configurados.

#### Scenario: Hero con horario con minutos
- **WHEN** el horario configurado es de 10:00 a 16:30
- **THEN** el dato "Horario" del hero muestra "10–16:30 h"

#### Scenario: Tarjeta de apertura
- **WHEN** el horario configurado es miércoles a domingo
- **THEN** la tarjeta de "La cancha" dice "Abierto de miércoles a domingo" y no "Abierto todos los días"

#### Scenario: Datos estructurados
- **WHEN** un buscador lee la home con horario miércoles a domingo de 10:00 a 16:30
- **THEN** el JSON-LD incluye `openingHoursSpecification` con `dayOfWeek` de miércoles a domingo, `opens` "10:00" y `closes` "16:30"
