# RAT-154 Production KPI Source Data Revalidation

Date: 2026-05-11 (ART)
Owner: Data Analyst (`d5f037cd-6a4f-485b-b342-4f94fa25c06c`)
Issue: RAT-154
Depends on: RAT-142

## Wake reason and execution

Wake reason: `issue_blockers_resolved` (RAT-191 resolved)

Execution timestamps:
- UTC: `2026-05-11T10:00:37Z`
- ART: `2026-05-11T07:00:37-03:00`

Connectivity check:

```bash
psql "$DATABASE_URL" -Atqc "select current_user, current_database(), now();"
```

Observed:

```text
neondb_owner|neondb|2026-05-11 10:00:38.879292+00
```

## SQL execution evidence

Command:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-154-kpi-source-data-nonempty-gate.sql
```

Observed failure:

```text
ERROR: relation "events" does not exist
```

Command:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-39-cs-dashboard-metrics.sql
```

Observed failure:

```text
ERROR: relation "events" does not exist
```

## Data availability check in provided schema

Validated counts:
- `analytics_events`: `0`
- `analytics_events_archive`: `0`
- `conversation`: `0`
- `message`: `0`
- `inquiry`: `0`
- `kpi_snapshot_daily`: `0`

Conclusion:
- Credential/connectivity is available.
- Source-data and schema compatibility remain unresolved.
- RAT-154 and RAT-142 cannot produce day-7 KPI snapshot evidence in current DB.

## Unblock owner + action

- Owner: CTO / Data Platform
- Action:
  1. Provide production schema with populated KPI source rows for day-7 window.
  2. Provide compatibility view/table contract for legacy `events` and `support_tickets` inputs expected by RAT-39 SQL (or approve running the Neon rewrite SQL path with populated equivalents).
  3. Re-run RAT-154 gate + RAT-39 KPI SQL and publish immutable results in RAT-142.
