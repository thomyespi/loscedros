## MODIFIED Requirements

### Requirement: Configuración editable del club
El sistema SHALL guardar una única fila de configuración con: horario de apertura estructurado (días de la semana abiertos, hora de apertura y hora de cierre; valor inicial miércoles a domingo, de 10:00 a 16:30), número de WhatsApp (formato internacional, valor inicial `5491139567637`), usuario de Instagram (valor inicial `los_cedros_footgolf`), dirección (valor inicial "César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires") y mapa del momento de la cancha (imagen opcional, sin valor inicial). El admin SHALL poder editarla desde `/vestuario/club`.

#### Scenario: Cambiar horarios
- **WHEN** el admin desmarca el miércoles y guarda
- **THEN** la landing y el footer muestran "Jueves a domingo, de 10 a 16:30 h" en la siguiente carga

#### Scenario: WhatsApp inválido
- **WHEN** el admin guarda un número de WhatsApp con letras o con menos de 10 dígitos
- **THEN** el sistema rechaza el guardado y muestra el formato esperado

### Requirement: Uso de la configuración
Todos los CTAs de WhatsApp, los links a Instagram, la dirección, el mapa y los horarios del sitio SHALL leer sus valores de esta configuración, y MUST NOT tener estos datos escritos en los componentes ni en `content/`. Todo texto del sitio que mencione días u horas de apertura SHALL generarse a partir del horario estructurado con un único formateador compartido.

#### Scenario: Cambio de número
- **WHEN** el admin cambia el número de WhatsApp
- **THEN** todos los botones de WhatsApp del sitio usan el número nuevo

#### Scenario: Cambio de horario en todo el sitio
- **WHEN** el admin cambia la hora de cierre a 18:00
- **THEN** el hero, La cancha, Cómo llegar, el footer y los datos estructurados muestran el cierre a las 18 en la siguiente carga

## ADDED Requirements

### Requirement: Edición estructurada del horario
En `/vestuario/club` el horario MUST NOT editarse como texto libre. El admin SHALL marcar los días abiertos con un botón por día (lunes a domingo) y elegir la hora de apertura y la de cierre con selectores en pasos de 30 minutos. El panel SHALL mostrar una vista previa del texto que se verá en el sitio. El sistema MUST rechazar el guardado si no hay ningún día marcado o si la hora de cierre no es posterior a la de apertura, tanto en el formulario como en el servidor y en la base de datos.

#### Scenario: Marcar días y horario
- **WHEN** el admin marca miércoles a domingo, elige abre 10:00 y cierra 16:30
- **THEN** la vista previa dice "Miércoles a domingo, de 10 a 16:30 h" y al guardar el sitio muestra ese horario

#### Scenario: Sin días
- **WHEN** el admin desmarca todos los días y guarda
- **THEN** el sistema rechaza el guardado y pide marcar al menos un día

#### Scenario: Cierre antes de la apertura
- **WHEN** el admin elige abre 16:00 y cierra 10:00
- **THEN** el sistema rechaza el guardado y avisa que el cierre tiene que ser después de la apertura

### Requirement: Formato del horario
El formateador SHALL producir textos en español: "Todos los días" cuando están los 7 días; "<Día> a <día>" para un rango contiguo de tres o más días (incluido un rango que cruza el domingo, como "Viernes a lunes"); "<Día> y <día>" para dos días; y una enumeración ("Lunes, miércoles y viernes") para días sueltos. Las horas en punto SHALL mostrarse sin minutos ("10") y las demás con minutos ("16:30").

#### Scenario: Rango contiguo
- **WHEN** los días son miércoles a domingo, de 10:00 a 16:30
- **THEN** el texto completo es "Miércoles a domingo, de 10 a 16:30 h" y el corto es "10–16:30 h"

#### Scenario: Todos los días
- **WHEN** están marcados los 7 días, de 9:00 a 19:00
- **THEN** el texto completo es "Todos los días, de 9 a 19 h"

#### Scenario: Días sueltos
- **WHEN** los días son lunes, miércoles y viernes
- **THEN** los días se muestran como "Lunes, miércoles y viernes"
