# RAT-40.2 / RAT-82: Readout dia 7 KPI confusion/dropoff

Fecha de preparacion: 2026-05-07 (ART)  
Readout comprometido: 2026-05-11 17:00 (ART)  
Issue: `RAT-82`  
Dependencias: `RAT-40`, `RAT-37`, `RAT-39`, CEO review `RAT-80`

## Objetivo

Publicar el readout dia 7 exigido por CEO para cierre de `RAT-40`, con deltas de:

1. `support_tickets_review_status_confusion`
2. `review_flow_dropoff_after_star_select`

## KPI y guardrails

1. `support_tickets_review_status_confusion`
- Formula: `tickets_tag_review_status_confusion / total_review_tickets`
- Guardrail: `<= 15%` al cierre de semana 2

2. `review_flow_dropoff_after_star_select`
- Formula: `1 - (users_submitted_after_star / users_star_selected)`
- Guardrail: tendencia descendente en semana 1

Referencias: `docs/rat-37-dashboard-cs-friccion-churn.md`, `analysis/sql/rat-39-cs-dashboard-metrics.sql`, `analysis/sql/rat-82-day7-kpi-delta-readout.sql`.

## Ventana de comparacion

- Baseline: 7 dias previos al rollout de `RAT-40.2`
- Evaluacion: dia 1-7 post rollout
- Timezone de reporte: `America/Argentina/Buenos_Aires`

## Tabla de resultados (pendiente de dato fuente)

| KPI | Baseline 7d | Dia 7 (o promedio d1-d7) | Delta abs (pp) | Delta rel | Estado vs guardrail |
|---|---:|---:|---:|---:|---|
| support_tickets_review_status_confusion | TBC | TBC | TBC | TBC | TBC |
| review_flow_dropoff_after_star_select | TBC | TBC | TBC | TBC | TBC |

## Decision recomendada (estado actual)

`ADJUST` (operativo, no de producto): mantener mitigaciones RAT-40 y priorizar cierre de gap de observabilidad antes del checkpoint dia 7.

Motivo:
- El framework de decision y guardrails esta definido.
- Falta evidencia numerica final (baseline/dia7/delta) para tomar `GO/CLOSE` o `ESCALATE` con rigor.

## Blocker explicito

1. Blocker: snapshot numerico de las 2 KPI no disponible en repositorio ni en issue context al 2026-05-07.
- Owner de desbloqueo: CTO + Data/Analytics Engineering
- Accion requerida: ejecutar SQL de `analysis/sql/rat-39-cs-dashboard-metrics.sql` en warehouse productivo y publicar salida (baseline, dia7, delta abs/rel) en `RAT-82`
- ETA requerida: 2026-05-11 16:00 ART (1h antes del readout pactado)

## Query pack a ejecutar

- Bloque 2 (`review_flow_dropoff_after_star_select`)
- Bloque 3 (`support_tickets_review_status_confusion`)
- Query consolidada lista para corrida con parametros de fecha:
  - `analysis/sql/rat-82-day7-kpi-delta-readout.sql`

Archivo fuente: `analysis/sql/rat-39-cs-dashboard-metrics.sql`.

## Formato de cierre para comentario en issue

```md
RAT-82 day-7 KPI readout

- support_tickets_review_status_confusion: baseline X%, dia7 Y%, delta Z pp (W% rel)
- review_flow_dropoff_after_star_select: baseline X%, dia7 Y%, delta Z pp (W% rel)
- Decision: GO/CLOSE | ADJUST | ESCALATE
- Riesgo churn/revenue: none | low | medium | high
- Next action owner + fecha:
```
