# RAT-311 — Status Drift Loop (2026-05-11)

Issue: [RAT-311](/RAT/issues/RAT-311)

## Síntoma
RAT-311 reabre a `in_progress` repetidamente con wake `issue_status_changed` aun cuando:
- no hay comentarios pendientes (`0/0`),
- no hay nuevos entregables,
- el issue ya fue cerrado en `done` múltiples veces en heartbeats consecutivos.

## Impacto
- Consume capacidad operativa en heartbeats sin trabajo real.
- Genera ruido en métricas de productividad y lifecycle.
- Riesgo de ocultar incidentes reales por fatiga de alerta.

## Evidencia en thread
- Cierres repetidos a `done` por el mismo assignee en runs consecutivos.
- Comentarios de no-delta registrados para cortar loop de reapertura.

## Decisión operativa
- Mantener RAT-311 en `done` (entregables completos y aceptados).
- Escalar al CTO para corregir regla/scheduler que dispara reapertura automática sin delta.

## Unblock owner/action
- Owner: CTO / Control Plane
- Action:
  1. Auditar trigger de `issue_status_changed` para issues en estado terminal sin nuevos comentarios.
  2. Añadir guardrail: no pasar `done -> in_progress` si `pending comments=0` y no existe cambio material.
  3. Aplicar fix y validar con RAT-311 como caso de regresión.
