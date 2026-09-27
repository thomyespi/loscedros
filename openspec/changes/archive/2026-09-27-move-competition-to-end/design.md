## Context

`app/(public)/page.tsx` arma hoy la home con este orden: Hero → Marquee → **Spotlight** → WhatIs → Club → Course → Modalities → **RankingTop** → Events → Gallery → Location → Faq. `Spotlight` y `RankingTop` ya se ocultan solos cuando no hay datos (`spotlight === null` / top vacío), pero cuando hay pocos datos se ven flacos, y aunque haya muchos cortan el relato de presentación del club. El Hero ya muestra un chip "En juego / Próximo" usando el mismo `getSpotlight`.

## Goals / Non-Goals

**Goals:**
- Que la competencia quede en un solo lugar, al final de la home.
- Que la sección tenga reglas claras de visibilidad y nunca muestre un bloque vacío o flaco.
- Reutilizar al máximo el markup existente de `Spotlight` y `RankingTop`.

**Non-Goals:**
- Cambiar `/torneos`, `/ranking` o la navegación.
- Cambiar el cálculo del ranking o la selección del torneo destacado (`getSpotlight`).
- Rediseñar visualmente las tarjetas del torneo o del ranking más allá de lo necesario para que convivan en una sección.

## Decisions

- **Una sección contenedora `Competition`** (`components/landing/competition.tsx`) con un único `SectionHeading` (eyebrow "Competencia", título tipo "Torneos y ranking") que renderiza dentro el bloque del torneo y el del ranking. `Spotlight` y `RankingTop` se refactorizan para no traer su propio `<section>`/container/heading (pasan a ser sub-bloques), y `Competition` decide qué mostrar. Alternativa descartada: dejar los dos componentes como secciones separadas, uno detrás del otro al final: repetiría headings y padding y se sentiría como dos secciones sueltas.
- **Layout:** en mobile, torneo arriba y ranking abajo. En desktop (`lg`), dos columnas (torneo | ranking) cuando están los dos, y una sola columna de ancho completo cuando hay solo uno.
- **Umbral del ranking = 3 equipos con puntos o títulos.** Con menos, el "top" no dice nada. La lógica vive en `Competition` (o en un helper chico en `selectors.ts`) para que sea testeable, no escondida en el JSX.
- **Ubicación: después de Faq, antes del footer.** Así se cumple "al final de todo" y el tramo de conversión (Cómo llegar, FAQ) queda cerrado antes. Alternativa considerada: antes de Cómo llegar. Se descartó para no meter la competencia en el medio del cierre.
- **Anchor:** la sección usa `id="competencia"`. Hoy no hay links internos a `#ranking` fuera del propio componente, así que el cambio es seguro.
- **Chip del hero:** sin cambios, ya cumple el nuevo requisito.
- **Stats de `Club`:** siguen igual; ya ocultan "equipos en el ranking" cuando es 0.

## Risks / Trade-offs

- [Menos visibilidad para los torneos entre visitantes nuevos] → El chip del hero sigue mostrando el torneo activo, y los tabs "Torneos"/"Ranking" están siempre en la nav.
- [La tarjeta `Spotlight` fue diseñada como bloque "flotante" pegado al hero (`mt-12`, `z-10`)] → Al pasarla a sub-bloque hay que quitar ese margen/z-index y ajustar el tamaño del título para que no compita con el heading de la sección.
- [Umbral fijo de 3] → Es una constante con nombre; se puede cambiar fácilmente si el club lo pide.
