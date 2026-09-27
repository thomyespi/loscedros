## ADDED Requirements

### Requirement: Configuración editable del club
El sistema SHALL guardar una única fila de configuración con: horarios (texto, valor inicial "Todos los días de 9 a 19 h"), número de WhatsApp (formato internacional, valor inicial `5491139567637`), usuario de Instagram (valor inicial `los_cedros_footgolf`) y dirección (valor inicial "César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires"). El admin SHALL poder editarla desde `/vestuario/club`.

#### Scenario: Cambiar horarios
- **WHEN** el admin cambia los horarios a "Mar a Dom de 9 a 19 h"
- **THEN** la landing y el footer muestran el nuevo horario en la siguiente carga

#### Scenario: WhatsApp inválido
- **WHEN** el admin guarda un número de WhatsApp con letras o con menos de 10 dígitos
- **THEN** el sistema rechaza el guardado y muestra el formato esperado

### Requirement: Uso de la configuración
Todos los CTAs de WhatsApp, los links a Instagram, la dirección, el mapa y los horarios del sitio SHALL leer sus valores de esta configuración, y MUST NOT tener estos datos escritos en los componentes.

#### Scenario: Cambio de número
- **WHEN** el admin cambia el número de WhatsApp
- **THEN** todos los botones de WhatsApp del sitio usan el número nuevo
