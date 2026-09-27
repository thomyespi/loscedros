# landing-page Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Diseño mobile-first
Todas las páginas públicas SHALL diseñarse primero para pantallas de 360–430px de ancho y adaptarse luego a tablet y desktop. Ningún contenido MUST generar scroll horizontal de página, los elementos interactivos MUST tener un área táctil mínima de 44×44px y el texto base MUST ser de al menos 16px.

#### Scenario: Visualización en celular
- **WHEN** un visitante abre cualquier página pública en un viewport de 375px
- **THEN** todo el contenido se ve sin scroll horizontal y los botones y links son cómodos de tocar

#### Scenario: Visualización en desktop
- **WHEN** un visitante abre la landing en un viewport de 1440px
- **THEN** el layout aprovecha el ancho con grillas de varias columnas sin estirar textos más allá de un ancho legible

### Requirement: Navegación pública
El sitio SHALL tener, en mobile, una barra de navegación inferior fija con los accesos Inicio, Torneos, Ranking y un botón destacado de WhatsApp, y un header compacto con el logo. En desktop SHALL mostrar un header superior con dos grupos separados: (1) los links a secciones de la landing, en el mismo orden en que aparecen al hacer scroll (Inicio, El club, La cancha, Galería, Cómo llegar, Preguntas), y (2) un botón aparte "Competencias" que despliega los accesos a Torneos y Ranking histórico. En la home, el link de la sección visible SHALL resaltarse a medida que el visitante hace scroll (las secciones sin link propio mantienen resaltado el link de la sección anterior), y el botón "Competencias" SHALL resaltarse al llegar a la sección Competencia. Fuera de la home, "Competencias" SHALL resaltarse en las páginas de torneos, ranking y equipos. La navegación MUST NOT incluir ningún link al panel de administración.

#### Scenario: Navegación inferior en mobile
- **WHEN** un visitante hace scroll en cualquier página pública en mobile
- **THEN** la barra inferior sigue visible, respeta el safe-area del dispositivo y marca la sección activa

#### Scenario: Resaltado según el scroll en desktop
- **WHEN** un visitante en desktop baja por la home desde el hero hasta la sección Cómo llegar
- **THEN** el header resalta, en orden, Inicio, El club, La cancha, Galería y Cómo llegar, y nunca hay más de un link resaltado a la vez

#### Scenario: Botón Competencias
- **WHEN** un visitante en desktop toca "Competencias" en el header
- **THEN** se despliega un menú con "Torneos" (a `/torneos`) y "Ranking histórico" (a `/ranking`)

#### Scenario: Sin rastros del admin
- **WHEN** se inspecciona la navegación, el footer, el sitemap o el robots.txt
- **THEN** no aparece ninguna referencia a la ruta del panel de administración

### Requirement: Secciones de la landing
La home SHALL incluir, en este orden: Hero (imagen o video de fondo, eslogan, CTA "Ver torneos" y CTA "Avisá que venís" por WhatsApp), ¿Qué es el footgolf?, El club, La cancha (18 hoyos, horarios, servicios), Galería, Cómo llegar (mapa y dirección), Preguntas frecuentes, Competencia (torneo destacado y ranking histórico) y Footer con contacto y redes. Las secciones de torneos y ranking MUST NOT aparecer entre el Hero y Preguntas frecuentes. La landing MUST NOT incluir las secciones "Modalidades de torneo" (vive en `/torneos`) ni "Eventos y grupos". La landing MUST NOT mostrar tarifas.

#### Scenario: Recorrido completo
- **WHEN** un visitante recorre la home de arriba hacia abajo
- **THEN** encuentra todas las secciones en el orden definido y sin ninguna mención de precios

#### Scenario: Competencia al final
- **WHEN** hay un torneo en curso y un ranking histórico con datos
- **THEN** el torneo y el ranking aparecen únicamente en la sección Competencia, ubicada después de Preguntas frecuentes y antes del footer

### Requirement: Contacto por WhatsApp
Todos los CTAs de contacto SHALL abrir WhatsApp (`https://wa.me/<número>`) con un mensaje ya escrito según el contexto: aviso de que vas a jugar, consulta general, consulta por los torneos en general o consulta por un torneo específico (incluyendo su nombre). El número MUST leerse de la configuración del sitio.

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

### Requirement: Sección Competencia
La sección "Competencia" SHALL agrupar en un solo bloque el torneo destacado y el top 5 del ranking histórico, con links a `/torneos` y `/ranking`. El torneo destacado SHALL ser el torneo "en curso"; si no hay ninguno, el próximo torneo; si no hay en curso ni próximos, el último campeón. Para un torneo en curso o próximo SHALL mostrar su nombre, su próxima fecha, el top 3 de su tabla (o los equipos inscriptos si todavía no hay resultados) y un link al detalle. El top del ranking histórico SHALL mostrarse solo si hay al menos 3 equipos con puntos o títulos. Si no hay torneo destacado ni ranking para mostrar, la sección entera MUST ocultarse, sin dejar título ni espacio vacío.

#### Scenario: Torneo en curso y ranking con datos
- **WHEN** existe un torneo "en curso" y al menos 3 equipos con puntos en el ranking histórico
- **THEN** la sección Competencia muestra el torneo (nombre, próxima fecha, top 3 y botón "Ver tabla y resultados") y el top 5 del ranking con un link "Ver ranking completo"

#### Scenario: Torneo sin ranking suficiente
- **WHEN** existe un torneo próximo pero menos de 3 equipos tienen puntos en el ranking histórico
- **THEN** la sección muestra solo el torneo, sin bloque de ranking

#### Scenario: Solo último campeón
- **WHEN** no hay torneos en curso ni próximos pero existe al menos un torneo finalizado
- **THEN** la sección muestra el último campeón con un link "Ver cómo terminó"

#### Scenario: Sin competencia
- **WHEN** no existe ningún torneo publicado
- **THEN** la sección Competencia no se renderiza y la home termina en Preguntas frecuentes seguida del footer

### Requirement: Indicador de torneo activo en el hero
Cuando hay un torneo en curso o próximo, el Hero SHALL mostrar un indicador compacto con su nombre ("En juego: …" o "Próximo: …") que enlace al detalle del torneo. Cuando no hay torneo en curso ni próximo, el indicador MUST NOT mostrarse.

#### Scenario: Torneo en curso
- **WHEN** existe un torneo "en curso" llamado "Apertura 2026"
- **THEN** el hero muestra "En juego: Apertura 2026" y al tocarlo se abre `/torneos/<slug>`

#### Scenario: Solo torneos finalizados
- **WHEN** todos los torneos publicados están finalizados
- **THEN** el hero no muestra el indicador

