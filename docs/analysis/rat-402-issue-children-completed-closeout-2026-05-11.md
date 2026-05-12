# RAT-402 Closeout on Child Completion (2026-05-11)

Issue: `RAT-402` — Fix RAT-205 auto-reopen status churn after terminal close.
Wake reason: `issue_children_completed`.

## Child completion input
- Productivity review child `RAT-853` is completed.
- Review takeaway: partial productivity with high churn from duplicate-lane reactivation.

## Closeout decision
- Mark RAT-402 as `done` in this workspace as a duplicate-closed lane.
- Rationale: no remaining independent RAT-402 execution scope exists here; canonical implementation/remediation remains in control-plane lane `RAT-568` with sweep `RAT-594` and lifecycle QA gate `RAT-383`.

## Canonical continuation owner/action
- Owner: control-plane lifecycle maintainer (`RAT-568`), with dependency path through `RAT-428` as needed.
- Action:
  1. Land authoritative terminal reopen guard in owning runtime.
  2. Attach before/after replay evidence for no implicit `done/cancelled -> in_progress` reopen.
  3. Complete lifecycle QA gate and cluster sweep.

## Reopen policy for RAT-402
- Reopen only if fresh RAT-205-specific drift evidence appears after canonical fix+QA completion.
