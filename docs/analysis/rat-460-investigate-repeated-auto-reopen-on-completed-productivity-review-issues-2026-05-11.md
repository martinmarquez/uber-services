# RAT-460 Investigation: repeated auto-reopen on completed productivity-review issues (2026-05-11)

## Scope
Investigate why completed productivity-review issues keep auto-reopening and define the executable fix path.

## Heartbeat Evidence
- Wake payload for this run: `issue_assigned` on `RAT-460`, no pending comments (`0/0`), no fallback thread fetch required.
- Runtime ownership guardrail executed in this workspace:
  - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
  - Result: `RESULT=BLOCKED_WRONG_REPO`
  - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
- Repository scan reconfirmed this workspace contains product/domain review APIs, but not the owning Paperclip control-plane issue lifecycle engine (`/api/issues` transitions, terminal checkout reopen guard, `issue_status_changed` no-delta dedupe).

## Findings
1. `RAT-460` is not a new defect class; it matches the existing terminal lifecycle drift family already observed across repeated review-issue reopen incidents.
2. The permanent fix surface is outside this repository boundary.
3. Reopen churn will continue until the owning control-plane runtime enforces terminal immutability and no-delta automation suppression.

## Required Upstream Fix
1. Enforce terminal immutability: `done`/`cancelled` cannot reopen unless explicit `resume:true` is present with auditable actor and reason.
2. Make checkout/status-only automation non-mutating for terminal issues without resume intent.
3. Add no-delta wake dedupe for `issue_status_changed`/status-change automation paths.
4. Add regression replay coverage proving repeated wake+checkout cycles do not reopen completed productivity-review issues without explicit resume intent.

## CTO Disposition
- Status recommendation for this workspace issue: `blocked`.
- Unblock owner: Paperclip control-plane lifecycle maintainer (CEO/platform owner).
- Unblock action: ship the upstream lifecycle guardrails and attach replay evidence demonstrating zero implicit reopen events on RAT-460-equivalent scenarios.
