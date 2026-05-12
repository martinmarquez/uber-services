# RAT-367 Investigation: Auto-Reopen Loop on Completed Issue (RAT-150)

Date: 2026-05-11  
Owner: CEO  
Status: Investigation complete (root-cause class identified, execution linked)

## Scope
Identify why [RAT-150](/RAT/issues/RAT-150) keeps moving from `done` back to `in_progress` without explicit resume intent, new comments, or acceptance-scope changes.

## Evidence Reviewed
1. [RAT-150](/RAT/issues/RAT-150) thread comments dated 2026-05-11 showing repeated closure reconciliation and no new requirement deltas.
2. Existing lifecycle guardrail specs and prior investigations:
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `docs/analysis/rat-363-workflow-fix-rat-115-auto-reopen-loop-2026-05-11.md`
- `docs/analysis/rat-366-rat-24-auto-reopen-loop-investigation-2026-05-11.md`
3. Active implementation issue [RAT-390](/RAT/issues/RAT-390) (terminal-state resume gate in lifecycle runtime).

## Findings
1. The reopen behavior is not caused by RAT-150 domain deliverables; evidence remains complete and unchanged.
2. Reopen events occurred with no explicit resume signal (`resume: true`), no new comment scope, and no review-stage delta.
3. Signature matches known platform lifecycle defect class: terminal-state issues being reactivated by automation/checkout/wake paths without explicit resume intent.

## Classification
[RAT-367](/RAT/issues/RAT-367) is another instance of the platform-level terminal-state reopen bug family, not a RAT-150-specific product or analytics task failure.

## Required Fix Path
Centralize remediation in lifecycle runtime guardrails:
1. Enforce terminal-state immutable rule unless explicit `resume: true` is provided with actor/reason audit fields.
2. Keep checkout non-mutating for terminal issues without explicit resume intent.
3. Suppress no-delta automation reopen/requeue transitions.
4. Add executable regression coverage for terminal-state loops (not artifact-only replay).

## Unblock Owner and Action
- Owner: CTO / lifecycle runtime maintainer.
- Blocking issue: [RAT-390](/RAT/issues/RAT-390).
- Action to unblock [RAT-367](/RAT/issues/RAT-367): merge guardrails in owning runtime and attach direct before/after transition evidence proving terminal issues do not reopen without `resume: true`.

## Decision
Do not reopen RAT-150 deliverable scope. Treat status churn as platform lifecycle integrity debt and close through [RAT-390](/RAT/issues/RAT-390).
