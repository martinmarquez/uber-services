# RAT-417 Heartbeat: terminal done-state no-delta reopen guard (2026-05-11)

Issue: `RAT-417` — Implement terminal done-state no-delta reopen guard in control-plane lifecycle.

## Wake handling
- Wake reason: `issue_status_changed` (from harness payload).
- Pending comments: `0/0`.
- Goal gate: satisfied (`PRODUCT_BRIEF.md` exists).

## Implementation surface in this workspace
Guard logic and tests are implemented in:
- `tools/guardrails/issueLifecycleGuard.js`
- `tools/guardrails/issueLifecycleGuard.test.js`
- `tools/guardrails/check-rat-363-terminal-reopen-contract.sh`

## Acceptance mapping
1. Reproduce RAT-195/RAT-412 reopen path in lifecycle runtime fixture.
- Replayed through deterministic guard fixture script: `./tools/guardrails/check-rat-363-terminal-reopen-contract.sh`.

2. Add guard(s) for transition, checkout, and no-delta wake paths.
- Transition gate (`done/cancelled` -> active blocked unless explicit resume): `shouldAllowStatusMutation`.
- Checkout implicit reopen blocked (scoped source gate + resume requirement): `shouldAllowStatusMutation` + `shouldAllowScopedResumeGate`.
- Wake dedupe for no-delta status-change: `shouldEmitStatusChangedWake`.

3. Add direct regression test for each path.
- Transition path tests:
  - `terminal issue cannot reopen without resume=true`
  - `terminal issue can reopen only with explicit resume + actor + reason`
- Checkout path tests:
  - `checkout automation cannot implicitly reopen terminal issue without resume`
  - `terminal issue cannot reopen with checkout source even when resume requested`
- Wake dedupe path tests:
  - `terminal-finalization no-delta status wakes are deduped`
  - `persisted terminal status dedupes no-comment status wake`

4. Attach replay evidence for required scenarios.
- `node --test tools/guardrails/issueLifecycleGuard.test.js`
  - Result: `49` tests passed, `0` failed.
- `./tools/guardrails/check-rat-363-terminal-reopen-contract.sh`
  - `PASS: terminal reopen blocked without resume -> {"allow":false,"code":"resume_required_for_terminal_reopen"}`
  - `PASS: terminal reopen allowed with explicit scoped resume -> {"allow":true,"code":"ok_explicit_resume"}`
  - `PASS: no-delta status wake deduped for terminal issue -> {"emit":false,"code":"dedupe_terminal_resume_wake_without_comment_delta"}`
  - `PASS: terminal issue cannot auto-resume from blocker resolution -> {"allow":false,"code":"auto_resume_blocked_for_terminal_issue"}`
  - `RESULT=PASS`

## Conclusion
RAT-417 guard expectations are implemented and replay-verified in the local lifecycle guard runtime fixture: no terminal reopen without explicit resume intent/provenance, explicit resume allowed under scoped input, and no-delta status-change wakes deduped.

## Next action
Post this artifact in the issue thread and keep API/service replay scripts as the acceptance evidence bundle for closeout.
