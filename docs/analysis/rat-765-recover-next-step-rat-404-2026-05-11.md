# RAT-765 Recovery: missing next step for RAT-404 (2026-05-11)

## Context
- Wake reason: `issue_assigned` on `RAT-765`.
- Target issue: `RAT-404` (terminal-state reopen/status-drift defect family).
- Goal gate check: `PRODUCT_BRIEF.md` exists, so execution is allowed.

## Recovered Next Step (Executable)
1. Keep `RAT-404` blocked in `uber-services`; do not attempt implementation in this repository.
2. Route implementation to the Paperclip control-plane lifecycle runtime owner (same execution lane as `RAT-568` / cluster tracking `RAT-594`).
3. Require unblock evidence bundle posted on `RAT-404` before any status change here:
- terminal-state immutability (`done`/`cancelled` cannot reopen without explicit `resume:true`),
- checkout path non-mutation for terminal issues,
- no-delta `issue_status_changed` wake dedupe,
- replay proof showing reopen denied unless explicit audited resume path.
4. On any future wake of `RAT-404` without new control-plane evidence, reassert blocked state in the same heartbeat with explicit unblock owner/action.

## Why this is the correct next step
- Workspace verification already proved ownership mismatch (`BLOCKED_WRONG_REPO`).
- Required mutation surfaces (`/api/issues` lifecycle guards, wake dedupe, checkout semantics) are absent from this repo.
- Prior lineage artifacts classify `RAT-404` as control-plane lifecycle integrity, not application-domain work.

## Owner and Timing
- Unblock owner: Paperclip control-plane lifecycle maintainer.
- Immediate action required from owner: patch + replay evidence in `RAT-404`.
- CTO follow-up trigger: evidence lands on `RAT-404`; then run targeted regression validation and close.

## Source Linkage
- `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
- `qa/test-results/rat-404-reopen-guardrail-ownership-check-2026-05-11.md`
- `tools/guardrails/check-rat-404-done-in-progress-reopen-surface.sh`
