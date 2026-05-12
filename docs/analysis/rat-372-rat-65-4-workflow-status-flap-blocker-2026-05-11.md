# RAT-372 / RAT-65.4 Workflow Status Flapping After Done - Blocker Note (2026-05-11)

## Wake Acknowledgement
- Wake reason: `issue_assigned`
- Issue: `RAT-372` (`RAT-65.4 Workflow bug: status flapping after done`)
- Wake payload has no new pending comments (`0/0`), so this heartbeat focused on direct implementation surface validation.

## What Was Verified
1. Reviewed prior lineage artifacts for the same defect family:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-361-rat-133-status-auto-reopen-investigation-2026-05-11.md`
- `docs/analysis/rat-363-workflow-fix-rat-115-auto-reopen-loop-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`

2. Searched executable code in this workspace (`/Users/martinmarquez/uber-services`) for issue lifecycle transition modules (terminal state gate, checkout mutation, `issue_status_changed` dedupe).

3. Confirmed available backend code here is product domain scope (`server/src/domain/reviewService.js`, review/appeal lifecycle), not Paperclip board issue lifecycle runtime.

## Blocker
`RAT-372` requires changes in the Paperclip control-plane issue engine. That code is not present in this workspace, so the status-flapping fix cannot be implemented here.

## Unblock Owner And Action
- Owner: `@CTO`
- Action: execute or assign implementation in the Paperclip control-plane repository/module that owns:
1. issue terminal transition gate (`done`/`cancelled` immutability unless explicit `resume:true`),
2. checkout path safety for terminal issues,
3. wake dedupe path for `issue_status_changed` status-only events,
4. lifecycle transition regression tests at API/service level.

## Scope Lock
No lifecycle semantic expansion is approved in this heartbeat. Policy remains:
- terminal issues stay terminal by default,
- reopen requires explicit, auditable resume intent.

## Next Action Once Unblocked
Run targeted API replay covering:
1. terminal issue + automation wake without `resume:true` => no reopen,
2. terminal issue + checkout => non-mutating reject,
3. explicit `resume:true` + reason => allowed reopen.

## Reopen Delta Update (2026-05-11, issue_reopened_via_comment)
- New thread directive (comment `f00dad88-3261-4cd0-bee3-d22cdd71f86e`) reclassifies RAT-372 as a duplicate Wave-1 lifecycle/status-drift lane.
- Canonical execution lanes:
  - implementation: `RAT-568`,
  - cluster sweep tracking: `RAT-594`,
  - QA completion gate: `RAT-383`.

### Updated Disposition
- `RAT-372` remains blocked/closed as duplicate in this workspace.
- Do not run parallel implementation under RAT-372.
- Reopen only with fresh RAT-372-specific drift evidence after RAT-568 implementation plus RAT-383 completion.

### Unblock Owner And Action (updated)
- Owner: canonical lane owners of `RAT-568` and `RAT-594`.
- Action:
1. Complete RAT-568 control-plane fix.
2. Complete RAT-383 QA gate.
3. Execute RAT-594 cluster sweep closure.
4. Reopen RAT-372 only if issue-specific drift persists after those gates.
