# RAT-82: Readout dia 7 KPI confusion/dropoff (RAT-40.2)

Fecha de corte esperada: 2026-05-11 (ART)
Owner: Data Analyst (RAT-82)
Dependencias: RAT-40, RAT-37, RAT-39

## Objetivo de este readout

Cerrar el gate de evidencia pedido en `RAT-80` para `RAT-40`, reportando deltas dia 7 de:

1. `support_tickets_review_status_confusion`
2. `review_flow_dropoff_after_star_select`

Decision gate:

- `GO/CLOSE`: confusion <= 15% o tendencia clara descendente y dropoff estable/mejorando vs baseline.
- `ADJUST`: mejora parcial sin breach severo.
- `ESCALATE`: confusion > 20% o deterioro sostenido de dropoff (2 cortes diarios).

## Definiciones metricas (fuente unica)

1. `support_tickets_review_status_confusion`
- Formula: `tickets_tag_review_status_confusion / total_review_tickets`.
- Guardrail: <= 15% al cierre de semana 2.

2. `review_flow_dropoff_after_star_select`
- Formula: `1 - (users_submitted_after_star / users_star_selected)`.
- Guardrail: tendencia descendente semana 1.

Referencias: `docs/rat-37-dashboard-cs-friccion-churn.md`, `analysis/sql/rat-39-cs-dashboard-metrics.sql`.

## Ventanas de comparacion

- Baseline: 7 dias previos a rollout RAT-40.2.
- Ventana de evaluacion: dia 1-7 post rollout.
- Zona horaria de reporte: `America/Argentina/Buenos_Aires`.

## Query operacional (resumen)

Usar SQL base en `analysis/sql/rat-39-cs-dashboard-metrics.sql`:

- Bloque 2 para `review_flow_dropoff_after_star_select`.
- Bloque 3 para `support_tickets_review_status_confusion`.

## Tabla de readout (completar con datos)

| KPI | Baseline 7d | Dia 7 (o promedio d1-d7) | Delta abs (pp) | Delta rel | Estado vs guardrail |
|---|---:|---:|---:|---:|---|
| support_tickets_review_status_confusion | TBC | TBC | TBC | TBC | TBC |
| review_flow_dropoff_after_star_select | TBC | TBC | TBC | TBC | TBC |

## Segmentacion minima obligatoria

1. `user_type`: cliente vs prestador
2. `cohort_segment`: nuevos vs recurrentes
3. `platform`: app vs web

## Semaforo de riesgo (CEO/Board)

- Verde: ambas metricas en mejora/estables y sin breach de guardrails.
- Amarillo: 1 metrica sin mejora concluyente, sin breach rojo.
- Rojo: confusion > 20% o dropoff con deterioro sostenido.

Si rojo y riesgo de impacto en retencion/MRR: escalar a Board con plan de mitigacion en < 2h.

## Bloqueadores actuales para cierre numerico

1. No hay snapshot de metricas dia 7 adjunto en repositorio para estas 2 KPI.
- Owner de desbloqueo: Data/Analytics Engineering.
- Accion requerida: ejecutar SQL de RAT-39 en warehouse y publicar tabla final (baseline, dia7, delta) en comentario de RAT-82.
- ETA objetivo: 2026-05-11 16:00 ART (previo al readout 17:00 ART).

## Ejecucion CTO (2026-05-07 ART)

Estado: `BLOCKED` para extraccion numerica local.

- Accion realizada: validacion de query pack (`analysis/sql/rat-39-cs-dashboard-metrics.sql`, bloques 2 y 3) y preparacion de query consolidada de deltas dia 7.
- Resultado: no hay credenciales de warehouse ni snapshot local de tablas `events`/`support_tickets` para correr el extract en este workspace.
- Unblock owner: Data/Analytics Engineering.
- Unblock action: ejecutar query consolidada abajo en warehouse productivo y pegar salida en RAT-82 con formato de cierre.

```sql
-- RAT-82 day-7 extract (confusion/dropoff)
-- Params:
--   :rollout_date = fecha de inicio rollout RAT-40.2 (YYYY-MM-DD)
--   baseline = rollout_date - 7d .. rollout_date - 1d
--   eval_day7 = rollout_date + 6d
with
params as (
  select
    cast(:rollout_date as date) as rollout_date
),
windows as (
  select
    rollout_date,
    (rollout_date - interval '7 day')::date as baseline_start,
    (rollout_date - interval '1 day')::date as baseline_end,
    (rollout_date + interval '6 day')::date as day7_date
  from params
),
dropoff_daily as (
  with star as (
    select date(event_ts_utc) as metric_date, user_id
    from events
    where event_name = 'review_star_selected'
    group by 1,2
  ),
  submitted as (
    select date(event_ts_utc) as metric_date, user_id
    from events
    where event_name = 'review_submitted'
    group by 1,2
  )
  select
    st.metric_date,
    1 - (count(distinct sb.user_id) * 1.0 / nullif(count(distinct st.user_id), 0)) as metric_value
  from star st
  left join submitted sb
    on st.metric_date = sb.metric_date
   and st.user_id = sb.user_id
  group by 1
),
confusion_daily as (
  select
    date(created_at_utc) as metric_date,
    sum(case when tag = 'review-status-confusion' then 1 else 0 end) * 1.0
      / nullif(sum(case when topic = 'reviews' then 1 else 0 end), 0) as metric_value
  from support_tickets
  group by 1
),
summary as (
  select
    'support_tickets_review_status_confusion' as kpi,
    avg(c.metric_value) filter (
      where c.metric_date between w.baseline_start and w.baseline_end
    ) as baseline_7d,
    avg(c.metric_value) filter (
      where c.metric_date = w.day7_date
    ) as day7_value
  from confusion_daily c
  cross join windows w
  union all
  select
    'review_flow_dropoff_after_star_select' as kpi,
    avg(d.metric_value) filter (
      where d.metric_date between w.baseline_start and w.baseline_end
    ) as baseline_7d,
    avg(d.metric_value) filter (
      where d.metric_date = w.day7_date
    ) as day7_value
  from dropoff_daily d
  cross join windows w
)
select
  kpi,
  baseline_7d,
  day7_value,
  (day7_value - baseline_7d) as delta_abs,
  case
    when baseline_7d = 0 or baseline_7d is null then null
    else (day7_value - baseline_7d) / baseline_7d
  end as delta_rel
from summary
order by kpi;
```

## Formato de comentario de cierre (pegar en RAT-82)

```md
RAT-82 day-7 KPI readout

- support_tickets_review_status_confusion: baseline X%, dia7 Y%, delta Z pp (W% rel)
- review_flow_dropoff_after_star_select: baseline X%, dia7 Y%, delta Z pp (W% rel)
- Decision: GO/CLOSE | ADJUST | ESCALATE
- Riesgo churn/revenue: none | low | medium | high
- Next action owner + fecha:
```
