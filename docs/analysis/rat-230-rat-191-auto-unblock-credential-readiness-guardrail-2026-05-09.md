# RAT-230 RAT-191 Auto-Unblock Credential Readiness Guardrail (2026-05-09)

Issue: RAT-230  
Scope target: RAT-191 unblock policy hardening

## Problem

RAT-191 can be incorrectly auto-unblocked by dependency-only signals when runtime warehouse credentials are still absent. This causes reopen churn and false readiness.

## Guardrail Decision

RAT-191 may transition out of `blocked` only when executable runtime evidence is present from:

```bash
tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh
```

Allowed unblock evidence:
- Exit code `0`
- Output `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY`
- Output `RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:database_url` or `RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:pg_tuple`

Required blocked evidence:
- Exit code `2`
- Output `RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING`

## Implementation Artifact

- `tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh`

The guard command verifies either:
1. `DATABASE_URL` is set, or
2. Full PostgreSQL tuple exists: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.

## Operational Rule

If a sweep or lifecycle process sees dependency resolution (`deps=0`) but no fresh passing guard output (including the RAT-191 evidence marker), RAT-191 remains `blocked`.

## Thread Update Template

```text
RAT-230 guardrail update (2026-05-09):

Implemented RAT-191 unblock gate requiring runtime credential-readiness evidence.

Guard command:
- tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh

Decision rule:
- Unblock allowed only on:
  - RAT_191_RUNTIME_WAREHOUSE_CREDS_READY
  - Exit 0
- Otherwise keep RAT-191 blocked:
  - RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
  - Exit 2

Unblock owner/action:
- Owner: CTO / Data Platform
- Action: inject runtime warehouse credentials (`DATABASE_URL` or full `PG*`) and rerun guard until READY.
```
