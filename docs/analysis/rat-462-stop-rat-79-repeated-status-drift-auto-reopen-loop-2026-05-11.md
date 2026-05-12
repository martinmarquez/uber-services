# RAT-462 Heartbeat: Stop RAT-79 repeated status-drift auto-reopen loop (2026-05-11)

## Objective
Stop repeated status-drift auto-reopen churn for `RAT-79`.

## What I validated in this heartbeat
1. Wake payload has no new comments (`0/0`), so there is no new execution delta to justify reopening behavior.
2. Repo scan confirms this workspace does not contain the owning Paperclip control-plane issue lifecycle runtime (`/api/issues` transition engine, checkout reopen guard, wake dedupe path).
3. Existing artifacts in this repo already define the required guardrail contract for this defect family:
- terminal issues (`done`/`cancelled`) must not reopen without explicit `resume:true` + actor/reason provenance,
- checkout/status-only/no-delta automation must be non-mutating for terminal issues.

## Decision
`RAT-462` is a control-plane lifecycle integrity fix request. It cannot be directly patched in this repository without crossing ownership boundaries.

## Required unblock action (external owner)
Control-plane lifecycle maintainer must ship all three controls in the owning runtime:
1. Terminal transition gate: block reopen from `done`/`cancelled` unless explicit `resume:true` with auditable provenance.
2. Checkout guard: checkout must not implicitly reopen terminal issues.
3. No-delta dedupe: suppress repeated `issue_status_changed` wake churn when there is no scope/comment/blocker/assignee delta.

## Verification required before closure
Attach replay/API evidence proving:
1. terminal + automation/no-resume => no reopen,
2. terminal + checkout/no-resume => no reopen,
3. explicit `resume:true` + reason => reopen allowed and audited,
4. repeated no-delta wakes => no reopen loop for RAT-79-equivalent fixture.
