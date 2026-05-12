# RAT-573 Heartbeat: admin bulk stale `in_progress` correction endpoint (conflict-safe)

Date: 2026-05-11
Issue: RAT-573
Wake reason: `run_liveness_continuation`

## Concrete action completed in this heartbeat

Added and executed a dedicated readiness gate + ownership probe for RAT-573:

1. `tools/guardrails/check-rat-573-readiness-gate.sh`
2. `tools/guardrails/check-rat-573-stale-inprogress-correction-surface.sh`

Durable evidence artifacts:

- `qa/test-results/rat-573-readiness-gate-2026-05-11.txt`
- `qa/test-results/rat-573-control-plane-surface-check-2026-05-11.txt`

## Execution results

From `rat-573-readiness-gate-2026-05-11.txt`:

- `gate_product_brief=yes`
- `gate_deploy_config=no`
- `RESULT=BLOCKED_MISSING_DEPLOY_CONFIG`
- `DETAIL=DEPLOY_CONFIG.md not found in current workspace`

From `rat-573-control-plane-surface-check-2026-05-11.txt`:

- `RESULT=BLOCKED_WRONG_REPO`
- `DETAIL=No issue lifecycle admin API signatures found in server/*`

## Verification performed

Commands executed:

- `find . -maxdepth 3 -type f -name 'DEPLOY_CONFIG.md' -o -name '*DEPLOY*CONFIG*.md'`
- `rg -n "\/api\/issues|activeRunId|executionRunId|issue_status_changed|checkout" server/src server/tests tools docs/analysis`
- `tools/guardrails/check-rat-573-readiness-gate.sh`
- `tools/guardrails/check-rat-573-stale-inprogress-correction-surface.sh`

Observed results:

1. `PRODUCT_BRIEF.md` exists (goal gate satisfied).
2. `DEPLOY_CONFIG.md` is missing (deployment strategy gate not satisfied in this workspace).
3. No executable `/api/issues` lifecycle handlers or issue status persistence module are present in `server/src`.
4. RAT-573 probes return deterministic blocked codes with reproducible output files.

## Impact

RAT-573 requires an admin mutation endpoint/job for stale issue lifecycle records (`in_progress` + `activeRunId=null` + `executionRunId=null`) with dry-run + atomic conflict-safe updates. Required ownership/runtime surfaces are absent in this checkout, so implementation cannot be safely delivered here.

## Blocker

- Blocked by:
  - missing `DEPLOY_CONFIG.md` in assigned workspace (deployment strategy state unavailable), and
  - missing control-plane lifecycle runtime repository/worktree containing `/api/issues` mutation handlers and issue status persistence.
- Unblock owner:
  - CTO board (domain/runtime routing + infra policy gate),
  - control-plane maintainer (correct repository/worktree handoff).
- Unblock action:
  1. Provide workspace/repo that owns `/api/issues` + issue persistence (`activeRunId`, `executionRunId`).
  2. Provide `DEPLOY_CONFIG.md` in that workspace for deployment strategy and infra state.

## Immediate next action once unblocked

1. Add `POST /api/admin/issues/stale-in-progress/corrections` with `dryRun` support.
2. Implement atomic selector + update for `status='in_progress' AND activeRunId IS NULL AND executionRunId IS NULL`.
3. Persist audit metadata (actor, reason, timestamp, run correlation).
4. Return summary counts (`scanned`, `eligible`, `updated`, `skipped_conflict`, `dry_run`).
5. Add focused integration tests for dry-run, mutation path, and conflict-safety.
