# RAT-142 Production Warehouse SQL Execution + Day-7 KPI Snapshot Evidence

Date: 2026-05-07 (ART)  
Owner: Data Analyst (`d5f037cd-6a4f-485b-b342-4f94fa25c06c`)  
Issue: RAT-142  
Depends on: RAT-84

## Objective

Execute production warehouse SQL (`analysis/sql/rat-39-cs-dashboard-metrics.sql`) and publish day-7 KPI snapshot evidence.

## Execution Evidence (this heartbeat)

Timestamp (UTC): `2026-05-07T18:47:43Z`  
Timestamp (ART): `2026-05-07T15:47:43-03:00`

Command 1:

```bash
psql -Atqc "select now();"
```

Observed output:

```text
Password for user <user>:
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied
```

Command 2:

```bash
psql -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
```

Observed output:

```text
Password for user <user>:
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied
```

## Blocker

- Production warehouse credentials are unavailable in this run environment.
- No usable connection variables are configured for `psql` warehouse execution path.

## Unblock Owner + Action

- Owner: Data/Analytics Engineering
- Action:
  - Provide production warehouse access (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` or equivalent secure `DATABASE_URL`) to this execution context.
  - Re-run `analysis/sql/rat-39-cs-dashboard-metrics.sql`.
  - Publish immutable day-7 KPI snapshot values in the RAT-142 thread with:
    - KPI name
    - baseline 7d
    - day-7 value (or d1-d7 average)
    - delta abs (pp)
    - delta rel
    - guardrail state
    - execution timestamp + data cutoff (`America/Argentina/Buenos_Aires`)

## Snapshot Table (pending DB access)

| KPI | Baseline 7d | Day-7 value | Delta abs (pp) | Delta rel | Guardrail state |
|---|---:|---:|---:|---:|---|
| support_tickets_review_status_confusion |  |  |  |  |  |
| review_flow_dropoff_after_star_select |  |  |  |  |  |

## Reactivation Run After Blocker-Resolved Wake

Wake reason: `issue_blockers_resolved`  
Checked at (UTC): `2026-05-07T20:17:36Z`  
Checked at (ART): `2026-05-07T17:17:36-03:00`

Using board-provided DSN from RAT-144:

```bash
psql "$DATABASE_URL" -Atqc "select current_user, current_database(), now();"
```

Observed output:

```text
neondb_owner|neondb|2026-05-07 20:17:36.858687+00
```

Connectivity/auth is now working. Next, production data availability check:

```bash
select count(*) from analytics_events;
select count(*) from analytics_events_archive;
select count(*) from conversation;
select count(*) from message;
select count(*) from inquiry;
select count(*) from kpi_snapshot_daily;
```

Observed counts:

- `analytics_events`: `0`
- `analytics_events_archive`: `0`
- `conversation`: `0`
- `message`: `0`
- `inquiry`: `0`
- `kpi_snapshot_daily`: `0`

### Updated Blocker

- Secret/connectivity layer is unblocked.
- Data availability layer is blocked: required source datasets are empty in the provided database.

### Updated Unblock Owner + Action

- Owner: CTO / Data Platform
- Action:
  - Provide the production warehouse database/schema containing populated KPI source data for day-7 extract, or
  - provide a backfilled/exported table in current DB with required KPI inputs for `support_tickets_review_status_confusion` and `review_flow_dropoff_after_star_select`.
