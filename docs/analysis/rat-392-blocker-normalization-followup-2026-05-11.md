# RAT-392 blocker metadata normalization follow-up (2026-05-11)

## Trigger

Comment `6a4b6b43-f7c8-4083-b08f-c5c5ad7534c5` requested canonical blocker metadata (`blockedBy`) or explicit human unblock owner/action/ETA.

## Action taken

1. Created canonical upstream execution dependency issue:
   - `RAT-747` — Platform/SRE staging+production actor-signing evidence execution.
2. Linked `RAT-747` as child of `RAT-392` (`RAT-747.parentId = RAT-392.id`).
3. Attempted to persist blocker edge on `RAT-392` with all known payload variants:
   - `blockedBy: [<RAT-747 UUID>]`
   - `blockedByIssueIds: ["RAT-747"]`
   - `blockedByIssueId: "RAT-747"`
   - `blockedBy: "RAT-747"`
4. Readback still returns `RAT-392.blockedBy = []`.

## Result

- Lifecycle state set to `blocked` and retained.
- Canonical machine edge mutation appears non-persistent for this issue row in current control-plane runtime.

## Human unblock contract (fallback path)

- Unblock owner: `@platform-sre` (execution) + CTO lifecycle lane (blockedBy persistence defect)
- Unblock action:
  1. Platform/SRE completes `RAT-747` and attaches all required artifacts.
  2. CTO lifecycle lane repairs blocker-edge persistence or manually binds `RAT-392.blockedBy` to `RAT-747`.
- ETA target: first checkpoint within 4h of wake; closure within next execution window after env access.
