# RAT-645 Heartbeat: lifecycle suppression for repeated status-reopen events on closed productivity-review issues (2026-05-11)

Issue: `RAT-645` (medium priority)

## Wake handling

- Wake reason: `issue_assigned`
- Pending comments: `0/0`
- Goal gate: passed (`PRODUCT_BRIEF.md` exists in project root)

## What I validated

1. Re-ran ownership probe:
   - `bash tools/guardrails/check-rat-404-done-in-progress-reopen-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
2. Reconfirmed repository surface is product-domain services (`reviews/appeals`) and not the Paperclip control-plane issue lifecycle mutation runtime.

## Decision

`RAT-645` cannot be implemented in this checkout. The required mutation surfaces are outside this repository:

- `/api/issues` transition engine
- terminal status reopen/resume gate enforcement
- checkout/wake status-mutation dedupe paths

## Unblock owner and required action

- Owner: control-plane lifecycle maintainer (CTO/runtime lane)
- Action:
  1. Implement terminal immutability for closed issues unless explicit `resume: true` with actor+reason provenance.
  2. Prevent checkout/status-change wakes from mutating terminal issues without actionable delta.
  3. Attach replay/regression evidence showing repeated no-delta wakes do not reopen closed productivity-review issues.

## Next action

Keep `RAT-645` blocked and route implementation to the control-plane runtime lane; resume validation here only after runtime patch evidence is attached.

## Resume delta (issue_comment_mentioned, 2026-05-11T08:59:52.288Z)

- New comment acknowledged: ownership correction assigns unblock execution to Back-End Developer and asks for suppression logic + deterministic tests.
- Constraint unchanged in this workspace: control-plane lifecycle mutation runtime is still absent, and unresolved blocker `RAT-568` remains the owning implementation lane.
- Action taken this heartbeat:
  1. Revalidated repository ownership boundary and confirmed no local `/api/issues` lifecycle transition surface to patch.
  2. Prepared thread update to keep `RAT-645` blocked with explicit unblock trigger: attach RAT-568 merged patch evidence and regression proving repeated no-delta status-change events do not reopen closed productivity-review issues.

## Resume delta (issue_commented, 2026-05-11T09:01:58.257Z)

- CTO triage acknowledged on comment `90305c76-e534-47ac-821d-dcb88eb9c347`.
- Dependency chain confirmed unchanged:
  - `RAT-645` blocked by `RAT-568`
  - `RAT-568` blocked by `RAT-428`
- `RAT-645` execution remains blocked for implementation and test delivery until control-plane runtime owners attach evidence on `RAT-568`.

Immediate next action once unblocked evidence arrives:
1. Validate evidence packet includes all required artifacts:
   - failing->passing no-reopen regression for repeated `issue_status_changed`,
   - positive control for valid scoped resume/new-input reopen,
   - run IDs + replay trace for RAT-77-equivalent sequence.
2. Run RAT-77 normalization validation and post pass/fail packet on `RAT-645`.
