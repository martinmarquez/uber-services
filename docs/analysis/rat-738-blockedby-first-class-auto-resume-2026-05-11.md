# RAT-738 — Convert blocked queue to first-class blocker links for auto-resume (2026-05-11)

## Wake handling
- Wake reason: `issue_assigned`
- Pending comments: `0/0`
- Action taken this heartbeat: implemented lifecycle guardrail logic and tests to enforce first-class blocker-link auto-resume.

## Implementation
Updated guardrail module:
- `tools/guardrails/issueLifecycleGuard.js`

Added function:
- `shouldAutoResumeFromBlockerResolution(input)`

Decision rules now enforced:
1. issue must be currently `blocked`.
2. `blockedByIssueIds` (runtime `blockedBy`) must be non-empty.
3. resolved blocker delta must be present.
4. at least one resolved blocker must match existing `blockedByIssueIds`.
5. resume source must be `issue_blockers_resolved`.

If any condition fails, auto-resume is denied with an explicit code.

## Verification
Test file updated:
- `tools/guardrails/issueLifecycleGuard.test.js`

Command run:
```bash
node --test tools/guardrails/issueLifecycleGuard.test.js
```

Result:
- `17/17` tests passed
- includes negative + positive cases for blocker-link matching and resume source gating.

## Outcome
- Blocked queue auto-resume path is now explicitly tied to first-class blocker links.
- Comment-only blocker semantics cannot trigger automatic resume under this guardrail.
