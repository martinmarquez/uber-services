-- RAT-39 operational dashboard view
-- Date: 2026-05-07
-- Purpose: unify 5 CS metrics in a single dashboard-friendly shape with alert color.

with completion as (
  with started as (
    select
      date(event_ts_utc) as metric_date,
      user_type,
      case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
      platform,
      case when rating_value between 1 and 3 then '1-3'
           when rating_value between 4 and 5 then '4-5'
           else 'na' end as rating_bucket,
      user_id
    from events
    where event_name = 'review_flow_started'
    group by 1,2,3,4,5,6
  ),
  submitted as (
    select
      date(event_ts_utc) as metric_date,
      user_type,
      case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
      platform,
      case when rating_value between 1 and 3 then '1-3'
           when rating_value between 4 and 5 then '4-5'
           else 'na' end as rating_bucket,
      user_id
    from events
    where event_name = 'review_submitted'
    group by 1,2,3,4,5,6
  )
  select
    s.metric_date,
    s.user_type,
    s.cohort_segment,
    s.platform,
    s.rating_bucket,
    count(distinct sb.user_id) * 1.0 / nullif(count(distinct s.user_id), 0) as metric_value
  from started s
  left join submitted sb
    on s.metric_date = sb.metric_date
   and s.user_type = sb.user_type
   and s.cohort_segment = sb.cohort_segment
   and s.platform = sb.platform
   and s.rating_bucket = sb.rating_bucket
   and s.user_id = sb.user_id
  group by 1,2,3,4,5
),
dropoff as (
  with star as (
    select
      date(event_ts_utc) as metric_date,
      user_type,
      case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
      platform,
      case when rating_value between 1 and 3 then '1-3'
           when rating_value between 4 and 5 then '4-5'
           else 'na' end as rating_bucket,
      user_id
    from events
    where event_name = 'review_star_selected'
    group by 1,2,3,4,5,6
  ),
  submitted as (
    select
      date(event_ts_utc) as metric_date,
      user_type,
      case when cohort_age_days <= 30 then 'nuevos' else 'recurrentes' end as cohort_segment,
      platform,
      case when rating_value between 1 and 3 then '1-3'
           when rating_value between 4 and 5 then '4-5'
           else 'na' end as rating_bucket,
      user_id
    from events
    where event_name = 'review_submitted'
    group by 1,2,3,4,5,6
  )
  select
    st.metric_date,
    st.user_type,
    st.cohort_segment,
    st.platform,
    st.rating_bucket,
    1 - (count(distinct sb.user_id) * 1.0 / nullif(count(distinct st.user_id), 0)) as metric_value
  from star st
  left join submitted sb
    on st.metric_date = sb.metric_date
   and st.user_type = sb.user_type
   and st.cohort_segment = sb.cohort_segment
   and st.platform = sb.platform
   and st.rating_bucket = sb.rating_bucket
   and st.user_id = sb.user_id
  group by 1,2,3,4,5
),
confusion as (
  select
    date(created_at_utc) as metric_date,
    'all' as user_type,
    'all' as cohort_segment,
    'all' as platform,
    'all' as rating_bucket,
    sum(case when tag = 'review-status-confusion' then 1 else 0 end) * 1.0
      / nullif(sum(case when topic = 'reviews' then 1 else 0 end), 0) as metric_value
  from support_tickets
  group by 1
),
appeal as (
  select
    date(closed_at_utc) as metric_date,
    'all' as user_type,
    'all' as cohort_segment,
    'all' as platform,
    'all' as rating_bucket,
    sum(case when status = 'reopened' then 1 else 0 end) * 1.0
      / nullif(sum(case when status in ('closed','reopened') then 1 else 0 end), 0) as metric_value
  from appeals
  group by 1
),
exec_watch as (
  select
    date(created_at_utc) as metric_date,
    'all' as user_type,
    'all' as cohort_segment,
    'all' as platform,
    'all' as rating_bucket,
    count(*)::double precision as metric_value,
    sum(
      case
        when escalated_to_ceo_at_utc is not null
         and (extract(epoch from escalated_to_ceo_at_utc) - extract(epoch from created_at_utc)) / 3600.0 <= 4
        then 1 else 0
      end
    ) * 1.0 / nullif(count(*), 0) as sla_value
  from cs_incidents
  where flag = 'exec-watch'
  group by 1
)
select
  metric_date,
  'review_submit_completion_rate' as metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when metric_value < 0.70 then 'red'
    when metric_value < 0.80 then 'yellow'
    else 'green'
  end as alert_color
from completion

union all

select
  metric_date,
  'review_flow_dropoff_after_star_select' as metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when metric_value > 0.35 then 'red'
    when metric_value > 0.25 then 'yellow'
    else 'green'
  end as alert_color
from dropoff

union all

select
  metric_date,
  'support_tickets_review_status_confusion' as metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when metric_value > 0.20 then 'red'
    when metric_value > 0.15 then 'yellow'
    else 'green'
  end as alert_color
from confusion

union all

select
  metric_date,
  'appeal_reopen_rate' as metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when metric_value > 0.25 then 'red'
    when metric_value > 0.15 then 'yellow'
    else 'green'
  end as alert_color
from appeal

union all

select
  metric_date,
  'exec_watch_incidents' as metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when coalesce(sla_value, 0) < 1.0 then 'red'
    when metric_value >= 1 then 'yellow'
    else 'green'
  end as alert_color
from exec_watch;
