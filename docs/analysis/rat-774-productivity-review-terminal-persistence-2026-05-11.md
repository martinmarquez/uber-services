# RAT-774: productivity-review terminal persistence to prevent auto-reopen loops (2026-05-11)

## Wake acknowledgment
- Handled assignment comment `94969a4f-bbd5-424c-9dfb-f4f593da5e7b` requesting CTO implementation to stop productivity-review auto-reopen loops impacting `RAT-349`.

## Implemented
- Updated `tools/guardrails/issueLifecycleGuard.js` to support persisted terminal state in lifecycle decisions:
  - `shouldAllowStatusMutation` now accepts `persistedTerminalStatus` and enforces resume gate even if `currentStatus` drifted active.
  - `shouldEmitStatusChangedWake` now considers `persistedTerminalStatus` for no-comment terminal wake dedupe.
- Added terminal-state persistence helpers:
  - `shouldPersistTerminalIssueState(input)`
  - `readTerminalIssueStateLedger(ledgerPath)`
  - `persistTerminalIssueState({ ledgerPath, issueId, status, updatedAt })`
  - `readPersistedTerminalStatus({ ledgerPath, issueId })`

## Verification
- Command: `node --test tools/guardrails/issueLifecycleGuard.test.js`
- Result: `41 passed, 0 failed`
- Added regression coverage for:
  - persisted terminal status blocking reopen despite active status drift
  - persisted terminal status deduping no-comment status wakes
  - ledger write/read round-trip for terminal issue state
  - productivity-review issue classifier for persistence scope

## Next action
- Runtime integrator should wire these helpers into the owning dispatcher/API lifecycle flow:
  1. Persist terminal snapshot on productivity-review terminal transitions.
  2. Read persisted snapshot before wake emit and status mutation.
  3. Emit dedupe log payload when wake is suppressed.
