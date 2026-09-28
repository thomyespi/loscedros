# admin-access Specification

## Purpose
TBD - created by archiving change add-los-cedros-site. Update Purpose after archive.
## Requirements
### Requirement: Ruta oculta del panel
El panel de administración SHALL vivir bajo la ruta `/vestuario`, con el login en `/vestuario/ingresar`. Estas rutas MUST NOT estar enlazadas desde ninguna página pública, MUST NOT figurar en el sitemap ni en el robots.txt y MUST responder con `X-Robots-Tag: noindex, nofollow`.

#### Scenario: Visitante sin sesión
- **WHEN** alguien sin sesión abre `/vestuario` o cualquier subruta
- **THEN** es redirigido a `/vestuario/ingresar`

#### Scenario: No indexable
- **WHEN** un buscador pide cualquier ruta bajo `/vestuario`
- **THEN** la respuesta incluye el header `X-Robots-Tag: noindex, nofollow`

### Requirement: Login de único administrador
El sistema SHALL autenticar al admin con email y contraseña mediante Supabase Auth. El registro público MUST estar deshabilitado y no MUST existir ninguna pantalla de registro. Solo los usuarios presentes en la tabla `admins` SHALL tener acceso al panel.

#### Scenario: Login correcto
- **WHEN** el admin ingresa un email y una contraseña válidos en `/vestuario/ingresar`
- **THEN** se crea la sesión y se lo redirige al dashboard `/vestuario`

#### Scenario: Credenciales inválidas
- **WHEN** alguien ingresa credenciales incorrectas
- **THEN** se muestra un mensaje genérico "Email o contraseña incorrectos" sin indicar cuál de los dos falló

#### Scenario: Usuario autenticado que no es admin
- **WHEN** un usuario autenticado cuyo id no está en `admins` intenta entrar al panel
- **THEN** se cierra su sesión y vuelve a la pantalla de login

### Requirement: Cierre de sesión
El panel SHALL ofrecer un botón "Salir" que cierra la sesión y redirige a la home pública.

#### Scenario: Salir
- **WHEN** el admin toca "Salir"
- **THEN** la sesión se invalida y queda en la home pública

### Requirement: Políticas de acceso a datos
Todas las tablas SHALL tener Row Level Security activado. Los visitantes anónimos MUST poder leer únicamente los datos públicos (equipos, torneos que no estén en borrador y sus datos relacionados, fotos y configuración del sitio). Las escrituras MUST estar permitidas solo si `is_admin()` es verdadero. Lo mismo SHALL aplicar a los buckets de Storage.

#### Scenario: Escritura anónima bloqueada
- **WHEN** un cliente anónimo intenta insertar, actualizar o borrar cualquier fila usando la anon key
- **THEN** la base de datos rechaza la operación

#### Scenario: Torneo en borrador oculto
- **WHEN** un cliente anónimo consulta los torneos
- **THEN** no recibe los torneos en estado "borrador" ni sus fechas, cruces o resultados

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

