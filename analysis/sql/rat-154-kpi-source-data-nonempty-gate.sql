-- RAT-154
-- Non-empty source data gate for RAT-142 day-7 KPI snapshot.
-- Run this against the production analytics warehouse before re-running
-- analysis/sql/rat-39-cs-dashboard-metrics.sql.

with source_counts as (
  select 'events'::text as source_table, count(*)::bigint as row_count from events
  union all
  select 'support_tickets'::text as source_table, count(*)::bigint as row_count from support_tickets
),
windowed_counts as (
  -- Day-7 readout requires at least 7 days of raw rows to compute baseline_7d + day7.
  select
    'events_7d'::text as source_table,
    count(*)::bigint as row_count
  from events
  where event_ts_utc >= (now() at time zone 'utc') - interval '7 day'
  union all
  select
    'support_tickets_7d'::text as source_table,
    count(*)::bigint as row_count
  from support_tickets
  where created_at_utc >= (now() at time zone 'utc') - interval '7 day'
),
all_counts as (
  select * from source_counts
  union all
  select * from windowed_counts
),
thresholds as (
  select 'events'::text as source_table, 1::bigint as min_required
  union all select 'support_tickets', 1
  union all select 'events_7d', 1
  union all select 'support_tickets_7d', 1
)
select
  c.source_table,
  c.row_count,
  t.min_required,
  (c.row_count >= t.min_required) as pass_non_empty_gate
from all_counts c
join thresholds t using (source_table)
order by c.source_table;

-- Fails closed if any required input stream is empty.
-- Expected: all rows show pass_non_empty_gate=true.
