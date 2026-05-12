# RAT-933 — KPI day-7 surface count evidence (2026-05-11)

## Scope
Populate/validate day-7 KPI surface and publish immutable count evidence for:
- `support_tickets_review_status_confusion`
- `review_flow_dropoff_after_star_select`

## Runtime
- Timestamp (UTC): `2026-05-11T21:22:00Z`
- Database: Neon (`$DATABASE_URL` in workspace runtime)

## Commands executed
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-150-neon-kpi-day7.sql

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
select metric::text as metric, count(*)::bigint as row_count, min(snapshot_date) as min_date, max(snapshot_date) as max_date
from kpi_snapshot_daily
where metric::text in ('support_tickets_review_status_confusion','review_flow_dropoff_after_star_select')
group by 1
order by 1;
"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
select count(*)::bigint as analytics_events_total, min(occurred_at) as min_occurred_at, max(occurred_at) as max_occurred_at
from analytics_events;
"
```

## Results

### 1) Day-7 KPI extract (`analysis/sql/rat-150-neon-kpi-day7.sql`)
| kpi | day7_date | baseline_7d | day7_value | delta_abs | delta_rel | guardrail_state |
|---|---|---:|---:|---:|---:|---|
| review_flow_dropoff_after_star_select | null | null | null | null | null | no_data |
| support_tickets_review_status_confusion | null | null | null | null | null | no_data |

### 2) KPI surface counts (`kpi_snapshot_daily`)
- Query returned `0 rows` for both target metrics.
- There is no available `min_date`/`max_date` because no snapshot rows exist.

### 3) Upstream analytics signal count (`analytics_events`)
| analytics_events_total | min_occurred_at | max_occurred_at |
|---:|---|---|
| 0 | null | null |

## Conclusion
RAT-933 cannot publish populated day-7 KPI deltas yet because source and snapshot surfaces are empty in the current runtime.

## Unblock owner/action
- Owner: Data Platform / DB owner
- Action required:
  1. Backfill or ingest rows into `analytics_events` and `kpi_snapshot_daily` for the two target KPI metrics.
  2. Ensure at least 8 daily snapshots exist so `baseline_7d` and `day7` can compute.
  3. Wake assignee to re-run `analysis/sql/rat-150-neon-kpi-day7.sql` and publish non-null day-7 evidence.
