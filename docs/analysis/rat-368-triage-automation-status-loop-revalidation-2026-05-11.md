# RAT-368: Triage automation status loop reopening RAT-21 — revalidation (2026-05-11)

## Wake acknowledgement
- Wake reason: `issue_status_changed`
- No new comments in wake payload.
- This heartbeat revalidates whether the reopen-loop fix is runtime-effective.

## What I verified in this workspace
1. `tools/guardrails/issueLifecycleGuard.js` contains all required policy logic:
- terminal reopen requires explicit `resume: true`
- scoped `resumeSource` allowlist for terminal reopen
- no-comment dedupe for `issue_status_changed` and `issue_blockers_resolved` when a terminal status is involved
- persisted terminal-state helpers for productivity-review issues
2. `tools/guardrails/issueLifecycleGuard.test.js` contains regression coverage for those rules.
3. Targeted verification run:
- `node --test tools/guardrails/issueLifecycleGuard.test.js` passes (as part of `npm run test:server`).
4. Runtime wiring gap persists in this repo:
- Search for call sites of `shouldEmitStatusChangedWake`, `shouldAllowStatusMutation`, `readPersistedTerminalStatus`, and `persistTerminalIssueState` only returns definitions/tests in `tools/guardrails/*`.
- No owning control-plane `/api/issues` lifecycle engine exists in this repository to apply these rules at runtime.

## Root-cause status
- Root-cause policy is implemented at utility level.
- Reopen loop can still occur if the production control-plane runtime does not invoke this guardrail module.

## Durable unblock contract
- Owner: Control-plane runtime maintainer (repo containing `/api/issues` lifecycle mutation + wake dispatcher).
- Required action:
1. Wire guardrail calls into runtime transition and wake paths.
2. Persist terminal-state snapshots for productivity-review issues.
3. Suppress no-delta terminal wakes and log dedupe reason.
4. Attach replay evidence showing terminal issues remain terminal unless explicit `resume:true` is provided with allowed source.

## Next action for RAT-368
- Keep blocked until runtime wiring evidence is attached from the owning control-plane codebase.
