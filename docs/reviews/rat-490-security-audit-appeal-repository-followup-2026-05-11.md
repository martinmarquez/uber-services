# RAT-490 Security Audit: Repository-Layer Appeal State Enforcement (2026-05-11)

## Scope
Follow-up on RAT-325 hardening to ensure appeal state and cooldown enforcement survive service restarts and multi-instance operation.

## Finding
`closeAppeal` previously resolved appeals from in-memory state (`this.appeals`) only. After process restart, persisted open appeals could become uncloseable (`appeal_not_found`), creating a policy-enforcement gap and inconsistent moderation outcomes.

Risk classification: High (integrity/control bypass by runtime topology).

## Remediation
- `ReviewService.closeAppeal` now resolves appeals through repository-backed lookup (`getAppealById`) when available.
- `ReviewService.openAppeal` now uses repository `createAppeal` when available, with repository-originated guard errors mapped to existing API contract codes:
  - `appeal_already_open`
  - `appeal_resume_required`
  - `appeal_cooldown_active`
- Added `createAppeal` and `getAppealById` to both repository adapters:
  - `SqliteReviewRepository`
  - `PostgresReviewRepository`
- Added DB-level single-active-appeal constraint in both migration tracks:
  - partial unique index `idx_review_appeals_single_open` on `(review_id) where status='queued'`
- Added restart-focused sqlite integration test to validate:
  - appeal opened in instance A can be closed in instance B,
  - cooldown remains enforced from persisted `closedAt`.

## Verification
Executed:
- `node --test server/tests/sqliteIntegration.test.js server/tests/reviewService.test.js`

Result:
- PASS (`34` tests, `0` failures)

## Security Verdict
Repository-layer persistence/enforcement gap for appeals is addressed for current storage adapters. Keep PR blocked if equivalent repository lookup is absent in any new adapter.

## Handoff Note (2026-05-11)
State-correction sweep RAT-556 moved the issue to `todo` because no active execution handle existed for >2h. This was operational status drift only; no new technical blocker or regression was identified in the RAT-490 implementation.

Re-checkout action for assignee:
- Resume from `todo`
- Post RAT-325 verification/residual-risk comment using:
  - `docs/reviews/rat-325-comment-draft-rat-490-followup-2026-05-11.md`
- Close RAT-490 as `done` after comment is posted.
