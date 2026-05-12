# RAT-398 Control-Plane Replay Matrix (RAT-141 completion loop)

Date: 2026-05-11  
Target issue family: completed issues re-woken/reopened without scope delta  
Primary reference issue: `RAT-141`

## Purpose
Provide an execution-ready replay matrix for the control-plane lifecycle owner to validate and fix the status flip/re-wake loop.

## Preconditions
1. Use a non-production environment with lifecycle event logging enabled.
2. Ensure issue event history includes:
- status transition events,
- wake enqueue/dequeue events,
- checkout mutation decisions,
- transition provenance fields (`change_source`, `change_reason`, actor).
3. Seed a fixture issue equivalent to RAT-141:
- status `done`,
- no pending comments,
- no blocker delta,
- no assignment delta.

## Replay matrix

### Case A: terminal issue + status-change wake (no resume)
1. Trigger synthetic `issue_status_changed` wake on a `done` issue with zero deltas.
2. Execute assignee heartbeat and checkout flow.
3. Assert:
- issue remains `done`,
- no implicit transition to `todo`/`in_progress`,
- wake may be consumed/ignored but cannot mutate lifecycle.

Expected result: `PASS` only if no reopen occurs.

### Case B: repeated terminal wakes burst
1. Fire 10 sequential `issue_status_changed` wakes for same terminal issue.
2. Process queue to completion.
3. Assert:
- zero lifecycle reopen events,
- idempotent dedupe behavior recorded,
- board WIP counters unchanged.

Expected result: `PASS` only if reopen count = 0.

### Case C: checkout on terminal issue (no resume)
1. Call checkout path for terminal issue without `resume: true`.
2. Assert:
- checkout returns non-mutating outcome,
- no status transition side-effect event emitted.

Expected result: `PASS` only if terminal state preserved.

### Case D: explicit resume path (positive control)
1. Submit status/comment payload with `resume: true`, actor, and reason.
2. Assert:
- transition to active state is allowed,
- audit trail persists actor + reason + `change_source`.

Expected result: `PASS` only if reopen requires explicit resume metadata.

### Case E: terminal finalization transition dedupe
1. Transition issue `in_progress -> done` with no comment/blocker/assignment delta.
2. Observe wake scheduler behavior.
3. Assert:
- no redundant continuation wake that can cause reopen churn.

Expected result: `PASS` only if terminal finalization does not create reopen-capable wake churn.

## Required evidence bundle
1. Event timeline export (ordered by timestamp) for each case.
2. Before/after patch diff for lifecycle transition and wake dedupe rules.
3. Integration test artifacts covering Cases A-D minimum.
4. Summary table:
- reopen count,
- unauthorized transition count,
- explicit resume transition count,
- deduped wake count.

## Ship gate
Do not close RAT-398 until all cases pass and evidence is attached in the issue thread by the lifecycle runtime owner.
