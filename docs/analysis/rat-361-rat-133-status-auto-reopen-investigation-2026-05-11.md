# RAT-361 Investigation: RAT-133 status auto-reopen churn (2026-05-11)

## Scope
Investigate why `RAT-133` repeatedly moved out of terminal state without scope/comment deltas.

## Evidence

1. `RAT-133` transition sequence from issue activity (`/api/issues/388a24f8-4a23-456f-9e2b-46b624cb2030/activity`):
- 2026-05-11T03:32:49.943Z: `done -> todo` by actor `72184141-ba4a-4857-abe9-90fbe439b058` (run `7ca36504-5390-4081-afb2-e43370fa7e82`)
- 2026-05-11T03:33:04.091Z: `in_progress -> done` by assignee `0472b077-0242-486a-8fd3-9ef248206448`
- 2026-05-11T03:33:49.401Z: `done -> todo` by run `7ca36504-5390-4081-afb2-e43370fa7e82`
- 2026-05-11T03:34:01.175Z: `in_progress -> done` by assignee
- 2026-05-11T03:34:06.823Z: `done -> todo` by run `7ca36504-5390-4081-afb2-e43370fa7e82`
- 2026-05-11T03:34:43.722Z: `in_progress -> done` by assignee
- 2026-05-11T03:35:05.764Z: `done -> todo` by run `7ca36504-5390-4081-afb2-e43370fa7e82`
- 2026-05-11T03:35:22.891Z: `in_progress -> blocked` by assignee (explicitly marking churn blocker)
- 2026-05-11T03:35:44.059Z: `blocked -> todo` by run `7ca36504-5390-4081-afb2-e43370fa7e82`

2. Parent issue (`RAT-69`) in the same run:
- 2026-05-11T03:33:02.857Z: `done -> todo` by actor `72184141-ba4a-4857-abe9-90fbe439b058` (same run `7ca36504-5390-4081-afb2-e43370fa7e82`).

3. `RAT-133` thread comments during the churn window explicitly report "auto-woken again" and "no new implementation delta".

## Conclusion
This is lifecycle automation churn, not feature-scope activity on `RAT-133`.

Most probable path: parent-level reopen/requeue flow (`RAT-69` run `7ca...`) cascades child status normalization into non-terminal states (`todo`), even when child has no explicit resume signal and no new scope/comment delta.

## Guardrail required
- Terminal child issues (`done`/`cancelled`) must remain terminal unless there is explicit `resume: true` or an auditable delta (new scope/blocker/comment/assignment requiring work).
- Parent status transitions must not silently rewrite child terminal states.
- `blocked` state should also be sticky unless unblock evidence is present.

## Next action
Use this evidence to validate and/or extend the reopen guardrails already being implemented under `RAT-364` lineage so parent run cascades cannot rewrite terminal children without explicit resume semantics.
