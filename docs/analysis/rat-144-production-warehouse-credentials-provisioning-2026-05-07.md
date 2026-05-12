# RAT-144 Production Warehouse Credential Provisioning Contract

Date: 2026-05-07 (ART)  
Owner: Data Analyst (`d5f037cd-6a4f-485b-b342-4f94fa25c06c`)  
Issue: RAT-144  
Dependent execution: RAT-142

## Objective

Provision production warehouse credentials into the Paperclip issue workspace runtime so RAT-142 can execute day-7 KPI SQL (`analysis/sql/rat-39-cs-dashboard-metrics.sql`) and publish immutable KPI deltas.

## Goal Gate (OKR Alignment)

- OKR linkage required: this credential path directly enables the quarterly KPI reliability objective by unblocking day-7 metric publication for CEO dashboard inputs.
- Current issue metadata has no `goalId`; add explicit goal binding in board triage if this remains a recurring analytics dependency.

## Required Runtime Credentials

Provide one of these secure patterns to the RAT workspace runtime:

1. Standard PG env vars:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
2. Single DSN:
   - `DATABASE_URL` (PostgreSQL URI with least-privilege read role)

Security constraints:

- Do not commit secrets to repo files.
- Inject via workspace/runtime secret manager only.
- Scope role to read-only analytics schemas required by RAT-39 SQL.
- Set secret rotation window and owner in infra inventory.

## Minimal Verification (No Secret Disclosure)

After credential injection, run:

```bash
psql -Atqc "select current_user, current_database(), now();"
psql -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
```

Expected acceptance criteria:

- First command succeeds and returns user/db/timestamp.
- RAT-39 SQL completes without auth/connection errors.
- Result snapshot is posted in RAT-142 with baseline, day-7 value, delta abs/rel, guardrail state, and ART timestamp.

## Board Escalation Gate

If credentials are not provisioned within the next operating cycle, escalate to Board because KPI latency introduces revenue/churn decision risk in CEO reporting.

## Unblock Owner + Immediate Action

- Owner: CTO / Infra
- Action now:
  - Inject production warehouse read credentials into this issue runtime.
  - Confirm by posting non-sensitive verification output (`current_user`, `current_database`, timestamp only).
  - Wake assignee to execute RAT-142 snapshot publication immediately.

## Reactivation Check (RAT-41 Sweep)

Reactivation comment: `0c98f049-adc2-49a9-877f-43e64e3bde13`  
Checked at (UTC): `2026-05-07T20:04:12Z`+

Verification in this heartbeat:

```bash
env | rg '^(PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|DATABASE_URL)='
psql -Atqc "select now();"
psql -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
```

Observed state:

- No warehouse credential env vars are present in runtime.
- `psql` auth fails with `fe_sendauth: no password supplied`.
- RAT-142 execution remains blocked pending secret injection.

## Board Credential Follow-up (Comment `e5c4cec2-7260-4840-9180-335f5ffee992`)

Checked at (UTC): `2026-05-07T20:12:26Z`

Board supplied a `DATABASE_URL` value. Connectivity verification results:

```bash
psql 'postgresql://***' -Atqc "select now();"
# 2026-05-07 20:12:26.795839+00
```

Warehouse auth/connectivity is now working. However, RAT-142 source SQL still fails in this database:

```bash
psql 'postgresql://***' -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
# ERROR: relation "events" does not exist
```

Interpretation:

- Secret injection blocker is cleared.
- Execution blocker moved to data contract mismatch (expected table `events` absent in target DB/schema).

Required unblock owner/action (updated):

- Owner: CTO / Data Platform
- Action: provide the correct production warehouse/database/schema for RAT-39 KPI SQL (or equivalent compatibility view), then re-run validation and wake assignee.
