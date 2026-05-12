-- RAT-311 rollout gates + board-risk alerts dashboard
-- Date: 2026-05-10
-- Owner: Data Analyst
--
-- Purpose:
-- Build a CEO/CTO-ready monitoring dataset for phased scoring rollout with:
-- 1) 7-day moving KPIs
-- 2) control vs treatment deltas
-- 3) gate status and escalation level (none|cto|board)
--
-- Expected source table:
-- analytics_events(event_ts_utc, event_name, variant, user_id, session_id, order_id, amount_usd)
-- where variant in ('control','treatment') and event_name includes:
-- rollout_exposed, booking_completed, subscription_canceled, claim_submitted, refund_issued

with base as (
  select
    date(event_ts_utc) as metric_date,
    lower(variant) as variant,
    event_name,
    user_id,
    coalesce(amount_usd, 0)::double precision as amount_usd
  from analytics_events
  where lower(variant) in ('control', 'treatment')
    and event_name in (
      'rollout_exposed',
      'booking_completed',
      'subscription_canceled',
      'claim_submitted',
      'refund_issued'
    )
),
daily as (
  select
    metric_date,
    variant,
    count(distinct case when event_name = 'rollout_exposed' then user_id end)::double precision as exposed_users,
    count(distinct case when event_name = 'booking_completed' then user_id end)::double precision as converters,
    count(distinct case when event_name = 'subscription_canceled' then user_id end)::double precision as churned_users,
    count(case when event_name = 'claim_submitted' then 1 end)::double precision as claims_count,
    sum(case when event_name = 'refund_issued' then amount_usd else 0 end)::double precision as refunds_usd
  from base
  group by 1,2
),
daily_kpis as (
  select
    metric_date,
    variant,
    converters / nullif(exposed_users, 0) as conversion_rate,
    churned_users / nullif(exposed_users, 0) as churn_top_decil_rate,
    claims_count / nullif(exposed_users, 0) as claims_rate,
    refunds_usd / nullif(exposed_users, 0) as refunds_per_exposed_usd,
    claims_count,
    refunds_usd,
    exposed_users
  from daily
),
rolling_7d as (
  select
    metric_date,
    variant,
    avg(conversion_rate) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as conversion_rate_7d,
    avg(churn_top_decil_rate) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as churn_top_decil_rate_7d,
    avg(claims_rate) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as claims_rate_7d,
    avg(refunds_per_exposed_usd) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as refunds_per_exposed_usd_7d,
    sum(claims_count) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as claims_count_7d,
    sum(refunds_usd) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as refunds_usd_7d,
    sum(exposed_users) over (
      partition by variant
      order by metric_date
      rows between 6 preceding and current row
    ) as exposed_users_7d
  from daily_kpis
),
paired as (
  select
    c.metric_date,
    c.conversion_rate_7d as control_conversion_rate_7d,
    t.conversion_rate_7d as treatment_conversion_rate_7d,
    c.churn_top_decil_rate_7d as control_churn_top_decil_rate_7d,
    t.churn_top_decil_rate_7d as treatment_churn_top_decil_rate_7d,
    c.claims_rate_7d as control_claims_rate_7d,
    t.claims_rate_7d as treatment_claims_rate_7d,
    c.refunds_per_exposed_usd_7d as control_refunds_per_exposed_usd_7d,
    t.refunds_per_exposed_usd_7d as treatment_refunds_per_exposed_usd_7d,
    c.claims_count_7d as control_claims_count_7d,
    t.claims_count_7d as treatment_claims_count_7d,
    c.refunds_usd_7d as control_refunds_usd_7d,
    t.refunds_usd_7d as treatment_refunds_usd_7d,
    c.exposed_users_7d as control_exposed_users_7d,
    t.exposed_users_7d as treatment_exposed_users_7d
  from rolling_7d c
  join rolling_7d t
    on c.metric_date = t.metric_date
   and c.variant = 'control'
   and t.variant = 'treatment'
),
scored as (
  select
    metric_date,

    control_conversion_rate_7d,
    treatment_conversion_rate_7d,
    (treatment_conversion_rate_7d - control_conversion_rate_7d) as conversion_delta_abs,
    ((treatment_conversion_rate_7d - control_conversion_rate_7d) / nullif(control_conversion_rate_7d, 0)) as conversion_delta_rel,

    control_churn_top_decil_rate_7d,
    treatment_churn_top_decil_rate_7d,
    (treatment_churn_top_decil_rate_7d - control_churn_top_decil_rate_7d) as churn_delta_abs,
    ((treatment_churn_top_decil_rate_7d - control_churn_top_decil_rate_7d) / nullif(control_churn_top_decil_rate_7d, 0)) as churn_delta_rel,

    control_claims_rate_7d,
    treatment_claims_rate_7d,
    (treatment_claims_rate_7d - control_claims_rate_7d) as claims_delta_abs,
    ((treatment_claims_rate_7d - control_claims_rate_7d) / nullif(control_claims_rate_7d, 0)) as claims_delta_rel,

    control_refunds_per_exposed_usd_7d,
    treatment_refunds_per_exposed_usd_7d,
    (treatment_refunds_per_exposed_usd_7d - control_refunds_per_exposed_usd_7d) as refunds_delta_abs,
    ((treatment_refunds_per_exposed_usd_7d - control_refunds_per_exposed_usd_7d) / nullif(control_refunds_per_exposed_usd_7d, 0)) as refunds_delta_rel,

    control_claims_count_7d,
    treatment_claims_count_7d,
    control_refunds_usd_7d,
    treatment_refunds_usd_7d,
    control_exposed_users_7d,
    treatment_exposed_users_7d,

    case
      when ((treatment_conversion_rate_7d - control_conversion_rate_7d) / nullif(control_conversion_rate_7d, 0)) <= -0.10 then 'breach'
      when ((treatment_conversion_rate_7d - control_conversion_rate_7d) / nullif(control_conversion_rate_7d, 0)) <= -0.05 then 'warning'
      else 'pass'
    end as gate_conversion_status,

    case
      when ((treatment_churn_top_decil_rate_7d - control_churn_top_decil_rate_7d) / nullif(control_churn_top_decil_rate_7d, 0)) >= 0.20 then 'breach'
      when ((treatment_churn_top_decil_rate_7d - control_churn_top_decil_rate_7d) / nullif(control_churn_top_decil_rate_7d, 0)) >= 0.10 then 'warning'
      else 'pass'
    end as gate_churn_status,

    case
      when ((treatment_claims_rate_7d - control_claims_rate_7d) / nullif(control_claims_rate_7d, 0)) >= 0.20 then 'breach'
      when ((treatment_claims_rate_7d - control_claims_rate_7d) / nullif(control_claims_rate_7d, 0)) >= 0.10 then 'warning'
      else 'pass'
    end as gate_claims_status,

    case
      when ((treatment_refunds_per_exposed_usd_7d - control_refunds_per_exposed_usd_7d) / nullif(control_refunds_per_exposed_usd_7d, 0)) >= 0.20 then 'breach'
      when ((treatment_refunds_per_exposed_usd_7d - control_refunds_per_exposed_usd_7d) / nullif(control_refunds_per_exposed_usd_7d, 0)) >= 0.10 then 'warning'
      else 'pass'
    end as gate_refunds_status
  from paired
)
select
  metric_date,

  round(control_conversion_rate_7d::numeric, 6) as control_conversion_rate_7d,
  round(treatment_conversion_rate_7d::numeric, 6) as treatment_conversion_rate_7d,
  round(conversion_delta_abs::numeric, 6) as conversion_delta_abs,
  round(conversion_delta_rel::numeric, 6) as conversion_delta_rel,

  round(control_churn_top_decil_rate_7d::numeric, 6) as control_churn_top_decil_rate_7d,
  round(treatment_churn_top_decil_rate_7d::numeric, 6) as treatment_churn_top_decil_rate_7d,
  round(churn_delta_abs::numeric, 6) as churn_delta_abs,
  round(churn_delta_rel::numeric, 6) as churn_delta_rel,

  round(control_claims_rate_7d::numeric, 6) as control_claims_rate_7d,
  round(treatment_claims_rate_7d::numeric, 6) as treatment_claims_rate_7d,
  round(claims_delta_abs::numeric, 6) as claims_delta_abs,
  round(claims_delta_rel::numeric, 6) as claims_delta_rel,

  round(control_refunds_per_exposed_usd_7d::numeric, 6) as control_refunds_per_exposed_usd_7d,
  round(treatment_refunds_per_exposed_usd_7d::numeric, 6) as treatment_refunds_per_exposed_usd_7d,
  round(refunds_delta_abs::numeric, 6) as refunds_delta_abs,
  round(refunds_delta_rel::numeric, 6) as refunds_delta_rel,

  control_exposed_users_7d,
  treatment_exposed_users_7d,
  control_claims_count_7d,
  treatment_claims_count_7d,
  round(control_refunds_usd_7d::numeric, 2) as control_refunds_usd_7d,
  round(treatment_refunds_usd_7d::numeric, 2) as treatment_refunds_usd_7d,

  gate_conversion_status,
  gate_churn_status,
  gate_claims_status,
  gate_refunds_status,

  case
    when gate_conversion_status = 'breach'
      or gate_churn_status = 'breach'
      or gate_claims_status = 'breach'
      or gate_refunds_status = 'breach'
    then 'board'
    when gate_conversion_status = 'warning'
      or gate_churn_status = 'warning'
      or gate_claims_status = 'warning'
      or gate_refunds_status = 'warning'
    then 'cto'
    else 'none'
  end as escalation_level
from scored
order by metric_date desc;
