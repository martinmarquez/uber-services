# RAT-398 lifecycle guard reference implementation (2026-05-11)

## Wake delta acknowledged
- Comment `5156232a-845a-4492-ab4f-361fba7532f4` reassigned unblock ownership to Back-End with explicit action: implement and verify lifecycle state-machine guard against repeated reopen loops tied to RAT-141.

## ADR prerequisite check
- Required by instruction: read `ADR.md` before coding.
- Path check at runtime:
  - Repo root `ADR.md`: not present.
  - Canonical fallback `$AGENT_HOME/ADR.md`: not present at `/Users/martinmarquez/.paperclip/instances/default/workspaces/0472b077-0242-486a-8fd3-9ef248206448/ADR.md`.
- Execution proceeded in shadow/reference mode using existing in-repo lifecycle policy artifacts.

## Concrete implementation delivered in this heartbeat
- Added executable guard module:
  - `tools/guardrails/issueLifecycleGuard.js`
- Added targeted regression tests:
  - `tools/guardrails/issueLifecycleGuard.test.js`

### Guard behavior encoded
1. Terminal immutability:
- `done`/`cancelled` cannot transition to active states unless `resume: true`.
2. Auditable explicit resume:
- Reopen additionally requires non-empty `actorId` and `reason`.
3. No-delta status wake dedupe:
- `issue_status_changed` with terminal->terminal and no comment/scope/blocker/assignment delta is suppressed.

## Verification run
- Command:
  - `node --test tools/guardrails/issueLifecycleGuard.test.js`
- Result:
  - 8/8 tests passed.

## Boundary and unblock status
- This repository still does not contain the owning Paperclip control-plane runtime mutation path (`/api/issues` transition + checkout reopen gate + wake dedupe integration points).
- The guard and tests above are implementation-ready logic that can be ported/integrated directly by the lifecycle runtime owner.

## Next action
- Lifecycle runtime owner applies this guard logic in the control-plane transition engine and attaches replay evidence from the RAT-398 matrix cases to close the unblock.
