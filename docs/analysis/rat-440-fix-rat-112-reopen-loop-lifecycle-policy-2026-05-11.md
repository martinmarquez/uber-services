# RAT-440 Heartbeat: fix RAT-112 reopen-loop lifecycle policy (2026-05-11)

Issue: `RAT-440`  
Scope: formalize lifecycle policy to prevent RAT-112-class reopen loops without human context.

## Wake acknowledgement
- Wake reason: `issue_assigned`.
- Latest comment batch in payload: `0/0` (no new thread delta).
- Action implication: proceed with policy hardening artifact and unblock path, not feature-scope changes.

## Goal gate
- Company goal artifact present: `PRODUCT_BRIEF.md` in project root.

## Problem statement
`RAT-112` is closed as a false-positive silent-run review, but this defect family keeps resurfacing as lifecycle churn where issues in controlled states are reactivated without explicit human resume intent.

## Lifecycle policy for RAT-112-class reopen loops
1. Explicit resume contract is mandatory.
- Issues in `done` or `cancelled` remain terminal by default.
- Any reopen requires explicit `resume: true` plus auditable actor/reason.

2. Blocked-state integrity is equally mandatory.
- Issues in `blocked` do not auto-transition to active states unless one of:
  - blocker delta is real and auditable, or
  - explicit human resume intent is provided.

3. No-delta status churn must be deduped.
- Status-only automation transitions with no comment/scope/blocker/assignee delta must not trigger reopen/wake loops.

4. Checkout must be non-mutating for guarded states.
- Checkout on terminal/blocked issues must not change lifecycle state unless explicit resume conditions are met.

## Acceptance criteria (policy verification targets)
1. Terminal issue replay (`done`/`cancelled`) with repeated wakes and no resume signal stays terminal across all attempts.
2. Blocked issue replay with no blocker delta and no resume signal stays blocked.
3. Status-only automation event with no context delta produces no reopen transition.
4. Explicit `resume: true` with actor/reason reopens exactly once and emits auditable provenance.
5. Board WIP counts remain stable under no-delta replay for RAT-112-equivalent scenarios.

## Ownership boundary and unblock path
This repository does not contain the owning Paperclip lifecycle mutation runtime (`/api/issues` transition + checkout + wake dedupe engine), so code-level remediation cannot be applied here.

- Unblock owner: control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Implement the four policy controls above in transition/checkout/wake paths.
  2. Attach replay + integration-test evidence for RAT-112-equivalent fixture.
  3. Provide before/after mutation trace showing no implicit reopen without explicit resume intent.

## Operator rule location / config surface
- Guardrail decision logic:
  - `tools/guardrails/issueLifecycleGuard.js`
    - `shouldAllowStatusMutation` (terminal + blocked reopen gate)
    - `shouldEmitStatusChangedWake` (no-delta dedupe gate)
    - `shouldAutoResumeFromBlockerResolution` (blockedBy resolution gate)
- Regression contract:
  - `tools/guardrails/issueLifecycleGuard.test.js`
- Runtime-surface ownership probe:
  - `tools/guardrails/check-rat-830-api-issues-lifecycle-surface.sh`

## Next action
Keep `RAT-440` in lifecycle-policy enforcement mode until control-plane evidence lands; then run targeted regression verification and close.
