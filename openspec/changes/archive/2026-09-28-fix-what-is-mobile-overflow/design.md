## Context

`components/landing/what-is.tsx` arma la sección con `grid items-center gap-12 lg:grid-cols-2`. En mobile hay una sola columna implícita (`auto`) con dos hijos: el bloque de texto (título + descripción + `<ol>` de pasos) y la foto con sus dos carteles flotantes.

El `<ol>` es un carrusel: `flex overflow-x-auto` con tarjetas `w-[78%] shrink-0`. Los ítems de una grilla tienen `min-width: auto`, así que la columna toma como mínimo el ancho "min-content" del bloque de texto, que incluye la fila completa de tarjetas que no se encogen. Resultado: la columna (y con ella el título, la descripción y la foto) es más ancha que el viewport. El layout público tiene `overflow-x-clip` (`app/(public)/layout.tsx`), que evita el scroll horizontal pero corta todo lo que sobra por la derecha: el título, la descripción, el cartel "N° 5" (anclado a la izquierda de una foto que ahora arranca bien pero es más ancha) y el final del carrusel.

La galería usa el mismo patrón de carrusel pero no está dentro de una grilla, por eso no tiene el problema.

## Goals / Non-Goals

**Goals:**
- Que la sección entre en 360–430 px sin recortes, con el carrusel funcionando igual.

**Non-Goals:**
- Cambiar el diseño, los textos o el comportamiento en tablet/desktop.
- Tocar otras secciones.

## Decisions

### 1. Columnas con `minmax(0, 1fr)` y `min-w-0` en los hijos

Se cambia la grilla a `grid-cols-1` en mobile (que en Tailwind v4 es `repeat(1, minmax(0, 1fr))`) y se agrega `min-w-0` a los dos hijos directos. Así la columna mide el ancho del contenedor, no el de su contenido, y el `<ol>` hace scroll dentro de ese ancho como corresponde. `lg:grid-cols-2` ya usa `minmax(0, 1fr)`, así que desktop no cambia.

- *Alternativa*: `overflow-hidden` en la sección. Ocultaría el desborde, pero el contenido seguiría siendo más ancho que la pantalla (el mismo recorte que hoy). Descartada.
- *Alternativa*: sacar el carrusel de la grilla. Más cambios de estructura sin beneficio.

### 2. Los carteles flotantes quedan dentro de la pantalla

Los carteles usan `-left-2` / `-right-2` en mobile, que los saca 8 px de la foto. Con la foto a lo ancho del contenedor (16 px de margen), siguen dentro de la pantalla, así que no hace falta moverlos. Se verifica en 360 px que no queden recortados.

## Risks / Trade-offs

- [Algún otro hijo de la grilla dependía del ancho extra] → no hay: el resto del contenido es texto e imagen `fill`, que se adaptan al ancho.
