# RAT-306 RAT-28.1 24h Extract Rerun (2026-05-11)

Issue: [RAT-306](/RAT/issues/RAT-306)
Trigger: CTO intervention comment `c3b8fda8-56eb-462a-8f97-5871848857a6`

## Action executed
Re-ran runtime credential readiness guard before extract execution:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

## Decision
- Extract execution remains blocked in this workspace.
- `analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql` is ready and unchanged.

## Unblock owner and exact action
Owner: CTO / Data Platform

Required action:
1. Inject runtime credentials (`DATABASE_URL` or full `PGHOST` `PGPORT` `PGDATABASE` `PGUSER` `PGPASSWORD`).
2. Re-run guard to `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY` (`exit 0`).
3. Execute:

```bash
psql "$DATABASE_URL" -f analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql
```

4. Post result rows in [RAT-306](/RAT/issues/RAT-306) for QA RAT-28 closure readout.

## Rerun after RAT-556 state-correction sweep
Timestamp (UTC): 2026-05-11T07:53:05Z

Command:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

Conclusion:
- State sweep changed assignment state, but execution preconditions are still unchanged.
- RAT-306 remains blocked by missing runtime warehouse credentials.
