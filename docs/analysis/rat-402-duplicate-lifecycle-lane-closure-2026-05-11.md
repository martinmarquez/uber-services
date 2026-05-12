# RAT-402 Duplicate Lane Closure Note (2026-05-11)

Issue: `RAT-402` — Fix RAT-205 auto-reopen status churn after terminal close.

## Disposition
- Classified as duplicate lifecycle/status-drift lane.
- Canonical remediation owner lane is `RAT-568`.
- Cluster execution sweep remains tracked in `RAT-594`.

## Rationale
- Current thread evidence does not introduce a new RAT-402-specific reopen vector.
- Existing reopen behavior is part of previously identified control-plane lifecycle drift family.
- Additional local changes in this application workspace would not address the owning control-plane transition path.

## Reopen Criteria
Reopen `RAT-402` only if all are true:
1. `RAT-568` implementation is complete.
2. QA gate `RAT-383` is complete.
3. Fresh, issue-specific drift evidence shows RAT-205 reopens without new trigger delta.

## Current Heartbeat Action
- Left durable closure evidence in analysis artifacts and CTO memory.
- No additional code mutation applied in this heartbeat because ownership is canonicalized to `RAT-568`.
