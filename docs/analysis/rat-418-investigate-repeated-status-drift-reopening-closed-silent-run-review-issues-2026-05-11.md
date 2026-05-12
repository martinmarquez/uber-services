# RAT-418 Investigation: repeated status drift reopening closed silent-run review issues (2026-05-11)

## Scope
Issue: `RAT-418`

Objective: determine whether repeated reopen/status drift on closed silent-run review issues is a new defect or the same known lifecycle integrity class.

## Findings
1. In this workspace (`/Users/martinmarquez/uber-services`), only product-domain review lifecycle code is present (`server/src/domain/reviewService.js`), including explicit reopen guards (`resume === true`) for appeal flows.
2. The owning Paperclip control-plane issue lifecycle runtime (`/api/issues` status transition engine, checkout reopen gate, status-change wake dedupe) is not present in this repository.
3. RAT-418 symptom pattern matches already documented control-plane defect lineage in this repo (`RAT-355`, `RAT-395`, `RAT-406`, `RAT-411`, `RAT-416`): terminal issues drifting back to active without explicit, auditable resume intent.

## Root-Cause Class
Control-plane lifecycle integrity defect.

Closed issue states (`done`/`cancelled`) are reopening due to runtime transition drift outside this repository boundary.

## Decision
Treat `RAT-418` as the same platform reliability lane already in progress. Do not implement local workaround logic in `uber-services` to suppress control-plane lifecycle defects.

## Blocker Contract
`RAT-418` is blocked in this workspace.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Enforce terminal immutability: `done`/`cancelled` cannot reopen without explicit `resume: true`.
  2. Prevent checkout and no-delta status-change automation from implicitly reopening terminal issues.
  3. Add replay regression coverage for repeated wake/checkout cycles.
  4. Attach evidence proving:
     - terminal + automation/no-resume => no reopen,
     - explicit `resume:true` + reason => reopen allowed,
     - no-delta status-change wake => no reopen churn.

## Next Action
Keep affected silent-run review issues terminal unless a human actor provides explicit scoped `resume:true` intent with reason.

## Reopen Delta Addendum (2026-05-11)
- Latest thread comment (`c2197411-0aa2-4711-9901-f008e488a8e5`) classifies RAT-418 as Wave-1 stale sweep duplicate closure.
- Canonical remediation remains:
  - implementation lane: `RAT-568`,
  - cluster sweep tracking: `RAT-594`,
  - QA completion gate: `RAT-383`.
- RAT-418 must stay closed/blocked as duplicate in this workspace.
- Reopen RAT-418 only on fresh RAT-418-specific drift evidence after RAT-568 implementation and RAT-383 completion.

## Updated Next Action
Do not execute independent implementation under RAT-418. Track progress in RAT-568 and RAT-594, then validate closeout against RAT-383 evidence.
