## Why

La home está pensada para alguien que todavía no conoce el club (qué es el footgolf → el club → la cancha → cómo venir), pero hoy el bloque "Torneo en vivo" aparece apenas debajo del hero y el "Ranking histórico" queda en el medio, entre Modalidades y Eventos. Eso corta el relato de presentación y, cuando hay pocos datos (un solo torneo, un ranking con dos o tres equipos, o solo un campeón viejo), deja bloques flacos justo en el medio de la página. El público que busca la competencia ya tiene acceso directo desde los tabs "Torneos" y "Ranking" de la navegación.

## What Changes

- Sacar el bloque "Torneo en vivo" (Spotlight) y el "Ranking histórico" (top 5) del flujo central de la landing.
- Unificarlos en una sola sección **"Competencia"** ubicada al final de la home, después de Preguntas frecuentes y antes del footer.
- La sección muestra, según los datos disponibles: el torneo destacado (en curso → próximo → último campeón) y/o el top del ranking histórico, con links a `/torneos` y `/ranking`.
- La sección entera se oculta si no hay contenido que valga la pena mostrar: ni torneo destacado ni al menos 3 equipos con puntos en el ranking histórico. Si hay torneo pero el ranking tiene menos de 3 equipos con puntos, se muestra solo el torneo.
- En el header de desktop, los links de la landing siguen el orden de scroll y se resaltan según la sección visible; Torneos y Ranking pasan a un botón aparte "Competencias" con menú desplegable.
- "Modalidades de torneo" sale de la landing y pasa a `/torneos`.
- Se elimina la sección "Eventos y grupos" y su mensaje de WhatsApp.
- Se mantiene el chip del hero ("En juego: …" / "Próximo: …"), que solo aparece con un torneo en curso o próximo y no ocupa lugar en el flujo.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `landing-page`: cambia el orden de secciones de la home (Torneo en vivo y Ranking histórico se reemplazan por una sección "Competencia" al final) y el requisito del bloque de torneo en vivo pasa a describir la nueva sección unificada con sus reglas de visibilidad. También cambian la navegación del header (scroll-spy + botón "Competencias"), se quitan Modalidades y Eventos de la home y el contexto de WhatsApp de eventos.
- `public-tournaments`: `/torneos` suma la sección "Modalidades de torneo".

## Impact

- `app/(public)/page.tsx`: nuevo orden de secciones.
- `components/landing/spotlight.tsx` y `components/landing/ranking-top.tsx`: se reutilizan dentro de un nuevo `components/landing/competition.tsx` (o se adaptan como sub-bloques).
- Anchor `#ranking` en la home: pasa a apuntar a la nueva sección (o se renombra a `#competencia`); revisar que nada enlace al id viejo.
- `app/(public)/torneos/page.tsx` + `components/tournament/modalities.tsx`: Modalidades pasa a `/torneos`. Se borran `components/landing/events.tsx`, el contenido `events` y el contexto de WhatsApp `eventos`.
- `components/layout/*`: header con scroll-spy y menú "Competencias".
- Sin cambios de datos, API ni dependencias.
