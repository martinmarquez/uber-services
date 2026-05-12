-- RAT-39 operational view mapped to current Neon schema
-- Date: 2026-05-11
-- Source tables available: analytics_events, conversation, inquiry

create or replace view public.rat39_cs_dashboard_operational_v1 as
with ev as (
  select
    date(occurred_at at time zone 'America/Argentina/Buenos_Aires') as metric_date,
    coalesce(properties->>'user_type', 'unknown') as user_type,
    coalesce(properties->>'cohort_segment', 'unknown') as cohort_segment,
    coalesce(properties->>'platform', 'unknown') as platform,
    coalesce(properties->>'rating_bucket', 'unknown') as rating_bucket,
    coalesce(event_type::text, 'unknown') as event_name,
    actor_id,
    properties,
    occurred_at
  from analytics_events
),
completion as (
  with started as (
    select metric_date, user_type, cohort_segment, platform, rating_bucket, actor_id
    from ev
    where event_name = 'review_flow_started'
    group by 1,2,3,4,5,6
  ),
  submitted as (
    select metric_date, user_type, cohort_segment, platform, rating_bucket, actor_id
    from ev
    where event_name = 'review_submitted'
    group by 1,2,3,4,5,6
  )
  select
    s.metric_date,
    'review_submit_completion_rate'::text as metric_name,
    s.user_type,
    s.cohort_segment,
    s.platform,
    s.rating_bucket,
    count(distinct sb.actor_id) * 1.0 / nullif(count(distinct s.actor_id), 0) as metric_value
  from started s
  left join submitted sb
    on s.metric_date = sb.metric_date
   and s.user_type = sb.user_type
   and s.cohort_segment = sb.cohort_segment
   and s.platform = sb.platform
   and s.rating_bucket = sb.rating_bucket
   and s.actor_id = sb.actor_id
  group by 1,2,3,4,5,6
),
dropoff as (
  with star as (
    select metric_date, user_type, cohort_segment, platform, rating_bucket, actor_id
    from ev
    where event_name = 'review_star_selected'
    group by 1,2,3,4,5,6
  ),
  submitted as (
    select metric_date, user_type, cohort_segment, platform, rating_bucket, actor_id
    from ev
    where event_name = 'review_submitted'
    group by 1,2,3,4,5,6
  )
  select
    st.metric_date,
    'review_flow_dropoff_after_star_select'::text as metric_name,
    st.user_type,
    st.cohort_segment,
    st.platform,
    st.rating_bucket,
    1 - (count(distinct sb.actor_id) * 1.0 / nullif(count(distinct st.actor_id), 0)) as metric_value
  from star st
  left join submitted sb
    on st.metric_date = sb.metric_date
   and st.user_type = sb.user_type
   and st.cohort_segment = sb.cohort_segment
   and st.platform = sb.platform
   and st.rating_bucket = sb.rating_bucket
   and st.actor_id = sb.actor_id
  group by 1,2,3,4,5,6
),
confusion as (
  select
    date(created_at at time zone 'America/Argentina/Buenos_Aires') as metric_date,
    'support_tickets_review_status_confusion'::text as metric_name,
    'all'::text as user_type,
    'all'::text as cohort_segment,
    'all'::text as platform,
    'all'::text as rating_bucket,
    avg(case when coalesce(metadata->>'review_status_confusion', 'false') = 'true' then 1.0 else 0.0 end) as metric_value
  from conversation
  group by 1
),
appeal as (
  select
    date(occurred_at at time zone 'America/Argentina/Buenos_Aires') as metric_date,
    'appeal_reopen_rate'::text as metric_name,
    'all'::text as user_type,
    'all'::text as cohort_segment,
    'all'::text as platform,
    'all'::text as rating_bucket,
    sum(case when event_name = 'appeal_reopened' then 1 else 0 end) * 1.0
      / nullif(sum(case when event_name in ('appeal_closed','appeal_reopened') then 1 else 0 end), 0) as metric_value
  from ev
  where event_name in ('appeal_closed', 'appeal_reopened')
  group by 1
),
exec_watch as (
  select
    date(occurred_at at time zone 'America/Argentina/Buenos_Aires') as metric_date,
    'exec_watch_incidents'::text as metric_name,
    'all'::text as user_type,
    'all'::text as cohort_segment,
    'all'::text as platform,
    'all'::text as rating_bucket,
    count(*)::double precision as metric_value
  from ev
  where coalesce(properties->>'flag', '') = 'exec-watch'
  group by 1
),
unioned as (
  select * from completion
  union all
  select * from dropoff
  union all
  select * from confusion
  union all
  select * from appeal
  union all
  select * from exec_watch
)
select
  metric_date,
  metric_name,
  user_type,
  cohort_segment,
  platform,
  rating_bucket,
  metric_value,
  case
    when metric_name = 'review_submit_completion_rate' and metric_value < 0.70 then 'red'
    when metric_name = 'review_submit_completion_rate' and metric_value < 0.80 then 'yellow'
    when metric_name = 'review_flow_dropoff_after_star_select' and metric_value > 0.35 then 'red'
    when metric_name = 'review_flow_dropoff_after_star_select' and metric_value > 0.25 then 'yellow'
    when metric_name = 'support_tickets_review_status_confusion' and metric_value > 0.20 then 'red'
    when metric_name = 'support_tickets_review_status_confusion' and metric_value > 0.15 then 'yellow'
    when metric_name = 'appeal_reopen_rate' and metric_value > 0.25 then 'red'
    when metric_name = 'appeal_reopen_rate' and metric_value > 0.15 then 'yellow'
    when metric_name = 'exec_watch_incidents' and metric_value >= 1 then 'yellow'
    else 'green'
  end as alert_color
from unioned;
