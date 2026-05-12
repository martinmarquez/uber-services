-- RAT-150
-- Neon schema-compatible day-7 KPI snapshot extraction.
-- Date: 2026-05-07
--
-- Context:
-- - This Neon database does not expose RAT-39 legacy tables (`events`, `support_tickets`, etc.).
-- - Canonical analytics tables present: `analytics_events`, `kpi_snapshot_daily`.
-- - This query produces the day-7 snapshot contract for RAT-84 KPIs from `kpi_snapshot_daily`.

with target_kpis as (
  select 'support_tickets_review_status_confusion'::text as kpi
  union all
  select 'review_flow_dropoff_after_star_select'::text as kpi
),
raw as (
  select
    snapshot_date as metric_date,
    metric::text as kpi,
    value::double precision as value,
    tenant_id
  from kpi_snapshot_daily
  where metric::text in (
    'support_tickets_review_status_confusion',
    'review_flow_dropoff_after_star_select'
  )
),
ranked as (
  select
    r.*,
    row_number() over (partition by r.kpi order by r.metric_date desc) as rn_desc
  from raw r
),
baseline as (
  select
    kpi,
    avg(value) as baseline_7d
  from ranked
  where rn_desc between 2 and 8
  group by 1
),
day7 as (
  select
    kpi,
    metric_date as day7_date,
    value as day7_value
  from ranked
  where rn_desc = 1
),
calc as (
  select
    tk.kpi,
    d.day7_date,
    b.baseline_7d,
    d.day7_value,
    (d.day7_value - b.baseline_7d) as delta_abs,
    ((d.day7_value - b.baseline_7d) / nullif(b.baseline_7d, 0)) as delta_rel,
    case
      when d.day7_value is null or b.baseline_7d is null then 'no_data'
      when tk.kpi = 'support_tickets_review_status_confusion' and d.day7_value > 0.20 then 'red'
      when tk.kpi = 'support_tickets_review_status_confusion' and d.day7_value > 0.15 then 'yellow'
      when tk.kpi = 'review_flow_dropoff_after_star_select' and d.day7_value > 0.35 then 'red'
      when tk.kpi = 'review_flow_dropoff_after_star_select' and d.day7_value > 0.25 then 'yellow'
      else 'green'
    end as guardrail_state
  from target_kpis tk
  left join day7 d using (kpi)
  left join baseline b using (kpi)
)
select
  kpi,
  day7_date,
  round(baseline_7d::numeric, 6) as baseline_7d,
  round(day7_value::numeric, 6) as day7_value,
  round(delta_abs::numeric, 6) as delta_abs,
  round(delta_rel::numeric, 6) as delta_rel,
  guardrail_state
from calc
order by kpi;
