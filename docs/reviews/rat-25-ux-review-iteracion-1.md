# RAT-25 / RAT-5 - Iteracion 1 UX Review (Rating 360)

Fecha: 2026-05-06
Owner: UX/UI Designer
Estado: done (iteracion 1)

## Alcance revisado
- Flujo de calificacion post-viaje en mobile (`MobileReviewFlow`).
- Coherencia entre spec de interaccion, sistema de diseno y baseline de accesibilidad WCAG AA.
- Alineacion con decisiones MVP definidas en investigacion RAT-4.

## Hallazgos de UX
1. Semantica de estrellas no era de radio real: se usaba `aria-pressed` en vez de `role=radio` + `aria-checked`, generando ambiguedad para lectores de pantalla.
2. Faltaba soporte explicito de teclado para ajuste rapido del rating dentro del grupo de estrellas (flechas).
3. Campo de comentario no mostraba feedback de longitud, aumentando riesgo de error al limite de 240 caracteres.
4. Handoff necesitaba estado explicito de componente para FE y QA (que validar y que depende de backend/policy).

## Cambios aplicados en iteracion 1
- Componente React actualizado:
  - Estrellas con `role="radio"`, `aria-checked` y manejo de `tabIndex` roving.
  - Navegacion por teclado con flechas para incrementar/disminuir rating.
  - Instruccion accesible de uso de teclado (`aria-describedby`).
  - Contador de caracteres en vivo para comentario (`aria-live="polite"`).
- Estilos actualizados:
  - Estados de interaccion con cursor consistente para botones/chips/CTA.
  - Estilo para nota de campo y contador de caracteres.
- Documentacion sincronizada:
  - Checklist de accesibilidad ampliado con semantica radio y soporte de teclado.
  - Memoria de diseno actualizada con estado de handoff y riesgos pendientes.

## Especificacion de interaccion para handoff FE
- Stars:
  - Click: selecciona 1..5.
  - Click sobre estrella seleccionada: limpia rating (0).
  - Teclado: flechas ajustan rating; `0` limpia.
- Tags:
  - Multi-select con `aria-pressed`.
  - Se limpian al cambiar rating entre buckets de sentimiento.
- Comentario:
  - Opcional, max 240.
  - Contador visible y anunciado.
- Submit:
  - Habilitado solo con rating > 0.
  - Estado loading + confirmacion `aria-live`.

## WCAG AA - estado actual
- Cumple base AA para flujo local del componente (labels, keyboard operability, focus visible, status messages).
- Pendiente validacion integrada con `axe`/Lighthouse dentro de shell real de app.

## Riesgos/pendientes para Iteracion 2
1. Definir microcopy legal/compliance final para casos de baja calificacion y politica anti-manipulacion.
2. Confirmar con backend contrato para persistencia de tags por bucket (evitar drift semantico).
3. Definir comportamiento de cierre del sheet post-submit en runtime productivo.

## Next action
Front-end developer puede integrar `MobileReviewFlow` con capa de datos y eventos de tracking; QA puede ejecutar validacion AA integrada.
