# RAT-803 - RAT-403 unblock spec: control-plane lifecycle flap ownership + replay evidence

Date: 2026-05-11
Issue: `RAT-803`
Related issue: `RAT-403`
Status intent: convert from ambiguous `in_progress` to dependency-blocked until control-plane evidence is attached.

## Goal gate (PRODUCT_BRIEF / ROADMAP)
- Goal alignment: Trust Core Foundation (M1) requires lifecycle integrity and auditable moderation/appeal state transitions.
- Business risk: done/blocked -> in_progress status flap without scope delta erodes trust and creates execution churn.
- Scope guardrail: no net-new feature scope; only unblock path and acceptance evidence definition.

## Problem statement
`RAT-403` continues to auto-reopen to active states despite no new comments and no unblock delta. The owning mutation runtime is the Paperclip control-plane lifecycle engine, which is not present in this workspace.

## User stories
1. As a platform operator, I want terminal and blocked issues to remain stable unless explicit resume/unblock intent exists, so that automation cannot silently corrupt issue lifecycle state.
2. As a product manager, I want replay-grade evidence for lifecycle guardrails, so that I can confidently resume downstream roadmap work without repeated flap regressions.

## Acceptance criteria (must all pass)
1. Terminal resume gate: `done`/`cancelled` issues do not transition to active states without explicit `resume:true` plus actor/reason provenance.
2. Checkout non-mutation: checkout/wake processing on terminal issues cannot mutate lifecycle state absent explicit resume.
3. No-delta wake dedupe: `issue_status_changed` wakes with zero payload delta are consumed/deduped without reopening.
4. Blocked-state protection: dependency-blocked issues remain blocked unless blocker delta is explicit and auditable.
5. Replay evidence package attached in issue thread with:
- event timelines for cases A-E,
- before/after control-plane patch reference,
- integration/regression logs proving reopen count is zero for no-resume/no-delta cases,
- positive-control proof that explicit resume still works.

## Source evidence in current workspace
- `qa/test-results/rat-403-status-flap-reopen-loop-qa-2026-05-11.md`
- `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md`
- `analysis/rat-351-reprocessed-by-day.tsv` (records `RAT-403 blocked -> to_todo` event)

## Ownership and unblock contract
- Unblock owner: CTO / control-plane lifecycle maintainer (runtime owning `/api/issues` transitions).
- Required action: land lifecycle guardrails in owning control-plane runtime and attach replay evidence bundle to `RAT-803` + `RAT-403`.
- PM follow-up after evidence: validate acceptance criteria, then resume `RAT-803` and close or split residuals.

## Prioritization decision
- Maintain roadmap freeze on adjacent lifecycle requests until this unblock evidence exists.
- Reject scope creep: no additional feature intake under this issue.
