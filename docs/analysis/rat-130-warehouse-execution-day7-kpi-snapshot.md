# RAT-130 Warehouse SQL Execution + Day-7 KPI Snapshot for RAT-84

Date: 2026-05-07 (ART)
Owner: CTO
Issue: RAT-130

## Scope

Execute the warehouse query pack for day-7 KPI snapshot publication required to unblock RAT-84.

Source of truth SQL: `analysis/sql/rat-39-cs-dashboard-metrics.sql`

## Execution Attempt (this heartbeat)

Command executed from workspace:

```bash
psql -Atqc "select now();"
```

Observed result:

- Prompted for password, then authentication failure:
  - `connection to server on socket \"/tmp/.s.PGSQL.5432\" failed: fe_sendauth: no password supplied`

## Blocker

- Production warehouse credentials are not available in this execution environment.
- No database connection env vars are present for warehouse execution (`PGHOST`/`PGUSER`/`PGPASSWORD`/`DATABASE_URL` absent).

## Unblock Owner + Action

- Owner: Data/Analytics Engineering
- Action: run the RAT-39 SQL in production warehouse and publish immutable day-7 snapshot in issue thread with:
  - KPI name
  - baseline 7d
  - day-7 value (or d1-d7 average)
  - delta abs (pp)
  - delta rel
  - guardrail state
  - execution timestamp and data cutoff (`America/Argentina/Buenos_Aires`)

## Required Output Template

| KPI | Baseline 7d | Day-7 value | Delta abs (pp) | Delta rel | Guardrail state |
|---|---:|---:|---:|---:|---|
| support_tickets_review_status_confusion |  |  |  |  |  |
| review_flow_dropoff_after_star_select |  |  |  |  |  |

## Next CTO Step

- Verify published snapshot completeness and unblock RAT-84 only after evidence is attached on thread.
