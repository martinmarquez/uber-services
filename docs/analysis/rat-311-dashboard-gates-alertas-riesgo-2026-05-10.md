# RAT-311 — Dashboard de gates + alertas de riesgo (2026-05-10)

Issue: [RAT-311](/RAT/issues/RAT-311)  
Parent: [RAT-22C](/RAT/issues/RAT-22C)

## Comentario del board atendido
Se ejecuta la acción pedida en el comentario `d4ec48c6-a2d4-414c-9636-6357bc0b6522`: implementación inicial de dashboard + umbrales + runbook con evidencia en artefactos versionados.

## Entregable 1: Dashboard operativo CEO/CTO

Archivo SQL:
- `analysis/sql/rat-311-rollout-gates-risk-dashboard.sql`

Qué entrega el dataset:
- KPIs con media móvil de 7 días por variante `control` y `treatment`.
- Comparativa `control vs treatment` con delta absoluto y relativo para:
  - `conversion_rate_7d`
  - `churn_top_decil_rate_7d`
  - `claims_rate_7d`
  - `refunds_per_exposed_usd_7d`
- Conteos de contexto para lectura ejecutiva:
  - `exposed_users_7d`, `claims_count_7d`, `refunds_usd_7d`
- Estado de gates por métrica (`pass|warning|breach`) y nivel de escalación consolidado:
  - `none` (sin riesgo)
  - `cto` (warning)
  - `board` (breach)

## Entregable 2: Alertas automáticas con umbrales RAT-22

Umbrales implementados en el SQL:

- Gate de conversión:
  - `breach` si delta relativo <= `-10%`
  - `warning` si delta relativo <= `-5%`
- Gate de churn top decil:
  - `breach` si delta relativo >= `+20%`
  - `warning` si delta relativo >= `+10%`
- Gate de claims:
  - `breach` si delta relativo >= `+20%`
  - `warning` si delta relativo >= `+10%`
- Gate de refunds por expuesto:
  - `breach` si delta relativo >= `+20%`
  - `warning` si delta relativo >= `+10%`

Regla de escalación:
- Si cualquier gate está en `breach` => `escalation_level = board`.
- Si no hay `breach` pero hay al menos un `warning` => `escalation_level = cto`.
- Caso contrario => `escalation_level = none`.

## Entregable 3: Runbook inicial de respuesta

### Frecuencia operativa
- Corte diario 09:00 (timezone operativa definida por negocio).
- Ventana de análisis: últimos 7 días móviles (ya embebido en SQL).

### Protocolo por nivel
1. `none`
- Continuar rollout por fase según plan.
- Registrar snapshot diario en bitácora del issue.

2. `cto`
- Abrir investigación de causa raíz el mismo día.
- Congelar expansión de tráfico hasta cerrar diagnóstico.
- Actualizar al CTO con evidencia de métrica, cohorte y recomendación en < 4h.

3. `board`
- Congelar rollout incremental inmediato.
- Escalar al board con evidencia cuantitativa y plan de mitigación en < 2h.
- Definir decisión binaria: rollback parcial/total o continuidad condicionada.

### Checklist mínimo de evidencia al alertar
- Fecha de corte y versión del query.
- Delta relativo de cada KPI impactado (`control` vs `treatment`).
- Muestra 7d (`exposed_users_7d`) por variante.
- Decisión operativa tomada y owner asignado.

## Goal Gate (OKR)
Alineación con `PRODUCT_BRIEF.md` validada:
- Protege crecimiento (conversión) con guardrails de riesgo (churn/claims/refunds).
- Define mecanismo explícito de gobernanza ejecutiva para fases de rollout.

## Estado de criterios de aceptación
1. Dashboard operativo consumible por CEO/CTO: `DONE` (dataset SQL versionado).
2. Alertas configuradas con umbrales de review RAT-22: `DONE` (gates y escalación en SQL).
3. Runbook de respuesta inicial ante alertas: `DONE` (sección operativa en este documento).

## Siguiente acción propuesta
- Conectar el SQL a la fuente productiva (`analytics_events`) y publicar primera corrida diaria con snapshot `D0` para iniciar histórico de alertas.
