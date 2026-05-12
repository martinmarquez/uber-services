# RAT-439 Investigation: stop repeated auto-reopen of completed review issues (2026-05-11)

## Scope
Investigate and stop repeated auto-reopen behavior affecting completed review issues.

## Heartbeat Evidence
- Wake payload for this heartbeat: `issue_assigned` on `RAT-439`, no pending comments (`0/0`).
- Goal gate is satisfied in this workspace (`PRODUCT_BRIEF.md` present).
- Runtime ownership check:
  - Command: `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
  - Result: `RESULT=BLOCKED_WRONG_REPO`
  - Detail: `No control-plane lifecycle reopen signatures found in server/*`
- Repo scan confirms no owning Paperclip issue-lifecycle mutation engine in this workspace (`/api/issues` transitions, checkout reopen gate, status-change wake dedupe).

## Findings
1. RAT-439 matches the existing control-plane lifecycle integrity defect class (terminal review issues drifting back to active states without explicit resume intent).
2. `uber-services` is non-owning scope for the permanent lifecycle fix.
3. Shipping surrogate suppression in this repo would create governance drift and does not eliminate root cause.

## Required Fix (Owning Control-Plane Runtime)
1. Enforce terminal-state immutability: `done`/`cancelled` cannot reopen without explicit `resume:true` and auditable actor/reason.
2. Make checkout non-mutating for terminal issues when resume intent is absent.
3. Dedupe no-delta `issue_status_changed` wakes to prevent repeated auto-reopen loops.
4. Add replay regression tests proving:
   - terminal + automation/no-resume => no reopen,
   - terminal + checkout/no-resume => no mutation,
   - explicit `resume:true` + reason => reopen allowed and audited.

## CTO Disposition
- Issue status recommendation: `blocked`.
- Unblock owner: Paperclip control-plane lifecycle maintainer (CEO/platform owner).
- Unblock action: implement lifecycle guardrails in owning runtime and attach before/after replay evidence for RAT-439-equivalent traces.

## Reopen Delta Addendum (2026-05-11)
- Reopen trigger comment: `c154acee-b669-4d04-86dc-25a35a21cc5c`.
- Direction received: treat RAT-439 as duplicate lifecycle/status-drift lane; canonical remediation is `RAT-568` and cluster sweep tracking is `RAT-594`.
- Updated CTO execution posture:
  - close RAT-439 as duplicate lane,
  - do not run parallel implementation under RAT-439,
  - reopen only with fresh issue-specific drift evidence after `RAT-568` implementation and QA gate `RAT-383` completion.

## Status-Change Reconciliation Addendum (2026-05-11)
- Wake reason: `issue_status_changed` with pending comments `0/0` and no new scoped delta.
- Observed behavior: issue state drifted back to `in_progress` despite prior duplicate-lane closure posture.
- Disposition reaffirmed: `blocked` (duplicate lane; no local implementation path in `uber-services`).
- Unblock owner/action unchanged:
  - Owner: Paperclip control-plane lifecycle runtime maintainer.
  - Action: land `RAT-568` guardrails, pass QA gate `RAT-383`, then re-evaluate RAT-439 only on fresh post-fix issue-specific drift evidence.
