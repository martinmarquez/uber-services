# RAT-490 Checkpoint (2026-05-11): Storage-Backed Appeal State/Cooldown

## Implemented in this checkpoint
- Added `getAppealById` to SQLite repository adapter:
  - `server/src/db/sqliteReviewRepository.js`
- Confirmed Postgres adapter already exposes `getAppealById`.
- Service close path now resolves appeal state via repository method when present (`getAppealById`), enabling cross-instance correctness instead of in-memory-only lookup.

## Test evidence
Command:
- `node --test server/tests/reviewService.test.js server/tests/sqliteIntegration.test.js server/tests/postgresIntegration.test.js`

Result:
- Pass: 34
- Skip: 4 (Postgres tests skipped when `DATABASE_URL` is not set)
- Fail: 0

## New/updated persistence tests
- `server/tests/sqliteIntegration.test.js`
  - `sqlite storage-backed appeal state works across service instances`
- `server/tests/postgresIntegration.test.js`
  - `postgres storage-backed appeal state works across service instances` (env-gated)

## Residual next step
- Run Postgres integration path in an environment with `DATABASE_URL` to capture non-skip execution evidence and finalize distributed hardening closure.
