# RAT-800 — Cycle-safe blocker edge normalization for analytics dependency chain (2026-05-11)

## Wake acknowledgment
- Wake reason: `issue_assigned`.
- Action this heartbeat: implemented cycle-safe blocker-edge normalization primitives and tests in the guardrail surface used for lifecycle/dependency analytics.

## Problem
Analytics dependency-chain rollups rely on normalized blocker edges. Existing normalization deduped values but did not expose a cycle-aware edge-normalization output and allowed self-referential blocker IDs in some payload shapes.

## Implementation
- Updated `tools/guardrails/issueLifecycleGuard.js`:
  - `normalizeBlockedByIssueIds(...)` now drops self-referential blocker IDs when `issueId` is provided.
  - Added `normalizeBlockerEdgesForAnalyticsChain(issues)` to:
    - normalize mixed blocker fields (`blockedByIssueIds`, `blockedByIssueId`, `blockedBy`),
    - emit deterministic unique edges (`issueId -> blockedByIssueId`),
    - detect graph cycles without recursion loops and report `hasCycle` + `cycleIssueIds`.
- Updated tests in `tools/guardrails/issueLifecycleGuard.test.js`:
  - self-edge suppression,
  - mixed input normalization output,
  - explicit 2-node cycle detection.

## Verification
- Command: `node --test tools/guardrails/issueLifecycleGuard.test.js`
- Result: PASS (`37/37` tests).

## Operational contract
- Dependency analytics may now consume `normalizeBlockerEdgesForAnalyticsChain` output directly and branch on `hasCycle` to avoid assuming DAG topology.
- Presence of `hasCycle=true` is now explicit signal for non-topological handling (queue/annotate/escalate), not silent edge drift.
