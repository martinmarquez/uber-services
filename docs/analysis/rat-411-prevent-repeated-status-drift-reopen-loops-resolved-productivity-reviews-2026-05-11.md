# RAT-411 Heartbeat: prevent repeated status-drift reopen loops for resolved productivity-review issues (2026-05-11)

## Scope
Issue: `RAT-411` (medium priority)

Objective: prevent repeated reopen loops on resolved productivity-review issues when there is no new scope, comment, blocker, or assignment delta.

## What Changed In This Heartbeat
1. Acknowledged assignment and validated the latest wake context (no pending new comments in payload).
2. Reconfirmed ownership boundary from executable workspace scan:
- assigned repo: `/Users/martinmarquez/uber-services`
- missing owning mutation surfaces: Paperclip control-plane issue lifecycle transition engine (`/api/issues`), terminal checkout gate, and status-change wake dedupe path.
3. Classified RAT-411 as same defect family as RAT-364/RAT-390/RAT-404/RAT-406/RAT-410/RAT-412.
4. Published durable blocker record with explicit unblock owner/action and replay contract.

## Findings
1. The reopen loop pattern is lifecycle automation churn, not productivity-review content churn.
2. This repository contains product/domain code; it does not contain the control-plane lifecycle runtime needed for terminal reopen suppression.
3. Existing policy remains valid and sufficient:
- terminal issues (`done`/`cancelled`) remain terminal by default,
- reopen requires explicit `resume:true` with auditable actor/reason.

## Blocker Declaration
`RAT-411` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Enforce terminal-state immutability in issue transition paths unless explicit `resume:true`.
  2. Make checkout non-mutating for terminal issues when `resume` is absent.
  3. Suppress status-only/no-delta lifecycle wakes that can requeue/reopen terminal issues.
  4. Attach API/service replay evidence proving:
     - terminal + automation/no-resume => no reopen,
     - terminal + checkout/no-resume => non-mutating,
     - explicit `resume:true` => reopen allowed with audit metadata,
     - repeated no-delta wakes => reopen count remains 0.

## Next Action
When control-plane owner ships the lifecycle patch and replay evidence, run focused regression validation for this defect family and close `RAT-411`.

## Wave-1 De-dup Update (2026-05-11)
- Latest thread comment (`24497342-312c-4034-8ae2-983c731c4ff6`) marks RAT-411 as duplicate lifecycle/status-drift lane.
- Canonical implementation lane is `RAT-568`; cluster execution sweep tracking is `RAT-594`.
- Reopen policy for RAT-411 is now evidence-gated:
  - reopen only if fresh RAT-411-specific drift evidence appears **after** RAT-568 implementation and QA gate RAT-383 completion.
- This issue should otherwise remain closed/blocked as duplicate and not consume implementation cycles.
