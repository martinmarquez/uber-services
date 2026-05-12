# RAT-364 Auto-Reopen Rule Fix Spec (2026-05-11)

## Context
`RAT-16` (review gate) is receiving status churn (`done`/`blocked` back to active states) without scope delta, creating false WIP and dependency instability.

Related evidence:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `qa/test-results/rat-8-reopen-revalidation-2026-05-11.md`

## Product Goal Gate
Approved because this change maps directly to trust in execution telemetry and churn-risk reduction (roadmap M4 operational reliability). No net-new feature scope.

## User Story
As a product/operations owner, when an issue reaches a terminal state (`done`/`cancelled`), it must remain terminal unless there is explicit resume intent or a real scope delta, so roadmap status and dependency sequencing stay accurate.

## Scope (In)
1. Terminal-state resume gate in issue transition layer.
2. No-delta reopen suppression for automation-triggered lifecycle transitions.
3. Checkout safety: checkout cannot implicitly reopen terminal issues.
4. Audit provenance fields for status mutations (`change_source`, actor, reason).
5. Regression test coverage for repeated wake/checkout cycles.

## Scope (Out)
1. New lifecycle states.
2. Changes to review-gate business semantics.
3. Broad workflow redesign beyond resume guardrails.

## Acceptance Criteria
1. Given an issue in `done`/`cancelled`, when automation or checkout runs without `resume: true`, status remains unchanged.
2. Given an issue in `done`/`cancelled`, when a human action includes `resume: true` with reason, transition to `todo`/`in_progress` is allowed and actor + reason are logged.
3. Given terminal-finalization events with no comment/scope/blocker/assignment delta, wake/requeue logic does not produce reopen.
4. Given RAT-16 equivalent fixture, two consecutive heartbeat cycles complete without status reopen when no explicit delta exists.
5. QA artifact includes before/after event trace proving no-delta reopen is blocked.

## Delivery Sequence
1. Backend transition guard (hard gate).
2. Automation dedupe + checkout non-mutating behavior.
3. Audit field persistence.
4. QA replay fixture and verification run.
5. PM signoff and unblock parent [RAT-16](/RAT/issues/RAT-16).

## Blockers / Dependencies
- None identified for implementation start.
- If lifecycle semantic expansion is requested, escalate to CEO before merge.

## Go-to-Market / Ops Note
This is an internal execution-integrity fix; no customer-facing release note required.
