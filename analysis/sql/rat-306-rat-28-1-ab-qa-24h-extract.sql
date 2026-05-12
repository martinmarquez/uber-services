-- RAT-306 / RAT-28.1
-- 24h A/B QA extract for instrumentation + sample quality closure.
-- Date: 2026-05-10
--
-- Expected source schema (warehouse runtime):
-- analytics_events(
--   event_type text,
--   occurred_at timestamptz,
--   actor_id text,
--   properties jsonb
-- )
--
-- Required properties keys in `properties`:
-- - experiment_id
-- - variant
--
-- This extract returns evidence for RAT-28 gates:
-- 1) variant counts and split (experiment_assigned, review_conversion)
-- 2) SRM check (chi-square p-value)
-- 3) duplicate/multi-exposure rate by subject+experiment
-- 4) conversion lineage integrity (orphan conversion rate)

with windowed as (
  select
    event_type,
    occurred_at as event_ts_utc,
    coalesce(nullif(actor_id::text, ''), nullif(properties ->> 'user_id', ''), nullif(properties ->> 'anon_id', ''), 'unknown_subject') as subject_id,
    coalesce(nullif(properties ->> 'session_id', ''), 'unknown_session') as session_id,
    coalesce(nullif(properties ->> 'channel', ''), nullif(properties ->> 'acquisition_channel', ''), 'unknown_channel') as channel,
    properties ->> 'experiment_id' as experiment_id,
    lower(properties ->> 'variant') as variant
  from analytics_events
  where occurred_at >= (now() at time zone 'utc') - interval '24 hour'
    and event_type::text in ('experiment_assigned', 'review_conversion')
),
clean as (
  select *
  from windowed
  where experiment_id is not null
    and variant in ('control', 'treatment')
),
assigned as (
  select *
  from clean
  where event_type::text = 'experiment_assigned'
),
conversions as (
  select *
  from clean
  where event_type::text = 'review_conversion'
),
assignment_counts as (
  select experiment_id, variant, count(*)::bigint as n
  from assigned
  group by 1,2
),
assignment_totals as (
  select experiment_id, sum(n)::bigint as n_total
  from assignment_counts
  group by 1
),
srm as (
  select
    c.experiment_id,
    coalesce(max(case when c.variant = 'control' then c.n end), 0)::double precision as n_control,
    coalesce(max(case when c.variant = 'treatment' then c.n end), 0)::double precision as n_treatment,
    t.n_total::double precision as n_total,
    power(coalesce(max(case when c.variant = 'control' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
      / nullif(t.n_total::double precision / 2.0, 0)
    +
    power(coalesce(max(case when c.variant = 'treatment' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
      / nullif(t.n_total::double precision / 2.0, 0)
      as chi_square_stat,
    exp(-0.5 * (
      power(coalesce(max(case when c.variant = 'control' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
        / nullif(t.n_total::double precision / 2.0, 0)
      +
      power(coalesce(max(case when c.variant = 'treatment' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
        / nullif(t.n_total::double precision / 2.0, 0)
    )) as p_value_approx,
    case
      when t.n_total < 200 then 'insufficient_sample_for_gate'
      when exp(-0.5 * (
        power(coalesce(max(case when c.variant = 'control' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
          / nullif(t.n_total::double precision / 2.0, 0)
        +
        power(coalesce(max(case when c.variant = 'treatment' then c.n end), 0) - (t.n_total::double precision / 2.0), 2)
          / nullif(t.n_total::double precision / 2.0, 0)
      )) < 0.001 then 'srm_alert'
      else 'ok'
    end as srm_gate
  from assignment_counts c
  join assignment_totals t using (experiment_id)
  group by c.experiment_id, t.n_total
),
subject_assignment as (
  select
    experiment_id,
    subject_id,
    count(*)::bigint as assigned_rows,
    count(distinct variant)::bigint as distinct_variants
  from assigned
  group by 1,2
),
duplicate_check as (
  select
    experiment_id,
    count(*)::bigint as subjects_assigned,
    sum(case when assigned_rows > 1 then 1 else 0 end)::bigint as subjects_with_duplicate_assignments,
    sum(case when distinct_variants > 1 then 1 else 0 end)::bigint as subjects_with_multi_variant_exposure
  from subject_assignment
  group by 1
),
conversion_lineage as (
  select
    c.experiment_id,
    c.variant,
    c.subject_id,
    c.session_id,
    c.event_ts_utc,
    a.subject_id as matched_assigned_subject
  from conversions c
  left join assigned a
    on c.experiment_id = a.experiment_id
   and c.variant = a.variant
   and c.subject_id = a.subject_id
),
funnel_integrity as (
  select
    experiment_id,
    variant,
    count(*)::bigint as conversions_total,
    sum(case when matched_assigned_subject is null then 1 else 0 end)::bigint as orphan_conversions,
    sum(case when matched_assigned_subject is not null then 1 else 0 end)::bigint as conversions_with_assignment
  from conversion_lineage
  group by 1,2
)

-- Result set A: counts and split by variant.
select
  'variant_counts'::text as section,
  c.experiment_id,
  c.variant,
  c.n as event_count,
  t.n_total as total_assigned,
  round((c.n::numeric / nullif(t.n_total, 0)) * 100.0, 3) as split_pct,
  null::text as gate_status,
  null::numeric as value_1,
  null::numeric as value_2
from assignment_counts c
join assignment_totals t using (experiment_id)

union all

-- Result set B: SRM.
select
  'srm_check'::text as section,
  s.experiment_id,
  'all'::text as variant,
  s.n_total::bigint as event_count,
  s.n_total::bigint as total_assigned,
  null::numeric as split_pct,
  s.srm_gate as gate_status,
  round(s.chi_square_stat::numeric, 6) as value_1,
  round(s.p_value_approx::numeric, 6) as value_2
from srm s

union all

-- Result set C: duplicate and contamination rates.
select
  'duplicate_check'::text as section,
  d.experiment_id,
  'all'::text as variant,
  d.subjects_assigned as event_count,
  d.subjects_assigned as total_assigned,
  null::numeric as split_pct,
  case
    when d.subjects_assigned = 0 then 'no_data'
    when (d.subjects_with_multi_variant_exposure::double precision / d.subjects_assigned::double precision) > 0.005 then 'contamination_alert'
    else 'ok'
  end as gate_status,
  round((d.subjects_with_duplicate_assignments::numeric / nullif(d.subjects_assigned, 0)) * 100.0, 6) as value_1,
  round((d.subjects_with_multi_variant_exposure::numeric / nullif(d.subjects_assigned, 0)) * 100.0, 6) as value_2
from duplicate_check d

union all

-- Result set D: conversion lineage integrity.
select
  'funnel_integrity'::text as section,
  f.experiment_id,
  f.variant,
  f.conversions_total as event_count,
  null::bigint as total_assigned,
  null::numeric as split_pct,
  case
    when f.conversions_total = 0 then 'no_conversions'
    when (f.orphan_conversions::double precision / f.conversions_total::double precision) > 0.01 then 'orphan_alert'
    else 'ok'
  end as gate_status,
  round((f.orphan_conversions::numeric / nullif(f.conversions_total, 0)) * 100.0, 6) as value_1,
  round((f.conversions_with_assignment::numeric / nullif(f.conversions_total, 0)) * 100.0, 6) as value_2
from funnel_integrity f
order by 1,2,3;
