# RAT-356 BI runtime creds + RAT-39 source-surface binding (2026-05-11)

## Scope
Validate whether this runtime can satisfy RAT-356 closure criteria:
1. BI + warehouse runtime credentials available.
2. SQL runtime path executes against the correct RAT-39 source surface.

## Commands Executed

```bash
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh; echo EXIT_CODE:$?
```

## Results

```text
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface
EXIT_CODE:2
```

- Warehouse runtime credentials are present and connectivity is functional.
- RAT-39 source-surface presence gate failed (`public.events`/`public.support_tickets` not both present in bound runtime surface).

## Decision
RAT-356 cannot be closed in this heartbeat; dependency remains execution-blocked at source-surface binding.

## Unblock Owner And Action
- Owner: Data/Analytics Engineering
  - Provision BI runtime credentials and pass `tools/guardrails/check-rat-157-runtime-credentials.sh`.
- Owner: Data Platform
  - Bind runtime to canonical RAT-39 warehouse schema (or provide canonical mapping + guardrail alignment).
- Verification required after provisioning:
  - `tools/guardrails/check-rat-157-runtime-credentials.sh`
  - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
