# RAT-321 Backend Progress - 2026-05-11

## Concrete implementation completed
- Wired repository persistence for lifecycle entities in both adapters:
  - `review_reports`
  - `review_responses`
  - `review_appeals`
  - `review_tags`
  - `review_aggregates` (recompute on lifecycle writes)
- Added moderation-side tag persistence from decision `reasonCode`.
- Added HTTP error contract mapping:
  - invalid moderation lifecycle transitions now return `409` with `error.code = INVALID_STATE_TRANSITION`.
  - report idempotency unique collisions now return conflict envelope (`CONFLICT`) with detail `idempotency_key_conflict`.

## Tests added/updated
- `server/tests/sqliteIntegration.test.js`
  - persistence wiring coverage for report + moderation tag + aggregates recomputation.
- `server/tests/httpServer.test.js`
  - API contract coverage for `INVALID_STATE_TRANSITION` on direct invalid moderation move.

## Verification
- Command:
  - `node --test server/tests/sqliteIntegration.test.js server/tests/reviewService.test.js server/tests/httpServer.test.js`
- Result:
  - `49` tests passed, `0` failed.

## Commit
- `15d61d8` RAT-321: wire lifecycle persistence and state-transition error mapping

## Next action
- Add Postgres-backed integration assertions for persisted `review_tags` + `review_aggregates` + `review_reports` through `ReviewService` flows (not direct SQL), keeping parity with current SQLite wiring tests.

## Resume note (state correction sweep)
- Referenced comment `8b2a15dd-f8a2-4fb5-aa8c-0662cd427b2b`: prior run-handle drift moved issue to `todo` in sweep `RAT-556`.
- Current heartbeat resumed with active harness checkout and produced concrete commit `72384ae`.

## Additional verification in this heartbeat
- Command:
  - `node --test server/tests/postgresIntegration.test.js`
- Result:
  - Test file executes cleanly; tests are skipped when `DATABASE_URL` is unset.

## Updated next action
- Execute the same Postgres integration suite with runtime `DATABASE_URL` to produce non-skipped evidence for appeal/report/tag/aggregate persistence parity.

## Postgres runtime evidence (non-skipped)
- Ran integration suite against real `DATABASE_URL` using isolated Docker Postgres instance.
- Runtime connection used during test execution:
  - `postgres://postgres:postgres@127.0.0.1:55432/rat321`
- Command:
  - `DATABASE_URL='postgres://postgres:postgres@127.0.0.1:55432/rat321' node --test server/tests/postgresIntegration.test.js`
- Result:
  - `4` tests passed, `0` skipped, `0` failed.

## Defects found and fixed during evidence run
1. Foreign-key setup gap in Postgres integration tests (`reviews.service_request_id` FK):
- Added test seeding helper to insert `providers` + `service_requests` before `createReview` flows.

2. UUID compatibility bug for lifecycle entity IDs in Postgres-backed flows:
- Updated `randomId()` to emit UUIDs for `rep`, `apl`, and `resp` entities (in addition to `rev` and `evt`).
