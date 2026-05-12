# RAT-306 RAT-28.1 24h Data Extract Status (2026-05-10)

Issue: [RAT-306](/RAT/issues/RAT-306)

## Heartbeat outcome
- Built executable SQL extract for RAT-28 QA closure gates:
  - `analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql`
- Runtime execution is blocked in this heartbeat due to missing warehouse credentials.

## Runtime guard evidence
Command run:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

Interpretation:
- Current runtime does not have required production warehouse connectivity (`DATABASE_URL` or complete `PGHOST`+`PGPORT`+`PGDATABASE`+`PGUSER`+`PGPASSWORD`).
- No local fallback is valid for RAT-28 QA closure because local SQLite has `0` rows in `review_events` and no `analytics_events` telemetry stream.

## Next action to unblock RAT-306
Unblock owner: CTO / Data Platform

Required action:
1. Inject runtime warehouse credentials into this issue runtime.
2. Execute:

```bash
psql "$DATABASE_URL" -f analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql
```

3. Attach result table to [RAT-306](/RAT/issues/RAT-306) and rerun RAT-28 QA readout update (`PASS`/`FAIL`/`HOLD`).

## Gate mapping delivered by SQL
- `variant_counts`: assignment counts and split% by `control`/`treatment`.
- `srm_check`: chi-square stat + p-value approximation and SRM gate (`ok`/`srm_alert`).
- `duplicate_check`: duplicate assignment rate and multi-variant contamination rate.
- `funnel_integrity`: orphan conversion rate (conversion without matching assignment).
