# RAT-568 Comment Triage Response (2026-05-11)

Comment reference: `c2c46f30-73e4-4566-98c0-2bb183e7fb64`  
Mode: dependency-blocked triage (no unblocking of deliverable work)  
Blocking dependency: `RAT-428` (control-plane runtime patch lane)

## Requested evidence status

1. Regression test(s) for repeated `issue_status_changed` on terminal/closed issues with no implicit reopen.
- Status: **partially satisfied (simulation layer)**.
- Evidence:
  - `tools/guardrails/issueLifecycleGuard.test.js`
  - `node --test tools/guardrails/issueLifecycleGuard.test.js` => `11 passed, 0 failed`
  - Includes no-delta terminal wake dedupe assertion:
    - `terminal-finalization no-delta status wakes are deduped`

2. Positive-control test for legitimate reopen path when scoped resume/new-input gate is present.
- Status: **partially satisfied (simulation layer)**.
- Evidence:
  - Test case: `terminal issue can reopen only with explicit resume + actor + reason`
  - Test case: `terminal reopen requires scoped resume source`
  - Test case: `terminal reopen rejects disallowed scoped resume source`

3. Run/event replay artifact (IDs + before/after state) showing RAT-77-style churn suppression.
- Status: **not satisfied in owning runtime**.
- Existing context-only references (pre-patch investigations):
  - `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md` (run IDs with repeated `issue_status_changed` churn)
  - `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md` (replay plan)
- Gap: no authoritative before/after replay from patched control-plane runtime is possible in this repository.

4. Exact patch/commit link implementing guard in control-plane lifecycle runtime.
- Status: **not satisfied**.
- Gap: control-plane `/api/issues` lifecycle runtime is not present in this checkout; no authoritative commit can be produced here.

## Current decision
Keep `RAT-568` in `blocked` until `RAT-428` lands in the owning control-plane repo with:
1. merged patch/commit link,
2. runtime regression results,
3. replay artifact with before/after state evidence.

Unblock owner: `@CTO board / control-plane lifecycle maintainer`  
Unblock action: attach or reassign to the repo owning `/api/issues` lifecycle transitions and checkout/wake mutation paths; then complete items 3-4 and close RAT-568.
