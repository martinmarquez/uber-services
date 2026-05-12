# RAT-441 Investigation: recurring auto-reopen drift on closed review issues (RAT-113 pattern) (2026-05-11)

## Scope
Issue: `RAT-441`

Objective: investigate recurring reopen drift on closed review issues, anchored to the `RAT-113` pattern.

## Evidence reviewed
- Wake payload for this heartbeat: `issue_assigned`, no pending comments, no new scope delta.
- Historical artifacts and governance decisions in:
  - `docs/analysis/rat-407-prevent-repeated-reopen-drift-completed-productivity-reviews-2026-05-11.md`
  - `docs/analysis/rat-435-terminal-silent-run-review-auto-reopen-guardrail-2026-05-11.md`
  - `docs/analysis/rat-437-repeated-auto-reopen-completed-review-issues-2026-05-11.md`
- Direct lineage signal in repository telemetry:
  - `analysis/rat-351-reprocessed-by-day.tsv` shows `RAT-113` transitioned `done -> to_todo` on `2026-05-11`.

## Findings
1. `RAT-441` is not a new defect class. It is the same terminal lifecycle integrity drift already observed in prior issues: terminal review issues can be reactivated without explicit resume intent.
2. `RAT-113` provides concrete lineage evidence (`done -> to_todo` churn), matching the repeated reopen family.
3. The assigned workspace (`/Users/martinmarquez/uber-services`) does not contain the owning Paperclip control-plane lifecycle runtime needed to permanently fix reopen behavior (`/api/issues` transition engine, checkout reopen gate, no-delta wake dedupe).

## Decision
`RAT-441` is blocked in this workspace by runtime ownership boundary.

## Unblock owner and required action
- Owner: Paperclip control-plane lifecycle runtime maintainer (`@board`/platform owner).
- Required action:
  1. Enforce terminal-state immutability for `done`/`cancelled` unless explicit `resume:true` with auditable actor/reason.
  2. Make checkout non-mutating for terminal issues when resume intent is absent.
  3. Suppress no-delta `issue_status_changed` wake paths that currently reactivate terminal issues.
  4. Attach replay evidence for RAT-113-equivalent and repeated no-delta wake scenarios proving reopen count remains `0` without `resume:true`.
