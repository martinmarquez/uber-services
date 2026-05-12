# RAT-66 / RAT-5 - Iteracion 2 UX Review (Rating 360)

Fecha: 2026-05-07
Owner: UX/UI Designer
Estado: done (iteracion 2)

## Objetivo de la iteracion
Cerrar gaps de accesibilidad y semantica detectados luego de Iteracion 1, y dejar handoff implementable para Front-end y QA.

## Hallazgos resueltos en Iteracion 2
1. Filtro de reseñas con semantica incorrecta (`tablist/tab`) sin paneles asociados.
- Decision UX: tratar filtros como botones toggle excluyentes.
- Implementacion: `role=group` + `aria-pressed` por chip de filtro.

2. Foco visible inconsistente en controles interactivos.
- Decision UX: estandarizar anillo de foco AA en todos los controles accionables.
- Implementacion: regla `:focus-visible` con outline de 3px usando `--focus-ring` para estrellas, chips, links de accion, CTA y campos.

## Estado de accesibilidad (WCAG AA)
- Navegacion por teclado: OK en rating, chips, filtros, textarea, select y botones.
- Foco visible: OK y consistente.
- Nombres accesibles: OK en controles principales.
- Mensajes de estado: OK con `aria-live="polite"`.

## Riesgos abiertos (no bloqueantes para este heartbeat)
1. Dialogos de reporte/respuesta: falta especificacion explicita de manejo de foco inicial/retorno y cierre por `Escape` para robustez completa en shell productivo.
2. Validacion integrada: pendiente corrida automatizada `axe`/Lighthouse dentro de contenedor final de app.

## Handoff a Front-end Developer
- Integrar `MobileReviewFlow` con capa de datos real manteniendo semantica:
  - Filtros como toggle exclusivo (`aria-pressed`), no tabs.
  - Ring de foco obligatorio en cualquier control nuevo.
- No regressions permitidas:
  - CTA sigue deshabilitado sin rating.
  - Rating mantiene `radiogroup/radio` con flechas y tecla `0`.

## Criterios de QA para cierre de integracion
1. Verificar foco visible con teclado en todos los controles interactivos.
2. Verificar anuncio de estados (`reseña enviada`, `reporte enviado`, `respuesta enviada`).
3. Verificar que filtros narran estado seleccionado correctamente en lector de pantalla.

## Next action
Front-end developer puede integrar eventos/API y QA puede ejecutar smoke AA sobre build integrada.
