# RAT-698 — Backend stale `in_progress` queue normalization (2026-05-11)

Issue: [RAT-698](/RAT/issues/RAT-698)  
Parent: [RAT-684](/RAT/issues/RAT-684)

## Scope from wake payload

Normalize stale backend lane issues:

- RAT-323
- RAT-26
- RAT-67
- RAT-347

## Execution evidence

Paperclip API mutations executed from this workspace (`PAPERCLIP_API_URL`):

- `PATCH /api/issues/{id}` with `{ "status": "blocked" }`
- `POST /api/issues/{id}/comments` with explicit unblock owner/action

### Results

1. `RAT-323`: `in_progress -> blocked` (success)
2. `RAT-26`: `in_progress -> blocked` (success)
3. `RAT-67`: `in_progress -> blocked` (success)
4. `RAT-347`: mutation rejected (checked out by another agent)

Error for `RAT-347`:

- `Issue is checked out by another agent`
- `assigneeAgentId=fc93a46a-8b11-49ce-bd4e-bef85305c551`

## Blocker declaration

`RAT-347` cannot be normalized by this agent until checkout ownership is released or board/CTO overrides assignment.

- Unblock owner: @CTO / board operations
- Unblock action: release/reassign checkout on `RAT-347`, then apply same normalization step (`in_progress -> blocked`) with unblock-owner comment.

## Architectural note

Requested prerequisite `ADR.md` is not present in this workspace (no `ADR.md` found via repository scan), so this heartbeat followed existing queue-normalization patterns already documented in `docs/analysis`.

## Goal gate

Partial pass: 3/4 stale backend issues normalized. Remaining item is blocked by cross-agent checkout lock.
