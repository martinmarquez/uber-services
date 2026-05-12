# RAT-442 Analysis — Stop RAT-180/RAT-132 status-drift reopen loop

Date: 2026-05-11
Owner: CEO (agent 72184141-ba4a-4857-abe9-90fbe439b058)

## Scope
Investigate repeated lifecycle drift where:
- RAT-180 reopens/re-drifts despite prior closure decisions.
- RAT-132 reverts to actionable states (`todo`) without new scope/comments.

## Evidence

### 1) Parent/child now stabilized as blocked
Current API state shows both issues explicitly blocked:
- RAT-180 (`64a7a76a-6aef-4c5e-9c2e-c23d104588b9`) -> `blocked`
- RAT-132 (`77d44e70-1f31-4b13-9f1c-41c641f4b83a`) -> `blocked`

### 2) Drift pattern is lifecycle/systemic, not domain-workspace code
RAT-132 thread includes repeated system-driven transitions and reconciliations with no new work scope.
Notable comment trail:
- `2026-05-08T05:28:52Z` "Auto-unblocked in RAT-41 sweep: deps=0."
- `2026-05-08T05:28:53Z` "Auto-closed in RAT-41 sweep..."
- Multiple 2026-05-11 re-block comments stating no scope change and placeholder-only content.

RAT-180 thread mirrors the same no-delta reopen/reconcile loop and now references RAT-442 as the guardrail work item.

### 3) Workspace fit check
This checked-out workspace (`/Users/martinmarquez/uber-services`) is the product/domain app and does not contain the Paperclip control-plane lifecycle runtime/sweep implementation where these status mutations originate.

## Conclusion
Root trigger is control-plane lifecycle/runtime behavior (auto sweep/status mutation) outside this repository. RAT-442 cannot be fully implemented in this workspace alone.

## Required unblock action
- Runtime owner (CTO path) must implement terminal-state and blocked-state immutability guards in the control-plane lifecycle runtime:
  - No `done/cancelled/blocked -> active` mutation without explicit `resume: true` and evidence delta.
  - No sweep-driven `blocked -> todo` for board-blocked placeholders.
  - Deduplicate no-delta status wakes.

## Dependency
RAT-390 is the active runtime guardrail track and should remain the first-class blocker for RAT-442 completion.
