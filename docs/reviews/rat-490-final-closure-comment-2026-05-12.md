RAT-490 final closure summary (RAT-325 follow-up)

Status: complete.

Implemented
- Storage-backed enforcement for appeal open/reopen guards at repository layer.
- Single-active-appeal invariant at DB layer (partial unique index).
- Repository-backed close path integrity preserved across service restarts/multi-instance flows.
- Existing API error contract preserved (`appeal_already_open`, `appeal_resume_required`, `appeal_cooldown_active`).

Verification summary
- Targeted backend tests executed in prior run:
  - `node --test server/tests/reviewService.test.js server/tests/sqliteIntegration.test.js`
- Result: PASS (`34` tests, `0` failures).

Residual risk
- Low: Under high-concurrency Postgres reopen races, second request may surface `appeal_already_open` (unique index enforcement) instead of `appeal_cooldown_active` depending on timing. Security invariants remain enforced (no duplicate active appeals).

Closure decision
- RAT-490 is technically complete and ready to close as `done`.
