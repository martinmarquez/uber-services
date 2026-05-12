# RAT-443 Investigation: fix RAT-189 status flapping after completion (2026-05-11)

## Wake Acknowledgement
- Wake reason: `issue_assigned`
- Issue: `RAT-443`
- Pending comments in wake payload: `0/0` (no new user/board direction in this heartbeat)

## Goal Gate
- Verified company goal artifact exists: `PRODUCT_BRIEF.md` present at repo root on 2026-05-11.

## Scope
Investigate and apply a code fix for RAT-189 status flapping after completion.

## What Was Executed
1. Searched this workspace for ownership surfaces that can mutate board issue lifecycle (`/api/issues`, checkout reopen path, `issue_status_changed` dedupe path).
2. Added and ran executable ownership probe:
   - `tools/guardrails/check-rat-443-rat-189-status-flap-surface.sh`
3. Probe result:
   - `RESULT=BLOCKED_WRONG_REPO`
   - `DETAIL=No control-plane issue lifecycle runtime signatures found in server/*`
4. Hardened and re-ran probe; a broad scan initially matched local guardrail artifacts in `tools/guardrails` (false-positive ownership signal).
5. Corrected probe scope to runtime server surfaces only and re-ran.
6. Re-run result:
   - `RESULT=BLOCKED_WRONG_REPO`
   - `DETAIL=No control-plane issue lifecycle runtime signatures found in server/*`

## Findings
1. This repository contains product-domain review lifecycle logic (`/api/v1/reviews`, appeals, moderation), not Paperclip control-plane issue lifecycle mutation endpoints.
2. RAT-189 flapping (`done`/completion state drifting back to active states) is in the control-plane lifecycle runtime ownership lane.
3. Therefore, a direct code fix for RAT-189 flapping cannot be completed in this workspace without switching to the runtime owner repository.

## Durable Progress Left In This Heartbeat
- Added executable guardrail probe for this issue:
  - `tools/guardrails/check-rat-443-rat-189-status-flap-surface.sh`
- Tightened probe matching so ownership checks do not pass on documentation artifacts.
- Captured blocker evidence in this artifact for future audit and handoff.

## Unblock Owner And Action
- Owner: `@CTO` / control-plane lifecycle runtime maintainer.
- Action:
  1. Implement terminal-state immutability for issue statuses (`done`/`cancelled`) unless explicit `resume: true`.
  2. Prevent implicit reopen in checkout/wake automation.
  3. Add no-delta dedupe for `issue_status_changed` wake events.
  4. Attach replay evidence on RAT-189-equivalent traces.

## Next Action
Move RAT-443 to `blocked` with the unblock owner/action above, then execute the patch in the owning control-plane runtime repository.

## Blocked State Contract
- `RAT-443` must remain `blocked` in this workspace until the runtime owner posts:
  1. commit/reference proving terminal-state immutability (`done`/`cancelled` require explicit `resume:true`),
  2. commit/reference proving no implicit reopen through checkout/wake automation,
  3. replay evidence showing RAT-189-equivalent traces remain terminal without new actionable delta.
