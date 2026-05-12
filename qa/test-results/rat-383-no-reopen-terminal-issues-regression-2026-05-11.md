# RAT-383 QA Regression Readout: No Auto-Reopen on Terminal Issues (2026-05-11)

## Objective
Validate that issues in terminal states (`done` / `cancelled`) are not automatically reopened without explicit resume intent.

## Scope Executed
1. Regression evidence replay review:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `qa/test-results/rat-363-auto-reopen-loop-revalidation-2026-05-11.md`

2. Automated backend smoke in current workspace:
- Command: `node --test server/tests/*.test.js`
- Result: `pass=69 fail=0 skipped=3`

## Quality Gate Verdict
- PASS (policy/regression replay): terminal-state guard is documented and validated in existing QA artifacts.
- RISK (automated coverage locality): this repository's executable backend suite does not include issue-lifecycle tests for `done/cancelled + resume:true` transitions; coverage is indirect via artifact replay.

## Release Gate Decision
- CONDITIONAL PASS for RAT-383 objective based on existing regression evidence.
- Follow-up required: add direct executable tests for issue lifecycle transitions in the platform module that owns issue state machine.

## Next Action
- Owner: Backend platform issue-lifecycle maintainer.
- Action: add automated tests proving:
  1. terminal issue remains terminal on automation/checkout without `resume:true`
  2. terminal issue can resume only with explicit `resume:true`
  3. no-delta status-change wake cannot trigger reopen churn

## Heartbeat Revalidation (2026-05-11)

- Trigger: `process_lost_retry` for RAT-383.
- Command rerun: `node --test server/tests/*.test.js`
- Result: `pass=71 fail=0 skipped=3`.
- Key guard assertion confirmed:
  - `POST /api/v1/reviews/:reviewId/appeals blocks reopen unless resume=true` (pass)

### QA Gate Update

- Regression gate for implemented `resume` guard remains **PASS** in this workspace.
- Residual risk remains unchanged: no direct executable tests for Paperclip issue-lifecycle terminal states (`done`/`cancelled`) in this repo; evidence for that portion is still artifact-based.
