# RAT-398 Investigation: repeated status flip/re-wake loop after issue completion (RAT-141)

Date: 2026-05-11  
Issue: `RAT-398` (high priority)  
Reference completion lane: `RAT-141`

## Objective
Explain why completion-state issues can re-enter active lifecycle via repeated status flip/re-wake behavior, and define the concrete unblock path.

## Evidence summary
1. The defect class is already reproduced across multiple issues in this company and documented with timeline-level detail:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-371-rat-244-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`

2. Those investigations consistently show:
- automation wake reason `issue_status_changed`,
- terminal issues (`done`/`cancelled`) being reactivated without new scope/comment/blocker deltas,
- repeated human correction cycles back to terminal state.

3. This repository (`/Users/martinmarquez/uber-services`) does not contain the owning Paperclip control-plane lifecycle engine responsible for:
- issue transition mutation rules,
- checkout side-effect behavior on terminal issues,
- wake dedupe policy for no-delta finalization transitions.

## Diagnosis
High-confidence root cause remains control-plane lifecycle drift (transition + wake/check-out paths), not application-domain logic in this repo.  
RAT-398 is the same reliability defect family as RAT-355/RAT-371, now observed in the RAT-141 completion lineage.

## Blocker status
`RAT-398` is blocked in this workspace due to ownership boundary.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
1. Enforce terminal resume gate: no transition out of `done`/`cancelled` without explicit `resume: true` + actor/reason.
2. Enforce checkout non-mutation for terminal issues when `resume` is absent.
3. Dedupe `issue_status_changed` wakes for terminal-only/no-delta transitions.
4. Persist transition provenance (`change_source`, `change_reason`) for all lifecycle mutations.
5. Attach replay evidence for RAT-141-equivalent scenario proving no auto-reopen under repeated wakes.

## Verification required from owner
1. Event trace of each status mutation in the replay window (before/after patch).
2. Integration test showing terminal issue remains terminal without explicit resume.
3. Negative replay proving repeated status-change wakes do not reopen completed issues.
4. Positive replay proving explicit `resume: true` can reopen with auditable metadata.

## Next action
Route implementation to control-plane owner and keep RAT-398 blocked until patch evidence is attached; then run targeted regression verification and close.
