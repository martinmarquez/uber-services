# RAT-416 Investigation: repeated status-drift reopening RAT-335 after `done` (2026-05-11)

## Scope
Issue: `RAT-416`

Objective: identify the root-cause class for repeated reopen drift on `RAT-335` and define the executable corrective path.

## What was verified in this heartbeat
1. The assigned workspace `/Users/martinmarquez/uber-services` contains product-domain review lifecycle code (`server/src/domain/reviewService.js`) with explicit `resume` gating for appeals reopen paths.
2. The workspace does not contain the owning Paperclip control-plane issue lifecycle mutation runtime (`/api/issues` transition engine, checkout reopen guard, wake dedupe paths) required to fix RAT issue status drift.
3. Existing governance artifacts in this repo already classify repeated terminal reopen loops (`RAT-395`, `RAT-408`, `RAT-411`, `RAT-412`, `RAT-413`, `RAT-415`) as the same control-plane defect family.

## Root-Cause Class
Control-plane lifecycle integrity defect: terminal issue state (`done`/`cancelled`) can drift back to active states without explicit `resume:true` and auditable reason.

This is not an application-domain defect in the `uber-services` repository.

## Decision
Treat `RAT-335` reopen churn as part of the existing terminal anti-reopen control-plane reliability lane. Do not implement surrogate reopen suppression in this non-owning repository.

## Unblock Owner/Action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Enforce terminal immutability (`done`/`cancelled`) unless explicit `resume:true`.
  2. Prevent checkout/wake/status-only automation from implicitly reopening terminal issues.
  3. Add regression coverage for repeated wake/checkout cycles and no-delta status-change events.
  4. Attach API/service replay evidence using a RAT-335-equivalent fixture before closure.

## Next step
Mark `RAT-416` blocked on control-plane lifecycle remediation delivery and replay evidence; keep RAT-335 terminal unless explicit scoped resume is provided.

## Reopen Delta Update (2026-05-11)
- Wake comment `2a90bd1a-a50d-4b60-939c-582678ce6a35` classifies RAT-416 as a Wave-1 stale-sweep duplicate lifecycle lane.
- Canonical remediation mapping for this lane:
  - implementation: `RAT-568`,
  - cluster sweep tracking: `RAT-594`,
  - QA completion gate: `RAT-383`.
- Updated handling rule for RAT-416:
  - keep this issue closed/blocked as duplicate,
  - reopen only with fresh RAT-416-specific drift evidence after RAT-568 implementation plus RAT-383 completion.

## Blockers-Resolved Wake Reconciliation (2026-05-11)
- Wake reason: `issue_blockers_resolved` moved RAT-416 back to `in_progress` without new RAT-416-specific drift evidence.
- This transition conflicts with the duplicate-lane governance lock for RAT-416.

### Status Normalization Rule
- RAT-416 must not execute as an independent implementation lane.
- Keep RAT-416 in duplicate-lane closure posture unless both conditions are met:
  1. canonical implementation lane `RAT-568` is complete,
  2. QA gate `RAT-383` is complete,
  3. fresh RAT-416-specific drift evidence is provided post-fix.

### Unblock Owner/Action
- Owner: control-plane lifecycle maintainer (canonical lane `RAT-568`).
- Action: deliver terminal anti-reopen fix in RAT-568, pass RAT-383 replay gate, then run RAT-594 sweep closeout before reopening RAT-416.
