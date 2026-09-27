## 1. Sub-bloques reutilizables

- [x] 1.1 Refactorizar `components/landing/spotlight.tsx` en un bloque sin `<section>`/container propio (sin `mt-12`/`z-10`), manteniendo la lógica live/upcoming/champion y el link al detalle
- [x] 1.2 Refactorizar `components/landing/ranking-top.tsx` en un bloque sin `<section>`/`SectionHeading` propio, manteniendo el top 5 y el link "Ver ranking completo"
- [x] 1.3 Exponer la regla de visibilidad del ranking (≥ 3 equipos con puntos o títulos) como una constante o helper con nombre

## 2. Sección Competencia

- [x] 2.1 Crear `components/landing/competition.tsx` con `id="competencia"`, `SectionHeading` único y los dos sub-bloques
- [x] 2.2 Implementar la visibilidad: torneo solo si hay spotlight, ranking solo si pasa el umbral, y retornar `null` si no hay ninguno de los dos
- [x] 2.3 Layout responsive: apilado en mobile y dos columnas en `lg` cuando están los dos bloques (ancho completo si hay uno solo)

## 3. Home

- [x] 3.1 En `app/(public)/page.tsx`, quitar `Spotlight` y `RankingTop` del flujo y agregar `Competition` después de `Faq`
- [x] 3.2 Verificar que no queden referencias a `#ranking` ni a `spotlight-title` en la home
- [x] 3.3 Confirmar que el chip del hero sigue funcionando sin cambios

## 4. Verificación

- [x] 4.1 `tsc`/lint y build sin errores
- [x] 4.2 Revisar los casos con datos: sin torneos (sección oculta), solo campeón, torneo próximo sin ranking suficiente, torneo en curso + ranking completo

## 5. Navegación del header

- [x] 5.1 Reordenar los links de la landing en `nav-links.ts` según el orden de scroll (Inicio, El club, La cancha, Galería, Cómo llegar, Preguntas) y quitar Torneos/Ranking de ese grupo
- [x] 5.2 Scroll-spy en la home: resaltar el link de la sección visible (incluida Competencia en el botón) y sin resaltado de hash fuera de la home
- [x] 5.3 Botón "Competencias" separado en el header con menú desplegable (Torneos, Ranking histórico), resaltado en `/torneos`, `/ranking` y `/equipos`
- [x] 5.4 Ajustar el header para que entre en `lg` (CTA de WhatsApp solo con ícono hasta `xl`)

## 6. Modalidades y Eventos

- [x] 6.1 Mover `Modalities` de la landing a `/torneos` (`components/tournament/modalities.tsx`), debajo del listado
- [x] 6.2 Eliminar la sección "Eventos y grupos" (componente, contenido y contexto de WhatsApp `eventos`)
- [x] 6.3 Quitar la pregunta "¿Organizan eventos privados?" de Preguntas frecuentes
