# RAT-394 Heartbeat: RAT-133 auto-reopen regression follow-up (2026-05-11)

## Wake context
- Issue: [RAT-394](/RAT/issues/RAT-394)
- Reason: `issue_assigned`
- Pending comments in wake payload: none (`0/0`)

## Goal gate
- `PRODUCT_BRIEF.md` exists in workspace root, so execution is allowed.

## Findings in this heartbeat
1. Re-validated prior regression lineage artifacts that already isolate this defect class:
- `docs/analysis/rat-361-rat-133-status-auto-reopen-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`

2. Re-scanned the attached repository for control-plane lifecycle mutation paths (`/api/issues` transition engine, checkout reopen gate, wake dedupe paths).
- Result: this workspace contains product app/backend code only; it does not contain the Paperclip control-plane runtime files where terminal-state reopen behavior is implemented.

3. Confirmed active owning implementation lane exists as [RAT-390](/RAT/issues/RAT-390) (status: `in_progress`).

## Decision
- `RAT-394` cannot be fully resolved in this workspace because the required code path is external to the attached repository.
- Execution is blocked on board-controlled workspace attachment and/or reassignment to the runtime owning lane.

## Unblock action
- Owner: `@board`
- Required action:
  - Option A: attach the control-plane runtime workspace that owns issue lifecycle transitions, then keep `RAT-394` assigned for direct patch + regression tests.
  - Option B: transfer `RAT-394` to the runtime lane and track closure through [RAT-390](/RAT/issues/RAT-390).
- Recommendation: Option A for fastest single-thread closure with direct evidence posted on [RAT-394](/RAT/issues/RAT-394).

## Addendum — issue_status_changed wake reconciliation (2026-05-11T18:20-03:00)

### Wake acknowledgement
- Wake reason in this run: `issue_status_changed`.
- Pending comments: none (`0/0`), so no new product-scope delta to process.

### Fresh execution evidence
1. Ran `tools/guardrails/check-rat-830-api-issues-lifecycle-surface.sh`.
- Output captured in `qa/test-results/rat-394-control-plane-surface-check-2026-05-11T1820Z.txt`.
- Result: `STATUS=absent`.
- Detail: `No control-plane /api/issues lifecycle runtime signatures found in server/*`.

2. Ran `tools/guardrails/check-rat-568-done-reopen-scoped-input-surface.sh`.
- Output captured in `qa/test-results/rat-394-done-reopen-surface-check-2026-05-11T1820Z.txt`.
- Result: `RESULT=BLOCKED_WRONG_REPO`.
- Detail: `No control-plane lifecycle runtime signatures found in server/*`.

### Decision (unchanged)
- RAT-394 remains blocked in this repository; required lifecycle mutation path is not present here.
- This heartbeat leaves new timestamped proof, but cannot land the runtime patch from `uber-services`.

### Unblock owner/action
- Owner: `@board`
- Action: attach or route to the control-plane runtime workspace that owns `/api/issues` transition + checkout/wake handlers so the terminal reopen guard can be implemented and replay-verified.
- Escalation: `@board — RAT-394 cannot be implemented from /Users/martinmarquez/uber-services because the owning /api/issues lifecycle runtime is absent. Awaiting your decision.`

## Addendum — issue_children_completed wake (2026-05-12T00:10Z)

### Wake delta handled
- Wake reason: `issue_children_completed`.
- Child review [RAT-992](/RAT/issues/RAT-992) is `done` and confirms productivity, but also confirms unresolved workspace/runtime ownership mismatch.

### Concrete action in this heartbeat
1. Added executable readiness guardrail:
- `tools/guardrails/check-rat-394-regression-readiness.sh`

2. Ran the new check and captured evidence:
- `qa/test-results/rat-394-regression-readiness-2026-05-12T0010Z.txt`
- Result: `STATUS=BLOCKED_WRONG_REPO`
- Detail: `No control-plane lifecycle runtime signatures found in server/*`

### Decision
- RAT-394 remains blocked for implementation in `uber-services` despite child completion.
- Child completion did not provide the missing control-plane runtime lane required to patch `/api/issues` lifecycle reopen behavior.

### Unblock owner/action
- Owner: `@board`
- Action: attach or reroute to the control-plane runtime workspace owning `/api/issues` transition + checkout/wake handlers.
- Escalation: `@board — child completion is acknowledged, but RAT-394 remains blocked on runtime ownership mismatch. Awaiting your decision.`
