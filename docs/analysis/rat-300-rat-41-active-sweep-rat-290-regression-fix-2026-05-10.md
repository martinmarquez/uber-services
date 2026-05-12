# RAT-300 Regression Fix: RAT-41 Active Sweep Still Auto-Unblocking RAT-290 After RAT-295 (2026-05-10)

Issue: [RAT-300](/RAT/issues/RAT-300)  
Scope target: RAT-41 active sweep auto-unblock path for [RAT-290](/RAT/issues/RAT-290)

## Problem
RAT-295 defined the policy gate for RAT-290/RAT-191, but the in-repo executable guard set had only RAT-191 and RAT-157 scripts. That left RAT-290 without a dedicated executable gate command, increasing risk of dependency-only (`deps=0`) unblock behavior in active sweeps.

## Fix Applied
Added a dedicated RAT-290 guardrail command:

- `tools/guardrails/check-rat-290-runtime-warehouse-credentials.sh`

Decision contract:

- Exit `0` + `RAT_290_RUNTIME_WAREHOUSE_CREDS_READY` => unblock may proceed.
- Exit `2` + `RAT_290_RUNTIME_WAREHOUSE_CREDS_MISSING` => keep blocked, reject auto-unblock.

## Verification
Commands run locally on 2026-05-10:

1. `tools/guardrails/check-rat-290-runtime-warehouse-credentials.sh`
   - Output: `RAT_290_RUNTIME_WAREHOUSE_CREDS_MISSING`
   - Exit: `2`
2. `DATABASE_URL='postgres://example' tools/guardrails/check-rat-290-runtime-warehouse-credentials.sh`
   - Output: `RAT_290_RUNTIME_WAREHOUSE_CREDS_READY`
   - Exit: `0`
3. `PGHOST=localhost PGPORT=5432 PGDATABASE=db PGUSER=u PGPASSWORD=p tools/guardrails/check-rat-290-runtime-warehouse-credentials.sh`
   - Output: `RAT_290_RUNTIME_WAREHOUSE_CREDS_READY`
   - Exit: `0`

## Next Action for RAT-41 Sweep Owner
Update active sweep logic to require this command output for RAT-290 before any auto-unblock transition when `deps=0`.
