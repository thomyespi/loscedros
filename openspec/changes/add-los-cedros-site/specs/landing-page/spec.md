## ADDED Requirements

### Requirement: Diseño mobile-first
Todas las páginas públicas SHALL diseñarse primero para pantallas de 360–430px de ancho y adaptarse luego a tablet y desktop. Ningún contenido MUST generar scroll horizontal de página, los elementos interactivos MUST tener un área táctil mínima de 44×44px y el texto base MUST ser de al menos 16px.

#### Scenario: Visualización en celular
- **WHEN** un visitante abre cualquier página pública en un viewport de 375px
- **THEN** todo el contenido se ve sin scroll horizontal y los botones y links son cómodos de tocar

#### Scenario: Visualización en desktop
- **WHEN** un visitante abre la landing en un viewport de 1440px
- **THEN** el layout aprovecha el ancho con grillas de varias columnas sin estirar textos más allá de un ancho legible

### Requirement: Navegación pública
El sitio SHALL tener, en mobile, una barra de navegación inferior fija con los accesos Inicio, Torneos, Ranking y un botón destacado de WhatsApp, y un header compacto con el logo. En desktop SHALL mostrar un header superior con esos mismos links. La navegación MUST NOT incluir ningún link al panel de administración.

#### Scenario: Navegación inferior en mobile
- **WHEN** un visitante hace scroll en cualquier página pública en mobile
- **THEN** la barra inferior sigue visible, respeta el safe-area del dispositivo y marca la sección activa

#### Scenario: Sin rastros del admin
- **WHEN** se inspecciona la navegación, el footer, el sitemap o el robots.txt
- **THEN** no aparece ninguna referencia a la ruta del panel de administración

### Requirement: Secciones de la landing
La home SHALL incluir, en este orden: Hero (imagen o video de fondo, eslogan, CTA "Ver torneos" y CTA "Avisá que venís" por WhatsApp), Torneo en vivo, ¿Qué es el footgolf?, El club, La cancha (18 hoyos, horarios, servicios), Modalidades (Individual, Four Ball, Foursome), Ranking histórico (top 5), Eventos y grupos, Galería, Cómo llegar (mapa y dirección), Preguntas frecuentes y Footer con contacto y redes. La landing MUST NOT mostrar tarifas.

#### Scenario: Recorrido completo
- **WHEN** un visitante recorre la home de arriba hacia abajo
- **THEN** encuentra todas las secciones en el orden definido y sin ninguna mención de precios

### Requirement: Bloque de torneo en vivo
La sección "Torneo en vivo" SHALL mostrar el torneo con estado "en curso" (o, si no hay ninguno, el próximo torneo) con su nombre, su próxima fecha y el top 3 de su tabla, y un link al detalle. Si no hay torneos en curso ni próximos, SHALL mostrar el último campeón. Si nunca hubo torneos, la sección MUST ocultarse.

#### Scenario: Hay un torneo en curso
- **WHEN** existe un torneo con estado "en curso"
- **THEN** la home muestra su nombre, la próxima fecha a jugar, los 3 primeros de la tabla y un botón "Ver torneo"

#### Scenario: No hay torneos
- **WHEN** no existe ningún torneo publicado
- **THEN** la sección de torneo en vivo no se renderiza

### Requirement: Contacto por WhatsApp
Todos los CTAs de contacto SHALL abrir WhatsApp (`https://wa.me/<número>`) con un mensaje ya escrito según el contexto: aviso de que vas a jugar, consulta general, consulta por un torneo específico (incluyendo su nombre) o consulta por eventos o grupos. El número MUST leerse de la configuración del sitio.

#### Scenario: Aviso de que vas a jugar
- **WHEN** un visitante toca "Avisá que venís"
- **THEN** se abre WhatsApp con el número del club y un mensaje del tipo "¡Hola Los Cedros! Quiero ir a jugar el día ___ a las ___. Somos ___ personas."

#### Scenario: Consulta por torneo
- **WHEN** un visitante toca "Consultar por WhatsApp" en el detalle del torneo "Apertura 2026"
- **THEN** se abre WhatsApp con un mensaje que menciona "Apertura 2026"

### Requirement: Ubicación y horarios
La sección "Cómo llegar" SHALL mostrar la dirección (César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires), un mapa embebido con carga diferida y un botón "Cómo llegar" que abra Google Maps con la ruta. Los horarios SHALL leerse de la configuración del sitio.

#### Scenario: Abrir la ruta
- **WHEN** un visitante toca "Cómo llegar" desde el celular
- **THEN** se abre Google Maps con el destino cargado

### Requirement: Animaciones y performance
La landing SHALL usar animaciones de entrada al hacer scroll, contadores animados y micro-interacciones, y MUST respetar `prefers-reduced-motion`. La página MUST alcanzar un Lighthouse mobile ≥ 90 en Performance y ≥ 95 en Accesibilidad, con imágenes optimizadas y carga diferida debajo del primer pantallazo.

#### Scenario: Movimiento reducido
- **WHEN** el sistema operativo del visitante tiene activado "reducir movimiento"
- **THEN** las animaciones se desactivan o se reducen a transiciones de opacidad

### Requirement: SEO y previsualizaciones
El sitio SHALL generar metadatos (title, description, Open Graph y Twitter) por página, un `sitemap.xml` con las páginas públicas y los torneos publicados, datos estructurados `SportsActivityLocation` para el club e imágenes Open Graph dinámicas para cada torneo.

#### Scenario: Compartir un torneo
- **WHEN** alguien comparte el link de un torneo por WhatsApp
- **THEN** la previsualización muestra una imagen con el nombre del torneo y el líder actual o el campeón
