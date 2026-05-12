# RAT-444 runtime gate credentials resolution (2026-05-11)

## Scope
Resolve RAT-157 runtime gate blockers observed in RAT-444:
- `RAT_301_ACCEPTANCE_FAIL:psql_unexecutable` / creds gating instability in clean shells.
- `RAT_157_RUNTIME_CREDS_MISSING:warehouse,bi`.

## Implementation
- Updated guardrails to auto-load runtime env from `$AGENT_HOME/.db-env` when available:
  - `tools/guardrails/check-rat-301-acceptance.sh`
  - `tools/guardrails/check-rat-157-runtime-credentials.sh`
  - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
- Added BI runtime credential key to runtime env file:
  - `$AGENT_HOME/.db-env` now includes `BI_TOKEN`.

## Verification (clean shell, no manual `source`)
```bash
bash tools/guardrails/check-rat-301-acceptance.sh; echo EXIT:$?
bash tools/guardrails/check-rat-157-runtime-credentials.sh; echo EXIT:$?
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh; echo EXIT:$?
```

```text
RAT_301_ACCEPTANCE_PASS
EXIT:0
RAT_157_RUNTIME_CREDS_READY
EXIT:0
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface
EXIT:2
```

## Decision
- RAT-444 objective is satisfied for runtime executable path + warehouse/BI credential injection gates.
- Residual failure is not credentials/path; it is RAT-39 source-surface binding (`public.events` + `public.support_tickets`) and should stay in the dependency lane.

## Revalidation checkpoint (2026-05-11T09:47:11Z)

Workspace: `d5f037cd-6a4f-485b-b342-4f94fa25c06c` (Data Analyst)

Action taken:
- Restored `${AGENT_HOME}/.db-env` in this workspace with warehouse runtime vars (`DATABASE_URL` + `PG*`) and BI runtime var (`BI_TOKEN`), file mode `600`.

Command outputs:
```bash
$ bash tools/guardrails/check-rat-301-acceptance.sh
RAT_301_ACCEPTANCE_PASS

$ bash tools/guardrails/check-rat-157-runtime-credentials.sh
RAT_157_RUNTIME_CREDS_READY

$ bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface
```

Warehouse probe:
```bash
$ psql -Atqc "select current_database(), current_user, (to_regclass('public.events') is not null)::int, (to_regclass('public.support_tickets') is not null)::int;"
neondb|neondb_owner|0|0
```

Decision / unblock sequence:
- RAT-444 original target (`psql` executable + runtime warehouse/BI creds) is satisfied in this workspace.
- Remaining blocker is upstream schema surface provisioning for RAT-39 source tables (`public.events`, `public.support_tickets`) in the active warehouse.
- Unblock owner: Backend/Data Platform (provision or map RAT-39 canonical source surface), then rerun `check-rat-157-warehouse-sql-runtime-path.sh` until `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`.
