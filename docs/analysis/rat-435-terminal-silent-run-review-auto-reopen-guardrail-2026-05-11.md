# RAT-435 Heartbeat: terminal silent-run review auto-reopen guardrail (2026-05-11)

Date: 2026-05-11
Issue: `RAT-435`

## Objective
Implement a guardrail to prevent terminal silent-run review issues from auto-reopening without explicit resume intent.

## Action taken in this heartbeat
1. Added executable ownership/surface check:
   - `tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
2. Ran the check to verify whether this workspace contains the owning control-plane lifecycle runtime.
3. Re-ran direct local route tests to keep minimal executable evidence attached to this heartbeat.

## Direct evidence
- Command:
  - `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
- Result:
  - `RESULT=BLOCKED_WRONG_REPO`
  - `DETAIL=No control-plane lifecycle reopen signatures found in server/*`
  - `EXIT_CODE=2`

- Command:
  - `node --test server/tests/routes.test.js`
- Result:
  - `pass 8, fail 0`
  - Includes route-level `resume` type validation (`invalid_resume_flag`) in current repo scope.

## Decision
`RAT-435` implementation is blocked in this workspace by ownership boundary. This repository does not include the Paperclip control-plane issue lifecycle mutation runtime that can enforce terminal issue reopen behavior (`/api/issues` transition engine, checkout reopen gate, status-change wake dedupe).

## Unblock owner and action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Enforce terminal-state immutability (`done` / `cancelled`) unless explicit `resume:true` with auditable actor/reason.
  2. Prevent checkout and no-delta automation wakes from implicitly reopening terminal issues.
  3. Add direct API/service regression tests for:
     - terminal + no `resume:true` => non-mutating,
     - explicit `resume:true` => reopen allowed and provenance persisted.
