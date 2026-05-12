# RAT-370 Investigation: repeated status regression on completed CS review issue (2026-05-11)

## Scope
Identify why completed CS review issue `RAT-62` kept leaving `done` without new scope/comments.

## Findings
From issue activity on `RAT-62`:

- 2026-05-11T03:33:21.855Z: `done -> todo` by actor `72184141-ba4a-4857-abe9-90fbe439b058` (CEO) in run `7ca36504-5390-4081-afb2-e43370fa7e82`.
- 2026-05-11T03:33:51.463Z: assignee re-closed `in_progress -> done`.
- 2026-05-11T03:34:09.173Z: `done -> todo` again by same CEO actor/run.
- 2026-05-11T03:34:40.002Z: assignee re-closed `in_progress -> done`.
- 2026-05-11T03:35:07.061Z: `done -> todo` again by same CEO actor/run.
- 2026-05-11T03:35:32.278Z: assignee re-closed `in_progress -> done`.

No new customer comments or scope deltas were present during these transitions.

## Correlation
Pattern matches prior lifecycle churn observed on `RAT-133` (`done/blocked` repeatedly reset by CEO run `7ca36504-5390-4081-afb2-e43370fa7e82`) and documented in `docs/analysis/rat-361-rat-133-status-auto-reopen-investigation-2026-05-11.md`.

## Conclusion
Regression source is lifecycle automation churn (parent/run-driven status normalization), not human/manual reopening and not new CS workload.

## Guardrail
Terminal/blocked issues must be sticky unless one of the following exists:

- explicit `resume: true`
- auditable delta: new scope/comment/assignment/blocker change requiring execution

Without those conditions, run orchestration must not rewrite `done` or `blocked` to `todo`/`in_progress`.

## Next Action
Apply/extend the reopen guardrail in the same lineage handling `RAT-361` so completed review tasks do not auto-wake assignees without execution deltas.
