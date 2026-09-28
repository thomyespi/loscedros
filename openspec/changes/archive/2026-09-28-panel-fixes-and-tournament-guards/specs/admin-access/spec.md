## MODIFIED Requirements

### Requirement: Panel usable en mobile
El panel SHALL ser completamente operable desde un celular (la carga de resultados se hace en la cancha), con navegación inferior o menú compacto, formularios de una columna y controles táctiles grandes. Los formularios que se abren sobre una pantalla (nuevo/editar equipo, editar datos del torneo) SHALL mostrarse en un diálogo centrado vertical y horizontalmente, en mobile y en desktop, con scroll interno cuando el contenido no entra en la pantalla.

El panel SHALL responder de inmediato a cada toque: al tocar un link de navegación SHALL aparecer un indicador de carga o un esqueleto de la pantalla siguiente, y al tocar un botón que guarda o cambia datos, ese botón SHALL deshabilitarse y mostrar un indicador de progreso hasta que la pantalla refleje el resultado.

#### Scenario: Carga desde el celular
- **WHEN** el admin abre el panel en un viewport de 375px
- **THEN** puede navegar a cualquier sección y completar cualquier formulario sin hacer zoom ni scroll horizontal

#### Scenario: Nuevo equipo en el centro
- **WHEN** el admin toca "Nuevo equipo" en mobile o en desktop
- **THEN** el formulario se abre en un diálogo centrado en la pantalla, no pegado al borde inferior

#### Scenario: Formulario más alto que la pantalla
- **WHEN** el formulario de equipo con el recorte de avatar no entra en la altura de la pantalla
- **THEN** el diálogo sigue centrado y su contenido hace scroll dentro del diálogo

#### Scenario: Navegación con respuesta inmediata
- **WHEN** el admin toca "Torneos" en la navegación del panel
- **THEN** ve al instante una señal de carga, sin esperar a que el servidor responda

#### Scenario: Doble toque en guardar
- **WHEN** el admin toca "Guardar" y vuelve a tocarlo antes de que termine
- **THEN** el segundo toque no hace nada porque el botón ya está deshabilitado con un spinner
