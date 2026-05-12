# RAT-191 Warehouse Credentials + KPI Source Gate (2026-05-08)

Issue: [RAT-191](/RAT/issues/RAT-191)
Date: 2026-05-08
Assignee: Data Analyst

## Execution In This Heartbeat

1. Validated runtime credential presence for warehouse execution path.
2. Confirmed SQL gate artifact to run once credentials are injected:
   - `analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql`
   - `analysis/sql/rat-39-cs-dashboard-metrics.sql`
3. Prepared unblock contract for immediate re-run.

## Runtime Check Result

- `DATABASE_URL`: **missing**
- `PGHOST`: **missing**
- `PGPORT`: **missing**
- `PGDATABASE`: **missing**
- `PGUSER`: **missing**
- `PGPASSWORD`: **missing**

Result: warehouse execution is blocked in this runtime, so source non-empty gate and KPI extract cannot be executed yet.

Guard command for unblock readiness evidence:
```bash
tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh
```

Interpretation:
- `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY` + exit `0`: unblock may proceed.
- `RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING` + exit `2`: remain blocked.

## Unblock Owner + Action

Owner: CTO / Data Platform

Required action:
1. Inject production warehouse credentials into this execution runtime (`DATABASE_URL` or full `PG*`).
2. Confirm `events` and `support_tickets` have non-empty day-7 window rows.
3. Wake assignee to run:
   - `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql`
   - `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql`

## Immediate Next Action After Unblock

- Run both SQL artifacts.
- Publish immutable output snapshot in [RAT-142](/RAT/issues/RAT-142) with ART cutoff timestamp.
- Cascade update to [RAT-154](/RAT/issues/RAT-154).
