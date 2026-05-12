# RAT-409 Postgres Parity Failure Readout (2026-05-11)

Issue: RAT-409  
Parent: [RAT-49](/RAT/issues/RAT-49)

## Execution Context

- Docker became available in this heartbeat.
- Postgres container discovered and reachable:
  - container: `corredor-postgres`
  - URL: `postgresql://corredor:corredor@localhost:5433/corredor`
- Command executed:

```bash
DATABASE_URL='postgresql://corredor:corredor@localhost:5433/corredor' \
node --test server/tests/postgresIntegration.test.js
```

## Result Summary

- `tests 4`
- `pass 2`
- `fail 2`
- `skipped 0`

Raw output:

- `qa/test-results/rat-409-postgres-parity-raw-output-2026-05-11.txt`

## Failures

1. `postgres migration runner + review persistence parity`
- Failure: foreign key violation on `reviews.service_request_id` (`reviews_service_request_fk`).
- Detail: `service_request_id` used in test insert does not exist in `service_requests`.

2. `postgres storage-backed appeal state works across service instances`
- Failure: invalid UUID input for appeal id.
- Detail: value `'apl_f1fbfe35-a10a-4838-9b2a-47b48957c813'::uuid` is not valid UUID syntax for Postgres UUID column.

## QA Gate Decision

- Runtime unblock is complete (non-skipped Postgres execution achieved).
- Quality gate remains **blocked** due to functional failures (2 failing integration tests).
- Release sign-off is denied until defects are fixed and parity re-run passes with `fail 0`.

## Required Unblock

Owner: Backend Engineering (with QA revalidation after fix)

Action:

1. Fix failing Postgres parity paths in repository/service/test setup.
2. Re-run `server/tests/postgresIntegration.test.js` against Postgres with non-skipped output.
3. Attach passing evidence (`fail 0`) to [RAT-49](/RAT/issues/RAT-49) and [RAT-409](/RAT/issues/RAT-409) for QA sign-off.
