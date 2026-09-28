## 1. Arreglo del layout

- [x] 1.1 En `components/landing/what-is.tsx`, cambiar la grilla a `grid grid-cols-1 items-center gap-12 lg:grid-cols-2`
- [x] 1.2 Agregar `min-w-0` al bloque de texto (`flex flex-col gap-8`) y al `Reveal` de la foto
- [x] 1.3 Revisar que el carrusel de pasos siga con scroll y snap, y que la tarjeta 4 tenga margen al final (`px-4` + `scroll-px-4` en el `<ol>`, así cada tarjeta frena alineada al margen de la página)

## 2. Verificación

- [x] 2.1 Correr `npm run lint`, `npx tsc --noEmit` y `npm run build`
- [x] 2.2 Revisión visual del usuario en celular (360–430 px): título, descripción, foto, carteles "N° 5" y "53 cm", y tarjeta 4 completos; desktop sin cambios
