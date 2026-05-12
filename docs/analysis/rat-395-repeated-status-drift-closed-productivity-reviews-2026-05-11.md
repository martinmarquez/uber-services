# RAT-395 Investigation: repeated status drift on closed productivity-review issues (2026-05-11)

## Scope
Issue: `RAT-395`

Objective: explain repeated reopen/status drift on closed productivity-review issues and define executable unblock path.

## Findings
1. This workspace (`/Users/martinmarquez/uber-services`) does not contain the Paperclip control-plane issue lifecycle runtime (`/api/issues` transition engine, checkout reopen gate, wake dedupe).
2. Reopen behavior pattern matches previously documented platform-level lifecycle drift investigations, not domain/service-level review appeal logic.
3. Existing rule intent is already clear across prior artifacts: terminal issues (`done`/`cancelled`) must not reopen without explicit `resume: true` and auditable reason.

## Evidence
- Prior defect lineage and guardrail specs:
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
  - `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md`
  - `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
  - `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`
- Repo scan in this heartbeat surfaced only application-domain reopen logic (`server/src/domain/reviewService.js`) and tests for review appeals, not issue tracker lifecycle mutations.

## Decision
Treat `RAT-395` as a control-plane lifecycle integrity defect. Do not reopen or re-execute closed productivity-review domain tasks as workaround.

## Blocker and Unblock Contract
`RAT-395` is blocked in this repository.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Enforce terminal-state transition guard: `done`/`cancelled` cannot reopen without explicit `resume: true`.
  2. Enforce checkout safety: checkout cannot implicitly reopen terminal issues.
  3. Add no-delta wake suppression for status-only automation events.
  4. Attach replay evidence demonstrating:
     - terminal + automation/no-resume => no reopen,
     - explicit `resume:true` + reason => reopen allowed,
     - no-delta status-change wake => no reopen churn.

## Next Step
After control-plane owner ships the patch + replay evidence, rerun the replay matrix for RAT-395 family and close the issue.
