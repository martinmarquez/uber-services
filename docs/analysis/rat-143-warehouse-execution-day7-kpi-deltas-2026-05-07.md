# RAT-143 Warehouse SQL Execution + Day-7 KPI Deltas (Confusion/Dropoff)

Date: 2026-05-07 (ART)
Owner: CTO
Issue: RAT-143

## Scope

Execute warehouse SQL and publish day-7 KPI deltas for:

- `support_tickets_review_status_confusion`
- `review_flow_dropoff_after_star_select`

Source SQL (locked): `analysis/sql/rat-39-cs-dashboard-metrics.sql` (blocks 2 and 3).

## Execution Attempt (this heartbeat)

Command:

```bash
psql -Atqc "select now();"
```

Observed:

- Prompted for password.
- Failed with: `connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied`.

Execution timestamp: 2026-05-07 15:48:16 -03 (`America/Argentina/Buenos_Aires`).

## Execution Attempt (resume after `issue_blockers_resolved`)

Trigger context:

- `RAT-144` moved to `done` (credential provisioning issue marked resolved).

Command:

```bash
psql -Atqc "select now(), current_user, current_database();"
```

Observed:

- Prompted for password.
- Failed with: `connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied`.

Execution timestamp: 2026-05-07 17:17:27 -03 (`America/Argentina/Buenos_Aires`).

Conclusion:

- Blocker resolution is not yet effective in this execution runtime.
- Production credential propagation remains incomplete for this agent context.

## Execution Attempt (2026-05-09 after RAT-151 completion)

Trigger context:

- `RAT-151` marked `done` with non-interactive auth evidence.

Connectivity verification:

```bash
which psql
psql --version
psql -Atqc "select now(), current_user, current_database();" </dev/null
```

Observed:

- Connectivity/auth now works non-interactively.
- Runtime connects as `neondb_owner` on database `neondb`.

Warehouse execution checks:

```sql
select min(date(event_ts_utc)), max(date(event_ts_utc)), count(*) from events;
select min(date(created_at_utc)), max(date(created_at_utc)), count(*) from support_tickets;
```

Observed:

- `ERROR: relation "events" does not exist`
- `ERROR: relation "support_tickets" does not exist`

Schema inventory confirms the connected database exposes app-domain tables (e.g., `public.property`, `public.lead`, `public.analytics_events`) but not the RAT-39 source tables required for KPI extraction.

Execution timestamp: 2026-05-09 22:22:53 -03 (`America/Argentina/Buenos_Aires`).

Conclusion:

- Auth blocker is solved, but the runtime is pointed at the wrong data surface for RAT-39 extraction.
- New blocker: provide access/path to the analytics warehouse (or schema) where `events` and `support_tickets` for RAT-39 live.

## Blocker

- No production warehouse credentials available in this runtime.
- No configured secure connection path (`PGHOST`/`PGUSER`/`PGPASSWORD`/`DATABASE_URL`) for execution.

## Unblock Owner + Action

- Owner: Data/Analytics Engineering
- Action:
  1. Execute RAT-39 SQL in production warehouse.
  2. Publish immutable day-7 KPI delta snapshot in RAT-143 thread with:
     - KPI
     - baseline 7d
     - day-7 value (or d1-d7 average)
     - delta abs (pp)
     - delta rel
     - guardrail state
     - execution timestamp
     - data cutoff timezone: `America/Argentina/Buenos_Aires`

## Output Template

| KPI | Baseline 7d | Day-7 value | Delta abs (pp) | Delta rel | Guardrail state |
|---|---:|---:|---:|---:|---|
| support_tickets_review_status_confusion |  |  |  |  |  |
| review_flow_dropoff_after_star_select |  |  |  |  |  |

## Execution Attempt (2026-05-11 after ownership reroute to Data Analyst)

Trigger context:

- Human comment `1783131f-a1d4-4d1f-8f92-6b7b2d4710c2` moved ownership to Data Analyst and requested first execution update within one heartbeat.

Commands:

```bash
psql -Atqc "select now() at time zone 'America/Argentina/Buenos_Aires', current_user, current_database();" </dev/null
```

Observed:

- Prompted for password (`Password for user martinmarquez:`).
- Failed with: `connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied`.

Execution timestamp: 2026-05-11 05:36:06 -03 (`America/Argentina/Buenos_Aires`).

Conclusion:

- Warehouse extraction remains blocked in this runtime by missing non-interactive credential path.
- Per wake contract, issue should stay `blocked` and explicitly reference unblock owner/action.

Updated unblock owner/action:

- Owner: Data/Analytics Engineering.
- Action:
  1. Re-enable non-interactive warehouse credentials for this execution runtime (`PG*`/`DATABASE_URL` or equivalent secure auth path).
  2. Confirm target data surface includes `events` and `support_tickets` required by RAT-39 blocks 2-3 (or provide canonical mapped equivalents).
  3. Notify in [RAT-143](/RAT/issues/RAT-143) thread so extraction can be rerun in the next heartbeat.
