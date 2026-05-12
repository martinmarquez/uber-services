# RAT-290 Runtime Warehouse Creds + Day-7 Source Check (2026-05-10)

Issue: [RAT-290](/RAT/issues/RAT-290)  
Dependency target: [RAT-191](/RAT/issues/RAT-191)

## Why This Heartbeat

Wake comment acknowledged: `Assigned in RAT-41 sweep by parent owner.`  
Action taken in this heartbeat: execute RAT-191 runtime credential guard again and restate the day-7 source-row proof command path required to unblock.

## Runtime Guard Evidence

Command:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

Interpretation:
- Runtime does not currently expose `DATABASE_URL` and does not expose a complete `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` tuple.
- RAT-191 remains blocked by credential readiness gate.
- RAT-290 must not be auto-unblocked by RAT-41 dependency sweep while this non-READY result persists.

## RAT-41 Auto-Unblock Gate (RAT-295 hardening)

Decision rule for RAT-290 in sweep context:
- `deps=0` is insufficient.
- Auto-unblock is allowed only with fresh in-thread runtime evidence:
  - `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY`
  - `EXIT_CODE:0`
- Any missing/stale/non-READY evidence keeps RAT-290 blocked.

## Day-7 Source Rows Confirmation Path (ready after creds injection)

Run in the production analytics warehouse:

```sql
-- analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql
```

Pass condition:
- `events`, `support_tickets`, `events_7d`, and `support_tickets_7d` each return `pass_non_empty_gate=true`.

## Unblock Owner + Required Action

- Unblock owner: CTO / Data Platform
- Required action:
  1. Inject production warehouse credentials into this issue runtime (`DATABASE_URL` or full `PG*` tuple).
  2. Re-run `tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh` until it returns `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY`.
  3. Execute `analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql` and post the result rows in RAT-290 (and RAT-191) as evidence.
