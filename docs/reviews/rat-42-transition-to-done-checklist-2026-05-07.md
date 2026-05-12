# RAT-42 Transition-to-Done Checklist (2026-05-07)

Issue: RAT-42  
Owner: CTO assignee  
Purpose: close long-active-duration alert with explicit final action log.

## Required Thread Update (single comment)
Post this exact closure packet in RAT-42:
1. Link: `docs/reviews/rat-42-final-closure-note-2026-05-07.md`
2. Link: `docs/reviews/rat-42-closure-evidence-bundle-2026-05-07.md`
3. Statement: no blocker, security/trust gate clean for RAT-42 scope.
4. Residual action (non-blocking): Backend owner to expose `status` + `riskScore` and contract tests.

## Status Transition
- Change RAT-42 from `in_progress` -> `done` immediately after posting the closure packet.

## If status cannot be moved to done
- Set RAT-42 -> `blocked` with:
  - Unblock owner: board/platform operator with issue-state permission.
  - Unblock action: apply `done` transition after verifying closure packet links above.

## Completion Signal
- Add one final thread line: `RAT-42 closed with closure packet + explicit non-blocking follow-up owner/action.`
