# CHURN_TRACKING.md

## Objetivo

Detectar riesgo de churn asociado a friccion de reseñas/moderacion y escalar rapido.

## Criterios de cuenta en riesgo (RAT-37)

- Cuenta estrategica con incidente de reseña/moderacion abierto.
- 2+ tickets por confusion de estado en <= 7 dias.
- Apelacion reabierta luego de cierre por disconformidad.
- Comentario explicito de baja de confianza o amenaza de abandono.
- Reporte de represalia por reseña negativa legitima.

## Protocolo de escalacion

- Flag inmediato: `exec-watch`.
- SLA de escalacion al CEO: < 4 horas desde deteccion.
- Owner primario: Customer Success.
- Co-owners segun caso: Product Manager, Trust & Safety.

## Plantilla minima de incidente

- Cuenta:
- Fecha/hora deteccion:
- Trigger de riesgo:
- Estado actual:
- Accion de contencion aplicada:
- Escalado a CEO (si/no + timestamp):
- Proximo checkpoint:

## Seguimiento operativo RAT-40 (dia 2 -> dia 7)

- Verificar diariamente tickets con tag `review-status-confusion`.
- Corroborar aplicacion de macro unificada en primer contacto.
- Auditar que todo caso `exec-watch` tenga timestamp de escalacion CEO < 4h.
- Auditar que todo reporte anti-represalia tenga triage prioritario en primer contacto.

## Log de riesgo operativo

### 2026-05-07 - Dependencia de moderacion sin cierre operativo
- Contexto: `RAT-75` detecto baja productividad en `RAT-31` (review de riesgo/abuso de playbook de moderacion) por duracion activa prolongada sin evidencia de entregable.
- Riesgo de churn: demoras en hardening de moderacion aumentan probabilidad de escalaciones por confianza/abuso no contenidas.
- Accion CS: escalar al owner ejecutivo para exigir update con evidencia de entrega (artifact path + decision) o bloqueo explicito con owner/ETA.

### 2026-05-11 - Cierre de riesgo operativo RAT-31
- Evidencia de cierre: `RAT-31` paso a `done` con entregables publicados en `moderation/MODERATION_SOP.md`, `moderation/APPEALS_WORKFLOW.md` y `moderation/RAT-31_SECURITY_REVIEW.md`.
- Impacto en churn: baja riesgo inmediato de escalaciones por vacios de playbook en SEV-0/1.
- Seguimiento: mantener monitoreo de tickets `exec-watch` y SLA de apelaciones para validar ejecucion operativa real.

### 2026-05-07 - Cierre de gate de moderacion operativa (RAT-11)
- Contexto: completados reviews `RAT-31`, `RAT-32`, `RAT-33`; playbook operativo consolidado y listo para ejecucion.
- Riesgo de churn mitigado: menor ambiguedad en decisiones, SLAs definidos por severidad y ruta `exec-watch` formalizada.
- Accion CS: monitorear 7 dias `% casos exec-watch escalados al CEO <4h` y `% apelaciones con evidencia completa en primer envio`.

### 2026-05-10 - RAT-136 ejecucion MVP (cola de moderacion + apelaciones)
- Contexto: issue desbloqueado con scope explicito para artefactos CS y alineacion operativa.
- Riesgo de churn principal: demoras de SLA o falta de trazabilidad de estado en apelaciones de cuentas sensibles.
- Accion CS inmediata:
  - Auditoria diaria de `appeal_followup_open > 48h` sin update al cliente.
  - Escalar al CEO en <4h todo caso con `exec-watch` + SLA en riesgo.
  - Reportar a producto patrones repetidos de confusion por estado (`en_revision` vs `no_recomendada`).

## Señales tempranas de riesgo (RAT-136)

- `appeal_ack_over_24h` (acuse de recibo tardio).
- `appeal_resolution_over_7d_standard` (sin etiqueta de caso complejo).
- `2+` contactos del mismo usuario por falta de claridad de estado en 72h.
- Reapertura de apelacion por "decision no explicada".

## Campos de tracking SLA (obligatorios por caso)

- `case_id`
- `review_id`
- `appeal_id`
- `customer_tier` (`estrategica`/`estandar`)
- `opened_at`
- `ack_sent_at`
- `last_customer_update_at`
- `target_resolution_at`
- `resolved_at`
- `sla_breach` (`si`/`no`)
- `breach_reason`
- `exec_watch` (`si`/`no`)
- `escalated_to_ceo_at` (si aplica)
