## Why

En celular, la sección "¿Qué es el footgolf?" se ve cortada: el título y el texto de abajo se salen de la pantalla por la derecha, el cartel "N° 5 pelota de fútbol" de la foto no se ve y la tarjeta 4 del carrusel de pasos también queda recortada al final. El resto de la landing en mobile está bien.

La causa es que el carrusel de pasos (una fila con scroll horizontal) está dentro de una grilla. Una columna de grilla, por defecto, se estira hasta el ancho de su contenido más largo, así que se ensancha tanto como la fila entera de tarjetas. Toda la sección queda más ancha que la pantalla, y el layout público recorta lo que sobra (`overflow-x-clip`), por eso no aparece scroll horizontal: el contenido simplemente se corta.

## What Changes

- La sección "¿Qué es el footgolf?" queda del ancho de la pantalla en mobile: el título, la descripción, el carrusel de pasos y la foto con sus carteles ("N° 5 pelota de fútbol" y "53 cm") se ven completos, dentro de los márgenes de la página.
- El carrusel de pasos sigue deslizándose con el dedo, y la tarjeta 4 se puede ver entera al llegar al final.
- Desktop y tablet no cambian.

## Capabilities

### New Capabilities
<!-- Ninguna -->

### Modified Capabilities
- `landing-page`: el requisito "Diseño mobile-first" suma que ningún contenido puede quedar recortado por los bordes de la pantalla (además de no generar scroll horizontal), con un escenario para esta sección.

## Impact

- **Código**: `components/landing/what-is.tsx` (solo clases de layout).
- **Sin cambios** en datos, panel, textos ni otras secciones.
