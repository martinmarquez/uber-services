# RAT-413 Heartbeat: guardrail anti-reopen terminal + tests directos (seguimiento RAT-366)

Date: 2026-05-11
Issue: `RAT-413`

## Objective
Implement terminal anti-reopen guardrail with direct executable tests, per RAT-366 follow-up.

## Action taken in this heartbeat
1. Added executable repo-scope check: `tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`.
2. Ran the check to verify whether this workspace contains the owning control-plane issue lifecycle runtime.
3. Ran direct backend contract test for existing `resume` validation behavior in this repository.

## Direct evidence
- Command:
  - `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
- Result:
  - `RESULT=BLOCKED_WRONG_REPO`
  - `DETAIL=No control-plane issue lifecycle runtime signatures found in server/*`
  - `EXIT_CODE=2`

- Command:
  - `node --test server/tests/routes.test.js`
- Result:
  - `pass 8, fail 0`
  - Includes route-level validation case: `invalid_resume_flag` for non-boolean `resume`.

## Decision
`RAT-413` implementation is blocked in this workspace by ownership boundary. This repo contains product-domain review/appeal logic, not the Paperclip control-plane issue lifecycle runtime (`/api/issues` transition engine, terminal checkout reopen guard, status-change wake dedupe).

## Unblock owner and action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Implement terminal-state guard (`done`/`cancelled` immutable unless explicit `resume:true`).
  2. Prevent checkout from implicitly reopening terminal issues.
  3. Add direct API/service regression tests proving both behaviors.

## Reopen delta (2026-05-11)
Latest thread comment (`62cdb084-6e86-4d8e-8fd6-e020967e826e`) classifies this lane as Wave-1 stale sweep duplicate.

Canonical routing is confirmed:
- Implementation lane: `RAT-568`
- Cluster execution sweep: `RAT-594`
- QA gate: `RAT-383`

Lifecycle decision for `RAT-413`:
- Keep this lane non-implementing/duplicate in this workspace.
- Re-open only with fresh issue-specific drift evidence after `RAT-568` implementation and `RAT-383` completion.

## Heartbeat update (2026-05-11, reassignment correction)
Ownership correction comment received: anti-reopen runtime guardrail implementation was reassigned to this lane owner for code + tests.

Concrete action completed:
1. Added direct state-machine regression case in `tools/guardrails/issueLifecycleGuard.test.js`:
   - `checkout automation cannot implicitly reopen terminal issue without resume`
   - proves terminal `cancelled -> in_progress` is blocked without explicit `resume:true`.
2. Added direct consecutive-heartbeat regression case:
   - `consecutive terminal no-delta heartbeats are both deduped`
   - proves repeated no-delta wake attempts stay deduped and status mutation remains blocked without resume.
3. Revalidated the direct executable suite:
   - `node --test tools/guardrails/issueLifecycleGuard.test.js`
   - result: `pass 26, fail 0`.
4. Added explicit terminal-reopen negative path for checkout source:
   - `terminal issue cannot reopen with checkout source even when resume requested`
   - proves `resumeSource=issue_checkout` is rejected (`resume_source_not_allowed_for_terminal_reopen`) even with actor + reason.
4. Added explicit terminal-reopen negative path for `issue_checkout` source with explicit resume:
   - proves `issue_checkout` stays rejected (`resume_source_not_allowed_for_terminal_reopen`) even with actor + reason.

Note:
- Runtime surface guard check still reports `RESULT=BLOCKED_WRONG_REPO` for control-plane `/api/issues` engine in `server/*`.
- This heartbeat delivers executable guardrail evidence in the shared guard module and keeps canonical implementation routing unchanged (`RAT-568` / `RAT-594` / `RAT-383`).

## Child completion and final disposition (2026-05-11)
Child issue `RAT-857` completed with outcome `productive` and no new blocking security defect for the reviewed scope.

Final disposition for `RAT-413`:
- Close this lane as non-canonical implementation path (duplicate/follow-up evidence lane).
- Canonical owner path remains:
  - Implementation: `RAT-568`
  - Sweep: `RAT-594`
  - QA gate: `RAT-383`
- Reopen condition:
  - Only if new issue-specific drift appears after canonical rollout evidence.

## State correction handoff (RAT-556, 2026-05-11)
Thread comment `2b8d8302-56e9-4add-b82e-388d840386c7` moved the issue from `in_progress` to `todo` due to stale execution handle (>2h).

Assignee next-action handoff:
- Re-checkout `RAT-413` explicitly when resuming work.
- Keep this lane closed as non-canonical/duplicate unless new post-rollout drift evidence exists.
- If new drift appears, open follow-up against canonical owner path (`RAT-568`/`RAT-594`/`RAT-383`) and reference this artifact.

## Child reviews consolidated (2026-05-12)
Additional productivity review child `RAT-976` completed with verdict `ACCEPTABLE` and no new application-security defect.

Consolidated review outcome across children:
- `RAT-857`: productive, no new blocking security defect.
- `RAT-976`: acceptable productivity, lifecycle-state drift pattern confirmed.

Final lane handling:
- Keep `RAT-413` as a closed evidence/triage lane, not an active implementation lane.
- Canonical execution remains `RAT-568` + `RAT-594` + `RAT-383`.
- Reopen only with new post-rollout drift evidence tied directly to this issue.
