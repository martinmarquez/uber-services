# RAT-352 heartbeat evidence (2026-05-11)

Timestamp (local): 2026-05-11
Issue: RAT-352
Wake comment: 006299d7-a595-4b8f-b918-a740991654b8

## What changed

Routing comment moved execution ownership to Data Analyst and requested immediate warehouse extract + KPI snapshot publication.

## Runtime verification executed

Commands run:

```bash
bash tools/guardrails/check-rat-157-runtime-credentials.sh
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh
psql --version
```

Observed outputs:

- `RAT_157_RUNTIME_CREDS_MISSING:warehouse,bi` (exit 2)
- `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds` (exit 2)
- `psql (PostgreSQL) 18.3 (Homebrew)`

## Decision

The requested warehouse extract + KPI snapshot path is still non-executable in this heartbeat because warehouse and BI runtime credentials are absent.

## Blocker owner/action

- Unblock owner: Data/Analytics Engineering + Data Platform (`RAT-356`)
- Required unblock action:
  1. Inject runtime warehouse credentials (`DATABASE_URL` or full `PG*`).
  2. Inject runtime BI credentials (`BI_*`/`LOOKER*`/`METABASE*`/`SUPERSET*`).
  3. Re-run both guardrails until READY.
  4. Wake Data Analyst to execute warehouse SQL extract and publish KPI artifact links.

## Next action after unblock

Run RAT-39 warehouse SQL extract path and publish query outputs + artifact links in-thread in the same heartbeat.

## Resume delta verification (blockers_resolved wake)

Timestamp (UTC): 2026-05-11T10:02:42Z
Wake reason: `issue_blockers_resolved`

### New runtime state

- Credentials gate now passes:
  - `RAT_157_RUNTIME_CREDS_READY` (exit 0)
- SQL client works:
  - `psql (PostgreSQL) 18.3 (Homebrew)`
- Warehouse runtime-path gate still fails on source binding:
  - `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface` (exit 2)

### Warehouse connection evidence

```text
current_database | current_user  | utc_now
neondb           | neondb_owner  | 2026-05-11 10:02:42.272068
```

RAT-39 source-surface probe:

```text
to_regclass('public.events') = null
to_regclass('public.support_tickets') = null
```

RAT-39 SQL execution attempt:

```text
psql:analysis/sql/rat-39-cs-dashboard-metrics.sql:56: ERROR:  relation "events" does not exist
LINE 11:   from events
```

### Decision

`RAT-352` remains blocked, but blocker shifted from credential injection to warehouse source-surface binding for RAT-39 SQL compatibility.

### Unblock owner/action

- Owner: Data Platform / Analytics Engineering (tracked on `RAT-356`)
- Action:
  1. Bind/provision RAT-39 source tables in the connected warehouse runtime (`public.events`, `public.support_tickets`) or provide compatible views.
  2. Re-run `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh` until `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`.
  3. Wake assignee to execute KPI extract and publish artifact links.

## Sweep-comment recheck (2026-05-11T21:17:03Z comment)

Acknowledged state-correction sweep comment `fe88ebe0-036b-4428-92a4-055ff509ec28` and performed immediate recheck.

- `RAT_157_RUNTIME_CREDS_READY` (exit 0)
- `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface` (exit 2)
- `to_regclass('public.events') = null`
- `to_regclass('public.support_tickets') = null`

Decision: lifecycle sweep did not change executable readiness; issue remains blocked on source-surface provisioning.
