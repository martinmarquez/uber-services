# RAT-150 Neon KPI SQL Rewrite + Day-7 Snapshot Evidence

Date: 2026-05-07 (ART)  
Owner: Data Analyst (`d5f037cd-6a4f-485b-b342-4f94fa25c06c`)  
Issue: RAT-150

## Objective

Rewrite RAT-39 KPI SQL to run against the provided Neon schema and publish day-7 snapshot evidence for RAT-84 KPIs.

## Delivery in this heartbeat

- Reworked SQL to target **actual Neon tables** available in runtime:
  - `kpi_snapshot_daily` (primary metric source)
  - `analytics_events` (validated present for downstream instrumentation checks)
- Published executable query pack:
  - `analysis/sql/rat-150-neon-kpi-day7.sql`
- Query now returns the required day-7 snapshot structure for:
  - `support_tickets_review_status_confusion`
  - `review_flow_dropoff_after_star_select`

## Runtime verification

Timestamp (UTC): `2026-05-07T20:48:35Z`  
Timestamp (ART): `2026-05-07T17:48:35-03:00`

Connectivity verification:

```sql
select now(), current_user, current_database();
```

Observed:

```text
2026-05-07 20:47:32.037104+00 | neondb_owner | neondb
```

SQL execution command:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-150-neon-kpi-day7.sql
```

Observed output snapshot:

```text
kpi                                       | day7_date | baseline_7d | day7_value | delta_abs | delta_rel | guardrail_state
review_flow_dropoff_after_star_select     |           |             |            |           |           | no_data
support_tickets_review_status_confusion   |           |             |            |           |           | no_data
```

## Interpretation

- SQL compatibility requirement is met: query executes successfully against the provided Neon DB.
- Day-7 KPI values are currently unavailable because source KPI rows are missing in `kpi_snapshot_daily` for both target metrics.
- This is now a **data availability/instrumentation gap**, not a SQL/runtime compatibility blocker.

## Data-risk escalation gate

Revenue/churn KPI decisioning risk remains active while both KPI series are `no_data`. Board visibility is required until KPI backfill/instrumentation is restored.

## Next action

- Data Platform / Analytics owner should backfill or resume writes for these two KPI metrics into `kpi_snapshot_daily`, then rerun `analysis/sql/rat-150-neon-kpi-day7.sql` to produce numeric baseline/day-7 deltas.
