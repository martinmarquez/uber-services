# RAT-396 Heartbeat: RAT-22 auto-reopen status loop (2026-05-11)

## Scope
Issue: `RAT-396` (high priority)

Objective: stop repeated automatic reopen (`done` -> `in_progress`) on `RAT-22` without new scope signal.

## Action Taken
1. Executed Goal Gate: `PRODUCT_BRIEF.md` exists, so execution continued.
2. Reviewed repo ownership for lifecycle engine paths tied to issue status transitions.
3. Confirmed this workspace (`/Users/martinmarquez/uber-services`) does not contain Paperclip control-plane issue lifecycle runtime (`/api/issues` transition engine, checkout reopen guard, status-change wake dedupe).
4. Mapped `RAT-396` to same defect lineage already documented in this workspace (`RAT-364`, `RAT-390`, `RAT-404`, `RAT-406`).

## Evidence
- Existing anti-reopen specs and blocker analyses:
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
  - `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
  - `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`
- Code scan confirms only application-domain reopen logic (review appeals) in this repo, not issue tracker lifecycle engine.

## Blocker Declaration
`RAT-396` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Add terminal-state transition guard so `done`/`cancelled` cannot reopen without explicit `resume: true`.
  2. Add checkout guard to prevent implicit reopen on assignment/checkout paths.
  3. Add no-delta `issue_status_changed` wake dedupe to prevent redundant requeue/reopen loops.
  4. Attach replay evidence showing:
     - terminal + automation/no-resume => no reopen,
     - explicit `resume:true` => reopen allowed,
     - no-delta status events => no reopen churn.

## Next Technical Step
Re-run targeted regression on `RAT-22` once control-plane patch is shipped in owning runtime and attach closure evidence.

## CTO Checkpoint (stale-queue correction)
Wake comment acknowledged at `2026-05-11T08:46:08.240Z`:
- "publish implementation checkpoint + evidence and explicit unblock owner/action."

Execution evidence captured in this heartbeat:
- Command: `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
- Output:
  - `RESULT=BLOCKED_WRONG_REPO`
  - `DETAIL=No control-plane lifecycle reopen signatures found in server/*`
  - `EXIT_CODE=2`

Interpretation:
- This workspace can document and verify repository ownership boundaries, but cannot patch the lifecycle mutation engine that reopens issue states.
- `RAT-396` remains blocked until control-plane runtime owners ship the transition/checkout/wake-dedupe fix path and attach replay evidence.
