# RAT-407 Heartbeat: Prevent repeated reopen drift for completed productivity-review issues (2026-05-11)

## Scope
Issue: `RAT-407` (medium priority)

Objective: prevent repeated reopen drift on completed productivity-review issues when there is no new scope, comment, blocker, or assignee delta.

## Heartbeat Actions
1. Revalidated wake payload context: assignment wake, no pending comments, no explicit scope delta.
2. Rechecked executable ownership in this workspace (`/Users/martinmarquez/uber-services`).
3. Confirmed required mutation surfaces are not present here: Paperclip control-plane issue lifecycle transition engine, checkout reopen gate, and status-change wake dedupe path.
4. Anchored this issue to existing defect lineage (`RAT-390`, `RAT-404`, `RAT-406`, `RAT-410`, `RAT-411`, `RAT-412`).

## Finding
`RAT-407` is another instance of the known control-plane lifecycle integrity defect class (`done/cancelled -> active` drift without explicit resume intent), not a productivity-review domain execution gap in this repository.

## Blocker Declaration
`RAT-407` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Enforce terminal-state immutability in issue transitions (`done`/`cancelled`) unless explicit `resume:true` is provided with auditable actor/reason.
  2. Make checkout non-mutating for terminal issues when resume intent is absent.
  3. Deduplicate/suppress no-delta `issue_status_changed` wakes that currently recycle terminal issues.
  4. Provide API/service replay evidence for:
     - terminal + automation/no-resume => no reopen,
     - terminal + checkout/no-resume => non-mutating,
     - explicit `resume:true` => reopen allowed with audit metadata,
     - repeated no-delta wakes => reopen count remains 0.

## Next Action
After control-plane patch + replay evidence is attached by the owning runtime team, run targeted regression validation for this defect family and close `RAT-407`.
