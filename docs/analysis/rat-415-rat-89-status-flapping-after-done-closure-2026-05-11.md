# RAT-415 Investigation: RAT-89 status flapping after `done` closure (2026-05-11)

## Scope
Issue: `RAT-415`

Objective: determine why `RAT-89` re-enters `in_progress` after closure and define the executable corrective path.

## Findings
1. `RAT-89` was previously closed with a false-positive verdict backed by terminal run evidence (`succeeded`) in the artifact `docs/reviews/rat-89-ceo-review-silent-active-run-ceo.md`.
2. Reopen/flapping behavior matches the same no-delta terminal-state drift family already observed in `RAT-195`, `RAT-233`, and related follow-ups.
3. This workspace (`/Users/martinmarquez/uber-services`) is not the owner of Paperclip issue-lifecycle transition surfaces (`/api/issues` mutation engine, checkout reopen gate, wake dedupe).

## Root-Cause Class
Control-plane lifecycle integrity defect (`done -> in_progress` reopen without explicit `resume:true`), not application-domain logic in this repository.

## Decision
Do not rework RAT-89 domain review content. Treat RAT-89 flapping as platform lifecycle drift and route correction to control-plane lifecycle owners.

## Unblock Owner/Action
- Owner: control-plane lifecycle runtime maintainer (same ownership lane as RAT-414 family).
- Action:
  1. enforce terminal immutability for `done`/`cancelled` unless explicit `resume:true`,
  2. block implicit reopen during checkout/wake automation,
  3. add no-delta status-change dedupe,
  4. publish replay evidence using a RAT-89-equivalent terminal issue.

## Next Step
Keep `RAT-415` blocked on control-plane lifecycle remediation evidence; re-close any no-delta RAT-89 reopen events until runtime fix lands.

## Resume Delta (issue_reopened_via_comment, 2026-05-11)
- Thread comment `2f8d8511-bdb4-4df6-a462-91abdbce3744` classifies RAT-415 as Wave-1 stale-sweep duplicate lane.
- Canonical remediation lanes:
  - implementation: `RAT-568`,
  - cluster execution sweep: `RAT-594`,
  - QA completion gate before any reopen validation: `RAT-383`.
- RAT-415 execution policy is therefore non-implementing in this workspace.
- Reopen RAT-415 only with fresh RAT-415-specific drift evidence after RAT-568 implementation plus RAT-383 completion.
