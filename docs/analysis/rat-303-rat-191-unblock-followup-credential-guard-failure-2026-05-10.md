# RAT-303 RAT-191 Unblock Follow-up: Credential Guard Failure (2026-05-10)

Issue: [RAT-303](/RAT/issues/RAT-303)  
Dependency target: [RAT-191](/RAT/issues/RAT-191)

## Why this follow-up exists
Parent owner assigned this issue in RAT-41 iterative sweep because RAT-191 unblock behavior needed revalidation after RAT-298 closure.

## Action executed in this heartbeat
Re-ran the executable RAT-191 warehouse credential readiness guard in the current runtime.

Command:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

## Decision
Do not unblock RAT-191 from dependency-only sweep signals while this guard is failing. The runtime remains non-ready for warehouse-backed KPI execution.

## Unblock owner and required action
Owner: CTO / Data Platform

Required action:
1. Inject runtime production warehouse credentials (`DATABASE_URL` or full `PGHOST` `PGPORT` `PGDATABASE` `PGUSER` `PGPASSWORD`).
2. Re-run `tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh` until it reports `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY` with exit code `0`.
3. Post passing command output in RAT-191 and RAT-303, then resume downstream KPI-source execution gates.

## Next action after unblock
After credentials are present, execute:

```bash
psql "$DATABASE_URL" -f analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql
```

and attach result rows as source-evidence for dashboard/KPI pipeline readiness.
