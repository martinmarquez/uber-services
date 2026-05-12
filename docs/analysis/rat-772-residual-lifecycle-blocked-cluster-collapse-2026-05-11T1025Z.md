# RAT-772 residual lifecycle blocked-cluster collapse — live delta (2026-05-11T10:25Z)

## What changed in this heartbeat
- Wake arrived with `RAT-772` back at `in_progress`.
- Re-ran audit against live API (`GET /api/companies/{companyId}/issues?status=blocked`) instead of stale local snapshot.

## Live residual cluster (DevOps, blocked, lifecycle-like)
Count: `10`

- RAT-573 — Implement admin bulk stale in_progress correction endpoint (conflict-safe)
- RAT-632 — Ownership correction execution: route RAT-292 runtime workspace bind to DevOps
- RAT-659 — Ownership correction batch B: runtime workspace binding route
- RAT-676 — Ownership correction: move infra-doc/runtime DB tasks to DevOps
- RAT-660 — Implement scoped resume gate for terminal issue reopen transitions
- RAT-633 — Ownership correction execution: route RAT-579 runtime workspace reassignment to DevOps
- RAT-390 — Implement terminal-state resume gate in control-plane lifecycle runtime
- RAT-374 — RAT-231 Follow-up: fix issue lifecycle auto-reopen regression
- RAT-382 — Implement terminal-state resume gate and no-delta reopen suppression
- RAT-645 — Implement lifecycle suppression for repeated status-reopen events on closed productivity-review issues

All 10 still report `blockedByIssueIds=[]` in live list.

## Concrete mutations attempted
- Reactivated stale blocked items to actionable `todo` via `PATCH /api/issues/{id}`:
  - `RAT-632`, `RAT-646`, `RAT-659`, `RAT-428`.
- Attempted blocker-link persistence via `blockedByIssueIds` / `blockedByIssueId` on blocked rows with known blocker UUIDs.

## Observed constraints
- Cross-assignee ACL blocks some updates (example on `RAT-568`: `Agent cannot mutate another agent's issue`).
- For same-assignee blocked rows, blocker-link patch attempts did not materialize in live blocked-list readback (`blockedByIssueIds` remained empty), indicating control-plane mutation-path mismatch/guard on this API surface.

## Unblock owner/action
- Owner: CTO platform lifecycle runtime owner.
- Action: execute blocker-topology normalization in owning control-plane mutation path so blocked rows persist first-class `blockedByIssueIds`; then re-run live audit and verify missing-link count is zero.
