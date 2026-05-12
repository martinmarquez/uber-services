# RAT-543 - Stuck-Issue Routing Sweep and Blocker Normalization (for RAT-542)

Date: 2026-05-11
Issue: [RAT-543](/RAT/issues/RAT-543)
Parent target: [RAT-542](/RAT/issues/RAT-542)

## Scope executed
Run a minimal routing-sweep proof to classify whether remediation is implementable in this workspace or must be normalized as an upstream blocker for RAT-542.

## Verification evidence
1. `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
- Result: `RESULT=BLOCKED_WRONG_REPO`
- Detail: no control-plane issue lifecycle runtime signatures found in `server/*`.

2. `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
- Result: `RESULT=BLOCKED_WRONG_REPO`
- Detail: no lifecycle reopen signatures found in `server/*`.

3. `bash tools/guardrails/check-rat-448-productivity-review-reopen-ledger.sh`
- Result: `RESULT=REOPEN_PATTERN_CONFIRMED`
- Detail: done->todo and blocked->todo churn present; target issue marker exists (`RAT-285` on `2026-05-11`).

## Normalization decision
- Routing/guardrail implementation for the stuck-issue lifecycle defect is **not patchable** in `uber-services`.
- The correct action is blocker normalization: keep execution blocked in this workspace and route the implementation fix through the control-plane runtime owner under RAT-542.
- RAT-543 delivers durable evidence + normalization so RAT-542 can proceed with correct owner boundary.

## Unblock owner/action
- Owner: control-plane lifecycle runtime maintainer (CTO lane coordinating with board/runtime owner).
- Action: ship runtime guardrails (terminal/blocked immutability + explicit resume gate + no-delta wake dedupe) and attach replay evidence; then rerun these probes and clear blocker linkage.
