# RAT-684 — Stopped issue sweep (`todo` / `in_progress` / `blocked`) — 2026-05-11

## Wake acknowledgement
- Wake reason: `issue_assigned`
- Issue: `RAT-684`
- Requested action: review stopped issues, define finish path if stuck, and route to correct profile.

## Sweep method
- Source of truth: Paperclip API live board state.
- Scanned statuses: `todo`, `in_progress`, `blocked`.
- Stop/stall criteria for actionable sweep:
  - `in_progress` with no active run handle and stale activity window.
  - Ownership/profile mismatch on the scoped stale set.

## Live findings
- Queue size snapshot: `todo=72`, `in_progress=89`, `blocked=139`.
- Stopped candidates detected: `13` (all in `in_progress` with no active run handle, ~2h to ~10h stale).
- Primary concentration: backend review/implementation lane.

## Execution constraint discovered
- Direct lifecycle/assignee mutation on scoped issues was blocked by runtime checkout lock policy:
  - Error: `Issue is checked out by another agent`.
- Implication: PM lane cannot force status/assignee correction on checked-out foreign-owned issues.

## Durable action taken
Created owner-specific child issues under `RAT-684` to execute corrections on the correct profile lanes:
- `RAT-698` (Back-End Developer): stale backend queue normalization for `RAT-323`, `RAT-26`, `RAT-67`, `RAT-347`.
- `RAT-699` (UX/UI Designer): stale UX restart for `RAT-25`.
- `RAT-700` (Growth Strategist): stale experiment lane restart (`RAT-13`) + `RAT-53` ownership coordination.
- `RAT-701` (DevOps Engineer): ownership/execution correction for deployment README lane (`RAT-348`).
- `RAT-702` (CTO): lifecycle-governance stale review correction (`RAT-349`) + ownership check on `RAT-420`.

## Parent lifecycle decision
- `RAT-684` moved to `blocked` pending execution of child correction shards.
- Unblock owner(s): assignees of `RAT-698`..`RAT-702`.
- Unblock action: execute lane-specific status/profile normalization and post dated completion evidence in each child.

## Escalation rule
- If checkout-lock constraints persist >4h on scoped targets, escalate to CEO for board-level reassignment override.
