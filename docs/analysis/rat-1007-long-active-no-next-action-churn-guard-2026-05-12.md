# RAT-1007: Long-active no-next-action productivity-review churn guard (2026-05-12)

## Trigger
Routing comment on [RAT-1007](/RAT/issues/RAT-1007): lifecycle/status-churn remediation belongs to CTO control-plane owner.

## Problem
Repeated `long_active_duration` alerts can create review churn when:
- the source issue still has no explicit next action, and
- a productivity review lane is already open, and
- there is no material execution delta.

## Change Applied
1. Added `shouldEmitProductivityReviewWake` to `tools/guardrails/issueLifecycleGuard.js`.
2. New contract:
- Dedupes long-active wake when `hasOpenProductivityReview=true` and next action is still missing with no material delta.
- Emits first-signal wake when no review is open.
- Emits wake when material delta exists or next action appears.
3. Added targeted tests in `tools/guardrails/issueLifecycleGuard.test.js`.
4. Added executable guardrail: `tools/guardrails/check-rat-1007-long-active-no-next-action-churn.sh`.
5. Added npm entrypoint: `guard:rat-1007`.

## Verification
- `npm run -s guard:rat-1007`
- `node --test tools/guardrails/issueLifecycleGuard.test.js`

Result: PASS (`PASS_LONG_ACTIVE_NEXT_ACTION_DEDUPE`) and full test suite pass.

## Next Action
Wire this guard contract into the owning control-plane runtime wake dispatcher so long-active productivity-review generation consumes the dedupe decision directly.
