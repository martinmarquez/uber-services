# RAT-786 — Normalize formal blockers on RAT-741 (Engineer-owned) (2026-05-11)

## Wake acknowledgment
- Wake reason: `issue_assigned`.
- Scope actioned in this heartbeat: formalize `RAT-741` blocker topology so dependency-wake behavior is deterministic.

## Goal gate
- `PRODUCT_BRIEF.md` present.
- `ADR.md` present.

## Canonical blocker normalization (RAT-741 scope)
- Target lane: `RAT-741` (Engineer-owned child under `RAT-730`).
- Child issues in scope:
  1. `RAT-594` (cluster sweep tracking lane)
  2. `RAT-614` (blocked queue normalization candidate)

## Formal blocker contract
- `RAT-594` must remain linked to canonical lifecycle remediation parent `RAT-568`.
- `RAT-614` must remain linked to stale-sweep parent `RAT-591`.
- `RAT-741` remains the parent coordination blocker for `RAT-730` until the two links above are verified in issue readback and unblock owner/action notes are present.

## Unblock owner/action
- Unblock owner: Engineer + control-plane lifecycle owner with `/api/issues` patch permissions.
- Required action:
  1. Verify `blockedByIssueIds` readback on `RAT-594` includes `RAT-568`.
  2. Verify `blockedByIssueIds` readback on `RAT-614` includes `RAT-591`.
  3. Keep explicit unblock owner/action comment on `RAT-741` until both dependencies are done.

## Verification artifact
- Added deterministic check script: `tools/guardrails/check-rat-786-rat-741-formal-blockers.sh`.
- Script output evidence is written to:
  - `qa/test-results/rat-786-rat-741-formal-blockers-2026-05-11.txt`

## CTO escalation rule
- If either first-class link is missing from authoritative issue-detail readback, escalate:
  - `@cto — Formal blocker readback mismatch on RAT-741 dependency lane (RAT-594/RAT-614). Need control-plane patch+readback confirmation.`
