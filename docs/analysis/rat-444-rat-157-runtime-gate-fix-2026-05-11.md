# RAT-444: Fix RAT-157 runtime gate failure (`psql_unexecutable` + missing warehouse creds) — 2026-05-11

## Objective
Stabilize the RAT-301/RAT-157 runtime gate path so SQL client detection is robust and warehouse credential failures are reported deterministically.

## Changes
- Hardened `tools/guardrails/check-rat-301-acceptance.sh`:
  - Added resilient `psql` binary resolution with fallback candidates.
  - Split failure modes:
    - `RAT_301_ACCEPTANCE_FAIL:psql_missing`
    - `RAT_301_ACCEPTANCE_FAIL:psql_unexecutable`
    - `RAT_301_ACCEPTANCE_FAIL:warehouse_creds_missing`
    - `RAT_301_ACCEPTANCE_FAIL:warehouse_connectivity`
- Hardened `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`:
  - Reused resilient `psql` resolution.
  - Executes probes with resolved binary instead of assuming PATH wrapper is executable.
- Updated `tools/guardrails/generate-rat-157-runtime-proof.sh`:
  - Uses same robust `psql` resolution for proof output.
  - Avoids misleading client failures when wrapper path is unavailable.

## Verification
Commands executed in this heartbeat:

```bash
bash tools/guardrails/check-rat-301-acceptance.sh
# RAT_301_ACCEPTANCE_FAIL:warehouse_creds_missing
# exit 2

bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh
# RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds
# exit 2
```

Interpretation:
- `psql_unexecutable` false-negative path is removed by resilient binary resolution.
- Current remaining blocker is real runtime secret state: warehouse credentials are still not injected.

## Next Action (Owner)
- Owner: CTO/runtime secrets owner.
- Action: inject runtime warehouse credentials (`DATABASE_URL` or full `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`) and rerun:
  - `tools/guardrails/check-rat-301-acceptance.sh`
  - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
