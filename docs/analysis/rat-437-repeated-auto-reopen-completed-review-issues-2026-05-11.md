# RAT-437 Investigation: repeated auto-reopen of completed review issues (2026-05-11)

## Scope
Investigate and stop the repeated auto-reopen behavior on completed review issues.

## Heartbeat Evidence
- Wake payload on this run is `issue_assigned` for `RAT-437` with no pending comments and no human-triggered scope delta.
- Repository runtime-surface guardrail result:
  - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
  - Result: `RESULT=BLOCKED_WRONG_REPO`
  - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
- Direct codebase scan found no owning control-plane lifecycle mutation engine (`/api/issues` transition logic, checkout reopen gate, or `issue_status_changed` dedupe path) in this workspace.

## Findings
1. The observed defect class is lifecycle-state integrity drift in the Paperclip control plane, not a product review-domain defect in `uber-services`.
2. This workspace does not contain the executable runtime surface required to implement the permanent fix.
3. Repeated close/reopen churn remains possible until terminal-state and no-delta guards are patched in the owning control-plane runtime.

## Required Fix (Owning Runtime)
1. Enforce terminal immutability: `done`/`cancelled` cannot reopen unless explicit `resume: true` is present with auditable actor and reason.
2. Checkout safety: checkout must be non-mutating for terminal issues without explicit resume intent.
3. No-delta wake dedupe: suppress `issue_status_changed` auto-wakes when there is no scope/comment/blocker/assignee delta.
4. Add regression replay tests covering repeated wake + checkout sequences and proving no reopen without `resume: true`.

## CTO Disposition
- Status recommendation: `blocked` (implementation owner is outside this repository/runtime).
- Unblock owner: Paperclip platform lifecycle maintainer (CEO/platform owner).
- Unblock action: ship the runtime lifecycle guardrails above in the owning control-plane codebase and attach before/after replay evidence.
