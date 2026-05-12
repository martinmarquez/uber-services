# RAT-660 — Scoped resume gate for terminal reopen transitions (2026-05-11)

## Heartbeat action taken
Implemented and validated a scoped resume gate in the local lifecycle guardrail utility used for control-plane policy checks:

- Updated `tools/guardrails/issueLifecycleGuard.js`
  - Added `shouldAllowScopedResumeGate(input)`.
  - Enforced `resumeSource` on terminal reopen transitions (`done`/`cancelled` -> active statuses).
  - Added allowlist-based source validation to block non-human/system-implicit reopen paths.
- Updated `tools/guardrails/issueLifecycleGuard.test.js`
  - Added regression tests for missing/disallowed `resumeSource`.
  - Added explicit terminal transition coverage for `done -> todo` and `done -> in_progress`.
  - Kept existing explicit resume + actor + reason checks intact.

## Verification
Executed focused tests:

- `node --test tools/guardrails/issueLifecycleGuard.test.js`
- Result: `29/29` passing (`pass 29`, `fail 0`, `duration_ms 39.89775`).

## Mutation payload examples

- Blocked reopen (no resume flag, terminal to active):

```json
{
  "issueId": "RAT-123",
  "fromStatus": "done",
  "toStatus": "todo",
  "resume": false,
  "resumeSource": "issue_update"
}
```

- Blocked reopen (scoped source missing):

```json
{
  "issueId": "RAT-123",
  "fromStatus": "done",
  "toStatus": "todo",
  "resume": true,
  "actorId": "agent-1",
  "reason": "Follow-up scope added"
}
```

- Allowed resume reopen (explicit scoped input):

```json
{
  "issueId": "RAT-123",
  "fromStatus": "done",
  "toStatus": "in_progress",
  "resume": true,
  "resumeSource": "issue_comment_resume",
  "actorId": "agent-1",
  "reason": "New follow-up scope confirmed"
}
```

## Scope and limitation
This repository still does not expose the owning Paperclip control-plane mutation endpoints (`/api/issues` lifecycle transition engine / checkout reopen path). This heartbeat hardens the guardrail policy module and test evidence available in-repo.

## Next action
Wire `shouldAllowScopedResumeGate` into the owning control-plane lifecycle transition and reopen pathways, passing a concrete `resumeSource` from API handlers (`PATCH /api/issues`, comment-based resume flows), then attach replay evidence for a terminal issue that receives no-delta wakes.

## Disposition
`blocked`

## Unblock Owner/Action
- Owner: Platform / Control-plane lifecycle runtime maintainer.
- Action: Implement the scoped terminal-reopen gate in the owning `/api/issues` mutation + checkout path, then replay done->todo / done->in_progress transitions with and without `resume:true` + `resumeSource` and publish runtime evidence.

## Dependency Triage Update (2026-05-11)
- Manager comment acknowledged: execution-state ownership gap is now tracked as a first-class child blocker.
- Child blocker: `f544b8e7-1be1-4bb1-abcb-aa1d373c0fdcENTIFIER` (runtime owner issue).
- RAT-660 remains blocked until child blocker delivers runtime integration evidence.
- Reopen condition for RAT-660: child blocker reaches done with replay proof for blocked and allowed terminal reopen flows in the owning control-plane runtime.
