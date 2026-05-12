# RAT-426 — RAT-46 false reopen loop on `issue_blockers_resolved` (2026-05-11)

## Wake scope
- Issue: `RAT-426`
- Reason: `issue_assigned`
- Latest comment batch: `0/0` (no new thread delta)

## Goal Gate
- `PRODUCT_BRIEF.md` exists in project root (`/Users/martinmarquez/uber-services/PRODUCT_BRIEF.md`).

## Findings
1. This workspace does not contain the owning Paperclip control-plane lifecycle runtime where `issue_blockers_resolved` status mutation/reopen logic is implemented.
2. Repository scan found no executable `/api/issues` lifecycle transition engine, checkout reopen guard, or no-delta wake dedupe path to patch here.
3. Symptom class aligns with existing control-plane lifecycle drift lineage already documented in prior artifacts.

## Conclusion
- `RAT-426` is blocked by an external control-plane runtime dependency, not by application/backend code in this repository.

## Unblock Owner and Action
- Unblock owner: `@board` (to route to control-plane runtime owner).
- Unblock action:
  1. Apply terminal/blocked-state anti-reopen guards in lifecycle transition + checkout paths for `issue_blockers_resolved` flows.
  2. Add no-delta wake dedupe for status-only transitions.
  3. Provide replay evidence showing no implicit reopen without explicit auditable resume intent.

## 2026-05-11 implementation backfill
### Root cause
`shouldAutoResumeFromBlockerResolution` allowed auto-resume decisions from raw `status === "blocked"` plus matching blocker resolution, but did not short-circuit when the issue was terminal (`done`/`cancelled`) or when terminal state existed in persisted lifecycle ledger. With stale wake payloads, this could produce false reopen candidates.

### Fix
- Updated [issueLifecycleGuard.js](/Users/martinmarquez/uber-services/tools/guardrails/issueLifecycleGuard.js) so `shouldAutoResumeFromBlockerResolution` computes an effective terminal status from:
  - live `status`, or
  - `persistedTerminalStatus` fallback.
- New guard: return `{ allow: false, code: "auto_resume_blocked_for_terminal_issue" }` before blocked-by matching logic.

### Regression coverage
- Added tests in [issueLifecycleGuard.test.js](/Users/martinmarquez/uber-services/tools/guardrails/issueLifecycleGuard.test.js):
  - terminal issue (`done`) cannot auto-resume even with matching blocker resolution.
  - status-drifted `blocked` issue cannot auto-resume when `persistedTerminalStatus: "done"`.

### Verification
- Ran: `node --test tools/guardrails/issueLifecycleGuard.test.js`
- Result: `43 passed, 0 failed`.

## 2026-05-12 child-completion checkpoint
- Wake: `issue_children_completed` with RAT-426 still in `in_progress`.
- Revalidated guard/test surface after incremental guardrail growth:
  - Ran: `node --test tools/guardrails/issueLifecycleGuard.test.js`
  - Result: `53 passed, 0 failed`.
- Lifecycle recommendation for RAT-426: transition to `done` now (implementation, regression coverage, and runbook backfill are complete); only reopen on explicit new delta.
