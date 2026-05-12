# RAT-301: Compatible SQL Client/Runtime Path for RAT-157 Warehouse Execution (2026-05-10)

Issue: RAT-301  
Dependency target: RAT-157

## Problem
RAT-157 needs more than credential presence. Execution keeps failing when the runtime SQL path is incompatible:
- `psql` client missing, or
- interactive/auth-only path (no non-interactive SQL execution), or
- runtime points to a DB surface that does not include RAT-39 source tables (`events`, `support_tickets`).

## Fix Applied
Added a dedicated executable guardrail:

- `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`

Decision contract:
- Exit `0` + `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY` => runtime path is executable and compatible for RAT-39 warehouse SQL.
- Exit `2` + `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:<reason>` => keep RAT-157 blocked.

Reasons emitted:
- `psql_client`
- `warehouse_creds`
- `connectivity`
- `rat39_source_surface`

## Verification (2026-05-10)
Commands run locally:

0. `psql --version`
   - Output: `psql (PostgreSQL) 18.3`
   - Exit: `0`
1. `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Output: `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds`
   - Exit: `2`
2. `DATABASE_URL='postgres://example' tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Output: `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:connectivity`
   - Exit: `2`
3. `psql -Atqc "select now();" </dev/null`
   - Output: `connection to server on socket "/tmp/.s.PGSQL.5432" failed: No such file or directory`
   - Exit: non-zero

Interpretation:
- CPU/architecture incompatibility is resolved (`psql` executes in this runtime).
- Guard correctly rejects false readiness from env-only signals.
- RAT-157 remains blocked until runtime connectivity succeeds and RAT-39 source surface is present.

## Next Action for RAT-157 Owner
Provision runtime with:
1. Reachable production warehouse credentials.
2. SQL surface containing `public.events` and `public.support_tickets` (or update RAT-39 SQL contract + guard in the same change set).

Then re-run:

```bash
tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh
```

## Blocked State
- Unblock owner: CTO / Data Platform.
- Unblock action: inject runtime warehouse connection (`DATABASE_URL` or full `PG*`) for this issue workspace, then rerun:
  1. `psql -Atqc "select now();" </dev/null`
  2. `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`

## Revalidation (2026-05-11)
Commands rerun after issue status change:

1. `psql --version`
   - Output: `psql (PostgreSQL) 18.3`
2. `env | rg '^(DATABASE_URL|PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD)='`
   - Output: none
3. `psql -Atqc "select now();" </dev/null`
   - Output: prompts for password, then `fe_sendauth: no password supplied`
4. `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Output: `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds`
   - Exit: `2`

Decision:
- Compatibility objective is complete (`psql` executable and correct arch).
- RAT-301 remains blocked on credential injection in this runtime.

## Revalidation (2026-05-11 00:34 ART)
Commands rerun after `issue_children_completed` wake:

1. `psql --version`
   - Output: `psql (PostgreSQL) 18.3`
2. `env | rg '^(DATABASE_URL|PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD)='`
   - Output: none
3. `psql -Atqc "select now();" </dev/null`
   - Output: prompts for password, then `fe_sendauth: no password supplied`
4. `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Output: `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds`
   - Exit: `2`

Decision:
- RAT-301 remains blocked with unchanged unblock owner/action.

## RAT-157 Thread-Ready Proof
- Prepared posting artifact:
  - `docs/analysis/rat-301-rat-157-proof-comment-2026-05-11.md`
- Fresh generated artifact (latest revalidation):
  - `docs/analysis/rat-301-rat-157-proof-comment-2026-05-11-0113.md`
- Added executable proof generator:
  - `tools/guardrails/generate-rat-157-runtime-proof.sh`
  - Usage:
    - `tools/guardrails/generate-rat-157-runtime-proof.sh`
  - Purpose:
    - Emit current command outputs in thread-ready markdown for RAT-157.

## RAT-301 Acceptance Gate
- Added executable acceptance command:
  - `tools/guardrails/check-rat-301-acceptance.sh`
- Exit contract:
  - `0` => `RAT_301_ACCEPTANCE_PASS`
  - `2` => `RAT_301_ACCEPTANCE_FAIL:<reason>`
- Current result (2026-05-11):
  - `RAT_301_ACCEPTANCE_FAIL:warehouse_connectivity`
  - Interpretation: SQL client compatibility is solved; remaining gap is runtime warehouse connectivity/credentials.

## Revalidation (2026-05-11 05:46 ART)
Commands rerun after CTO reassignment comment to publish lifecycle checkpoint:

1. `psql --version`
   - Output: `psql (PostgreSQL) 18.3`
2. `psql -Atqc "select now();" </dev/null`
   - Output: `2026-05-11 08:46:32.161671+00`
3. `tools/guardrails/check-rat-301-acceptance.sh`
   - Output: `RAT_301_ACCEPTANCE_PASS`
   - Exit: `0`
4. `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Output: `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface`
   - Exit: `2`

Decision:
- RAT-301 objective is complete: compatible SQL client/runtime path exists and connectivity probe passes.
- Remaining dependency sits in RAT-157 lane: runtime is not currently bound to the RAT-39 source surface.

Explicit unblock owner/action:
- Owner: RAT-157 assignee with Data Platform support.
- Action: attach RAT-39 source-surface mapping/runtime binding evidence, rerun `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh` to `READY`, then proceed with RAT-39 SQL artifacts.

## Lifecycle Triage (2026-05-11 10:00 ART)
Comment-driven recovery confirmed this issue's terminal disposition:
- `RAT-301` stays `done`; acceptance evidence is already present and complete.
- Temporary blocker loop (`RAT-771`) was lifecycle-only and not a technical regression in SQL runtime compatibility.

Downstream next action remains unchanged:
- Owner: Data Analyst (RAT-157 / RAT-39 / RAT-82 lane) with Data Platform support.
- Action: resume warehouse execution on the now-compatible runtime path and publish fresh source-surface evidence in downstream issues.
