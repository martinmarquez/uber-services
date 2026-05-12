# RAT-455 Heartbeat: prevent productivity-review auto-reopen churn without material deltas (2026-05-11)

## Objective
Stop repeated auto-reopen churn on productivity-review issues when there is no material execution delta.

## Wake reconciliation
- Trigger: `issue_assigned`
- Wake payload comments: `0/0` (no new human context)
- Issue state at wake: `in_progress`

## What I validated in this heartbeat
1. Goal gate passed: `PRODUCT_BRIEF.md` is present in repo root.
2. This workspace was re-scanned for the owning lifecycle mutation runtime (`/api/issues` transition logic, checkout reopen guard, no-delta wake dedupe paths).
3. Existing local artifacts confirm this defect class is already defined as control-plane lifecycle integrity debt, not product-domain code behavior.

## Findings
1. Reopen churn without material deltas is lifecycle-state automation drift.
2. The owning mutation surface is external to this repository; this repo contains product/service code and analysis artifacts, not the control-plane lifecycle engine.
3. Therefore, a direct durable code fix for RAT-455 cannot be implemented in this workspace without crossing ownership boundaries.

## Decision
Keep RAT-455 in `blocked` until the owning control-plane runtime lands the guardrails and replay evidence.

## Unblock owner and required action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Enforce terminal/blocked immutability unless explicit `resume:true` is provided with actor/reason provenance.
  2. Prevent checkout/status-only automation from implicitly reopening or requeueing without explicit resume intent.
  3. Dedupe no-delta `issue_status_changed` wakes so repeated no-context events cannot churn state.
  4. Attach replay/API regression evidence for a RAT-455-equivalent fixture proving no reopen when there is no material delta.

## Closure evidence required
1. Runtime patch merged/deployed in owning control-plane.
2. Negative replay: terminal/blocked + no-resume + no-delta wake => no reopen.
3. Positive replay: explicit `resume:true` + reason => reopen allowed and auditable.

## 2026-05-11 follow-up delta (CTO heartbeat)
- Revalidated issue state from API: [RAT-455](/RAT/issues/RAT-455) had drifted back to `in_progress` with no new comments (`0/0` wake payload) after prior blocked disposition.
- This reproduces the same no-delta lifecycle mutation class the issue is tracking.

### Deterministic verification notes
1. Negative-path expected behavior:
   - Precondition: issue in terminal/blocked state, no decision-relevant field changes, no explicit `resume:true` mutation payload.
   - Event: automated wake/comment refresh/status-sync executes.
   - Expected: issue status remains unchanged; no reopen transition.
2. Positive-path expected behavior:
   - Precondition: explicit operator/agent mutation with `resume:true` and reason.
   - Event: update request processed by lifecycle runtime.
   - Expected: reopen transition allowed and audited.
3. Current observed behavior (defect):
   - Precondition matched negative path, but state reopened to `in_progress`.
   - Conclusion: runtime-level resume gate/dedupe is still missing on owning control-plane surface.
