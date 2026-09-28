## MODIFIED Requirements

### Requirement: Diseño mobile-first
Todas las páginas públicas SHALL diseñarse primero para pantallas de 360–430px de ancho y adaptarse luego a tablet y desktop. Ningún contenido MUST generar scroll horizontal de página ni quedar recortado por los bordes de la pantalla, los elementos interactivos MUST tener un área táctil mínima de 44×44px y el texto base MUST ser de al menos 16px. Los carruseles horizontales MUST hacer scroll dentro del ancho de la página sin ensanchar la sección que los contiene.

#### Scenario: Visualización en celular
- **WHEN** un visitante abre cualquier página pública en un viewport de 375px
- **THEN** todo el contenido se ve sin scroll horizontal y los botones y links son cómodos de tocar

#### Scenario: Visualización en desktop
- **WHEN** un visitante abre la landing en un viewport de 1440px
- **THEN** el layout aprovecha el ancho con grillas de varias columnas sin estirar textos más allá de un ancho legible

#### Scenario: "¿Qué es el footgolf?" en celular
- **WHEN** un visitante ve la sección "¿Qué es el footgolf?" en un viewport de 360px
- **THEN** el título, la descripción, la foto y los carteles "N° 5 pelota de fútbol" y "53 cm" se ven completos dentro de la pantalla, y al deslizar el carrusel de pasos hasta el final la tarjeta 4 se ve entera
