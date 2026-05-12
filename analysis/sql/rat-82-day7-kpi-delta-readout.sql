-- RAT-82 day-7 KPI readout
-- Purpose: produce baseline 7d vs eval window (d1-d7) deltas
-- Metrics: support_tickets_review_status_confusion, review_flow_dropoff_after_star_select

-- Parameters (replace with rollout dates in warehouse runner):
-- :baseline_start_date (inclusive)
-- :baseline_end_date   (inclusive)
-- :eval_start_date     (inclusive)
-- :eval_end_date       (inclusive)

with
star_daily as (
  select
    date(event_ts_utc) as metric_date,
    user_type,
    case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
    platform,
    count(distinct user_id) as star_users
  from events
  where event_name = 'review_star_selected'
  group by 1,2,3,4
),
submitted_daily as (
  select
    date(event_ts_utc) as metric_date,
    user_type,
    case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
    platform,
    count(distinct user_id) as submitted_users
  from events
  where event_name = 'review_submitted'
  group by 1,2,3,4
),
dropoff_daily as (
  select
    st.metric_date,
    st.user_type,
    st.cohort_segment,
    st.platform,
    1 - (coalesce(sb.submitted_users, 0) * 1.0 / nullif(st.star_users, 0)) as metric_value
  from star_daily st
  left join submitted_daily sb
    on st.metric_date = sb.metric_date
   and st.user_type = sb.user_type
   and st.cohort_segment = sb.cohort_segment
   and st.platform = sb.platform
),
confusion_daily as (
  select
    date(created_at_utc) as metric_date,
    'all'::text as user_type,
    'all'::text as cohort_segment,
    'all'::text as platform,
    sum(case when tag = 'review-status-confusion' then 1 else 0 end) * 1.0
      / nullif(sum(case when topic = 'reviews' then 1 else 0 end), 0) as metric_value
  from support_tickets
  group by 1
),
all_daily as (
  select
    'review_flow_dropoff_after_star_select' as metric_name,
    metric_date,
    user_type,
    cohort_segment,
    platform,
    metric_value
  from dropoff_daily

  union all

  select
    'support_tickets_review_status_confusion' as metric_name,
    metric_date,
    user_type,
    cohort_segment,
    platform,
    metric_value
  from confusion_daily
),
baseline as (
  select
    metric_name,
    user_type,
    cohort_segment,
    platform,
    avg(metric_value) as baseline_value
  from all_daily
  where metric_date between :baseline_start_date and :baseline_end_date
  group by 1,2,3,4
),
eval_window as (
  select
    metric_name,
    user_type,
    cohort_segment,
    platform,
    avg(metric_value) as eval_value
  from all_daily
  where metric_date between :eval_start_date and :eval_end_date
  group by 1,2,3,4
)
select
  e.metric_name,
  e.user_type,
  e.cohort_segment,
  e.platform,
  b.baseline_value,
  e.eval_value as day7_value,
  (e.eval_value - b.baseline_value) as delta_abs,
  (e.eval_value - b.baseline_value) / nullif(b.baseline_value, 0) as delta_rel,
  now() at time zone 'America/Argentina/Buenos_Aires' as generated_at_art
from eval_window e
left join baseline b
  on e.metric_name = b.metric_name
 and e.user_type = b.user_type
 and e.cohort_segment = b.cohort_segment
 and e.platform = b.platform
order by 1,2,3,4;
