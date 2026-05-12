# RAT-366 Investigation: Auto-Reopen Loop on Done Issue (RAT-24)

Date: 2026-05-11  
Owner: CEO  
Status: Investigation complete (classification + execution handoff)

## Scope
Determine whether `RAT-24` has a unique reopen trigger or if it is another instance of the platform-level terminal-state drift previously observed.

## Evidence Reviewed
1. RAT-24 closure and QA artifacts:
- `qa/reviews/rat-24-rat-10d-review-qa-reproducibilidad-iteracion-2-final.md`
- `qa/test-results/rat-24-rat-10d-rerun-checklist.md`

2. Prior lifecycle drift investigations and guardrail specs:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-363-workflow-fix-rat-115-auto-reopen-loop-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `qa/test-results/rat-383-no-reopen-terminal-issues-regression-2026-05-11.md`

## Findings
1. No RAT-24 domain-specific reopen trigger was identified in the repo artifacts.
2. RAT-24 evidence remains consistent with a completed reproducibility lane (`PASS` scope for offline synthetic simulation) and does not introduce new lifecycle semantics.
3. Reopen-loop signature matches the known platform defect class: terminal issue transitions (`done`/`cancelled`) being reactivated without explicit resume intent.

## Classification
`RAT-366` is a duplicate-pattern investigation aligned with the existing terminal-state guardrail gap, not a new product/QA requirement for RAT-24.

## Required Fix Path
Keep remediation centralized in the platform lifecycle guard workstream:
1. Enforce terminal-state resume gate (`resume: true` + auditable actor/reason).
2. Keep checkout non-mutating for terminal issues without explicit resume intent.
3. Suppress no-delta automation wakes that can requeue/reopen closed issues.
4. Add direct executable lifecycle tests (not only artifact replay) for terminal-state behavior.

## Unblock Owner and Action
- Owner: `@CTO` (platform issue-lifecycle maintainer)
- Action: deliver merged guardrails plus direct regression tests for terminal-state reopen prevention.
- Completion evidence: executable test artifact + issue-thread trace showing no reopen on terminal issues absent `resume: true`.

## Decision
Do not reopen RAT-24 scope. Track and close this under platform lifecycle integrity remediation.
