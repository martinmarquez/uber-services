# RAT-64 External Confirmation Packet (Backend + PM/UX + Data/PM)

Fecha: 2026-05-10
Issue: RAT-64
Objetivo: cerrar confirmaciones externas pedidas por board para resolver RAT-64 y relacionados.

## 1) Backend - Confirmacion de contrato/SLA en fallos de lectura
Owner requerido: Backend Lead

Contexto FE ya aplicado:
- Frontend elimino fallback silencioso a mocks en fallos de lectura.
- En error de lectura, FE muestra estado de error y CTA de reintento.

Se solicita confirmar (SI/NO por punto):
1. `GET /api/v1/providers/discovery` devuelve codigos de error estables y no cambia shape entre errores recuperables/no recuperables.
2. `GET /api/v1/reviews` mantiene contrato de respuesta estable y permite diferenciar `empty` vs `error`.
3. SLA de disponibilidad para lecturas en horario operativo (target y ventana de medicion).
4. Politica de retry recomendada para cliente web (cantidad/intento-backoff).

Propuesta de respuesta minima valida de Backend:
- Contract status: `confirmed` | `needs_change`
- SLA read target: `<valor>`
- Retry policy FE: `<valor>`
- Effective date: `YYYY-MM-DD`

## 2) PM/UX - Confirmacion de politica final post-submit + copy
Owner requerido: PM + UX Writer

Contexto FE actual:
- Confirmacion post-submit visible y autocierre a 4.5s.
- Mensajes de error y exito ya instrumentados en `aria-live`.

Se solicita confirmar (SI/NO por punto):
1. Politica final post-submit: autocierre 4.5s (o nuevo valor exacto).
2. Comportamiento posterior: permanecer en vista actual / redireccionar / cerrar sheet.
3. Copy final de exito y error (texto exacto aprobado).
4. Si aplica experimento A/B de copy, indicar variante control/tratamiento y ventana de rollout.

Propuesta de respuesta minima valida de PM/UX:
- Post-submit policy: `<definicion final>`
- Approved copy: `<texto exito>` / `<texto error>`
- Rollout mode: `single-copy` | `ab-test`
- Effective date: `YYYY-MM-DD`

## 3) Data/PM - Ratificacion de taxonomia de eventos FE
Owner requerido: Data Analyst + PM

Eventos emitidos por FE:
- `review_star_selected`
- `review_tag_toggled`
- `review_comment_started`
- `review_report_submitted`
- `review_respond_submitted`

Se solicita confirmar (SI/NO por punto):
1. Naming final de eventos (sin renombres pendientes).
2. Campos minimos requeridos por evento para dashboarding y QA estadistico.
3. Politica de cardinalidad (tags, reason_code, message_length).
4. Regla de versionado para cambios futuros de esquema.

Propuesta de respuesta minima valida de Data/PM:
- Taxonomy status: `ratified` | `needs_change`
- Required fields: `<lista>`
- Version: `v1` (o nueva)
- Effective date: `YYYY-MM-DD`

## Criterio de cierre de RAT-64
RAT-64 puede cerrarse cuando:
1. Backend confirme contrato/SLA de lecturas con politica de retry.
2. PM/UX confirme politica post-submit y copy final.
3. Data/PM ratifique taxonomia emitida (o liste ajustes exactos).

## Estado recomendado hasta respuestas
- `blocked`
- Unblock owners/actions:
1. Backend Lead -> emitir confirmacion contrato/SLA de lecturas.
2. PM/UX -> emitir definicion final post-submit + copy.
3. Data/PM -> ratificar taxonomia de eventos FE.
