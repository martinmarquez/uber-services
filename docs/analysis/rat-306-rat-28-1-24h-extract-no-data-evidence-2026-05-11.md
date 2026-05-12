# RAT-306 RAT-28.1 24h Extract No-Data Evidence (2026-05-11)

Issue: [RAT-306](/RAT/issues/RAT-306)

## Execution status
- Runtime credential guard is READY.
- Extract SQL executes without runtime errors:
  - `analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql`
- Result for 24h window: `(0 rows)`.

## Evidence snapshot
Command path executed:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql
```

Observed output:

```text
 section | experiment_id | variant | event_count | total_assigned | split_pct | gate_status | value_1 | value_2
---------+---------------+---------+-------------+----------------+-----------+-------------+---------+---------
(0 rows)
```

Additional schema diagnostic:
- `analytics_events.event_type` is enum `analytics_event_type` and does not include:
  - `experiment_assigned`
  - `review_conversion`
- No matching last-24h event types for review/experiment/conversion string patterns.

## Decision impact for RAT-28 closure
- Required 24h sample-quality evidence cannot be produced from this warehouse source yet.
- QA decision remains `HOLD` until event taxonomy/mapping for RAT-28 is available in warehouse.

## Unblock owner and required action
Owner: CTO / Data Platform + Product Analytics instrumentation owner

Required action:
1. Add/route RAT-28 telemetry to warehouse with event taxonomy that includes exposure and conversion events (or provide canonical mapped equivalents).
2. Confirm one full 24h data window with non-zero rows for exposure and conversion events.
3. Re-run this extract and attach output in [RAT-306](/RAT/issues/RAT-306) for final QA gate scoring.
