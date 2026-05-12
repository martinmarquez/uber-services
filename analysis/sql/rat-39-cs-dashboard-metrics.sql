-- RAT-39 / RAT-37.1
-- Instrumentacion: 5 metricas CS para tablero operativo
-- Date: 2026-05-07

-- Assumptions:
-- 1) Tabla de eventos: events(event_name, event_ts_utc, user_id, review_id, order_id, user_type, platform, cohort_age_days, rating_value)
-- 2) Tabla de tickets: support_tickets(created_at_utc, ticket_id, tag, topic)
-- 3) Tabla de apelaciones: appeals(closed_at_utc, appeal_id, status)
-- 4) Tabla de incidentes ejecutivos: cs_incidents(created_at_utc, incident_id, flag, escalated_to_ceo_at_utc)

-- 1) review_submit_completion_rate = users_submitted / users_started
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
  count(distinct sb.user_id) * 1.0 / nullif(count(distinct s.user_id), 0) as review_submit_completion_rate
from started s
left join submitted sb
  on s.metric_date = sb.metric_date
 and s.user_type = sb.user_type
 and s.cohort_segment = sb.cohort_segment
 and s.platform = sb.platform
 and s.rating_bucket = sb.rating_bucket
 and s.user_id = sb.user_id
group by 1,2,3,4,5
order by 1 desc;

-- 2) review_flow_dropoff_after_star_select = 1 - submitted_after_star / star_selected
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
submitted_after_star as (
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
  1 - (count(distinct sas.user_id) * 1.0 / nullif(count(distinct st.user_id), 0)) as review_flow_dropoff_after_star_select
from star st
left join submitted_after_star sas
  on st.metric_date = sas.metric_date
 and st.user_type = sas.user_type
 and st.cohort_segment = sas.cohort_segment
 and st.platform = sas.platform
 and st.rating_bucket = sas.rating_bucket
 and st.user_id = sas.user_id
group by 1,2,3,4,5
order by 1 desc;

-- 3) support_tickets_review_status_confusion
select
  date(created_at_utc) as metric_date,
  sum(case when tag = 'review-status-confusion' then 1 else 0 end) * 1.0
    / nullif(sum(case when topic = 'reviews' then 1 else 0 end), 0) as support_tickets_review_status_confusion
from support_tickets
group by 1
order by 1 desc;

-- 4) appeal_reopen_rate = reopened / closed
select
  date(closed_at_utc) as metric_date,
  sum(case when status = 'reopened' then 1 else 0 end) * 1.0
    / nullif(sum(case when status in ('closed', 'reopened') then 1 else 0 end), 0) as appeal_reopen_rate
from appeals
group by 1
order by 1 desc;

-- 5) exec_watch_incidents + SLA (<4h)
select
  date(created_at_utc) as metric_date,
  count(*) as exec_watch_incidents,
  sum(
    case
      when escalated_to_ceo_at_utc is not null
       and (extract(epoch from escalated_to_ceo_at_utc) - extract(epoch from created_at_utc)) / 3600.0 <= 4
      then 1 else 0
    end
  ) * 1.0 / nullif(count(*), 0) as exec_watch_sla_compliance_rate
from cs_incidents
where flag = 'exec-watch'
group by 1
order by 1 desc;
