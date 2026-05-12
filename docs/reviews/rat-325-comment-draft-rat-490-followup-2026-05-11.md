RAT-490 follow-up complete (repository-layer appeal persistence/enforcement).

What was fixed:
- `closeAppeal` now resolves persisted appeals via repository lookup (`getAppealById`) instead of in-memory-only state.
- `openAppeal` now routes to repository `createAppeal` and maps repository guard failures to the existing API contract:
  - `appeal_already_open`
  - `appeal_resume_required`
  - `appeal_cooldown_active`
- Added DB-level unique partial index in postgres/sqlite migrations to enforce single active appeal per review:
  - `idx_review_appeals_single_open` on `(review_id) where status='queued'`.

Verification:
- `node --test server/tests/sqliteIntegration.test.js server/tests/reviewService.test.js`
- Result: PASS (34 tests, 0 failures).

Residual risks:
- Postgres cooldown enforcement is repository-side but not lock-serialized per review; concurrent reopen attempts are still prevented from creating multiple active appeals by DB unique index, but the second request may fail as `appeal_already_open` after the first insert rather than `appeal_cooldown_active` depending on timing.
