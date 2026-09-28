## MODIFIED Requirements

### Requirement: Configuración editable del club
El sistema SHALL guardar una única fila de configuración con: horarios (texto, valor inicial "Todos los días de 9 a 19 h"), número de WhatsApp (formato internacional, valor inicial `5491139567637`), usuario de Instagram (valor inicial `los_cedros_footgolf`), dirección (valor inicial "César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires") y mapa del momento de la cancha (imagen opcional, sin valor inicial). El admin SHALL poder editarla desde `/vestuario/club`.

#### Scenario: Cambiar horarios
- **WHEN** el admin cambia los horarios a "Mar a Dom de 9 a 19 h"
- **THEN** la landing y el footer muestran el nuevo horario en la siguiente carga

#### Scenario: WhatsApp inválido
- **WHEN** el admin guarda un número de WhatsApp con letras o con menos de 10 dígitos
- **THEN** el sistema rechaza el guardado y muestra el formato esperado

## ADDED Requirements

### Requirement: Mapa del momento
El admin SHALL poder subir, reemplazar y quitar la imagen del mapa vigente de la cancha desde `/vestuario/club`. La imagen SHALL comprimirse en el navegador, guardarse en Storage con su ancho y alto, y verse en la landing en la siguiente carga, sin deploy. Al reemplazar o quitar el mapa, el archivo anterior MUST borrarse de Storage. Guardar los demás datos del club MUST NOT modificar el mapa. Solo el admin MUST poder cambiarlo.

#### Scenario: Subir el primer mapa
- **WHEN** no hay mapa cargado y el admin sube una imagen desde `/vestuario/club`
- **THEN** el panel muestra la vista previa y la sección "La cancha" de la landing muestra el mapa

#### Scenario: Reemplazar el mapa
- **WHEN** el admin sube un mapa nuevo con uno ya cargado
- **THEN** la landing muestra el mapa nuevo y el archivo anterior se borra de Storage

#### Scenario: Quitar el mapa
- **WHEN** el admin confirma "Quitar" en la tarjeta del mapa
- **THEN** la landing deja de mostrar el mapa y el atajo del hero

#### Scenario: Archivo demasiado grande o de otro tipo
- **WHEN** el admin elige un archivo que no es una imagen o que supera el límite después de comprimirse
- **THEN** el panel muestra un error y el mapa actual no cambia
