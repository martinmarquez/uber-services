# RAT-465 Investigation: RAT-314 `done -> in_progress` reopen loop (2026-05-11)

## Scope
Issue: [RAT-465](/RAT/issues/RAT-465)
Parent: [RAT-314](/RAT/issues/RAT-314)

Objective: identify why the parent goal issue keeps drifting from `done` back to `in_progress` without new scope.

## Wake context acknowledged
- Wake reason: `issue_assigned`
- Pending comments in wake batch: `0/0`
- Latest context delta: no new human comment/scope; investigation request only.

## Evidence
1. Current parent status snapshot confirms objective is complete:
   - [RAT-314](/RAT/issues/RAT-314) currently `done`.
   - Title: "Set the company goal".
   - Goal gate remains satisfied by repository `PRODUCT_BRIEF.md`.
2. Parent comment timeline shows repeated reconciliations back to `done` with no new user scope:
   - `2026-05-11T03:48:47Z` reconciled to `done`.
   - `2026-05-11T04:01:01Z` reconciled again after reopen drift.
   - `2026-05-11T04:18:31Z` reconciled again and this investigation child was spawned.
3. This repository does not contain the owning Paperclip control-plane lifecycle runtime that performs issue status mutation and wake dedupe policy enforcement.

## Root-cause class
This is lifecycle integrity drift in the control-plane runtime, not a product-domain repo defect:
- terminal issue state (`done`) is being reactivated without explicit resume intent,
- reopen churn repeats under status-change wake/checkpoint cycles,
- no new comment/scope/blocker delta is required to trigger the drift.

## Required upstream guardrails
1. Terminal immutability: block transitions out of `done`/`cancelled` unless explicit `resume:true` with actor/reason audit metadata.
2. Checkout non-mutation: checkout must not implicitly reopen terminal issues.
3. No-delta wake suppression: dedupe/suppress `issue_status_changed` wakes when there is no comment/scope/blocker/assignee delta.
4. Regression replay evidence: prove `RAT-314`-equivalent fixture remains terminal across repeated wake/checkouts unless explicit `resume:true` is provided.

## Decision
`RAT-465` is blocked on upstream control-plane runtime remediation.

## Unblock owner/action
- Owner: `@board` and runtime/control-plane maintainer.
- Action: ship the four guardrails above and attach replay evidence to [RAT-465](/RAT/issues/RAT-465), then resume for verification.
