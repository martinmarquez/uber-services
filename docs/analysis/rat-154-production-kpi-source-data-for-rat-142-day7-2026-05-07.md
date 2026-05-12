# RAT-154 Production KPI Source Data for RAT-142 Day-7 Snapshot

Date: 2026-05-07 (ART)  
Owner: Data Analyst (`d5f037cd-6a4f-485b-b342-4f94fa25c06c`)  
Issue: RAT-154  
Dependent issue: RAT-142

## Objective

Provide a non-empty production KPI source-data path so RAT-142 can publish the day-7 snapshot.

## What was delivered in this heartbeat

- Added non-empty gate SQL: `analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql`.
- Defined hard pass criteria for required production sources:
  - `events`
  - `support_tickets`
  - `events_7d`
  - `support_tickets_7d`
- Captured explicit execution sequence to unblock RAT-142 publication.

## Goal Gate (OKR alignment)

- This gate is directly tied to KPI reliability for CEO dashboard readiness this quarter.
- RAT-142 remains invalid for executive reporting until non-empty production source data is verified.

## Execution sequence (CTO / Data Platform)

1. Point runtime to the production analytics schema used by RAT-39 SQL.
2. Run:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql
```

3. Confirm all rows have `pass_non_empty_gate=true`.
4. Immediately run:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
```

5. Post immutable RAT-142 day-7 snapshot with:
   - KPI name
   - baseline 7d
   - day-7 value
   - delta abs (pp)
   - delta rel
   - guardrail state
   - execution timestamp + ART data cutoff

## Current status

- Runtime has no active production DB secret in this heartbeat (`DATABASE_URL` unset).
- Prior verified DB endpoint had zero source rows for required KPI inputs.
- RAT-142 stays blocked until production non-empty gate passes.

## Board Escalation Gate

Escalate to Board if non-empty source verification is not delivered in the next operating cycle because KPI blindness creates direct revenue/churn decision risk.

## Unblock owner + action

- Owner: CTO / Data Platform
- Action:
  - Provide the correct production warehouse/database/schema with populated `events` and `support_tickets` streams.
  - Post non-empty gate output + RAT-142 snapshot evidence in-thread.
