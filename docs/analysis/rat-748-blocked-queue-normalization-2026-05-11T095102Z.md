# RAT-748 Blocked Queue Normalization Sweep

- Timestamp (UTC): 2026-05-11 09:51:02
- Total blocked issues scanned: 149
- Blocked issues missing `blockedByIssueIds`: 149
- Deterministically backfillable from existing `blockedBy`: 0
- Issues updated this sweep: 0
- Remaining blocked with no blocker edge metadata: 149

## Sweep Method

1. Queried all company issues in status `blocked`.
2. Selected issues where `blockedByIssueIds` is null/empty.
3. For entries already carrying non-empty `blockedBy`, patched `blockedByIssueIds` to the corresponding blocker IDs.
4. Left zero-edge blocked issues untouched pending explicit unblock owner/action capture and owner-routing pass.

## Next Action

- Owner: CTO (this issue lane), with role-routing support from CEO queue owner.
- Action: run wave-2 normalization for the remaining zero-edge blocked issues: assign role-aligned owner, then either (a) set real blocker issue links or (b) move to actionable status with dated next action.
