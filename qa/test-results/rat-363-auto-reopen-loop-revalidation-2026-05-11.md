# RAT-363 Auto-Reopen Loop Revalidation (2026-05-11)

## Objective
Validate that RAT-115-style lifecycle loops are blocked when there is no new context delta.

## Evidence Inputs
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `qa/test-results/rat-8-reopen-revalidation-2026-05-11.md`

## Replay Criteria
1. Terminal issue receives automation/status-changed wake.
2. No new comment, scope, blocker, or assignee delta is present.
3. System must preserve terminal status (no reopen).

## Result
- PASS: No-delta reopen is treated as invalid transition.
- PASS: Terminal state is preserved without explicit `resume: true`.
- PASS: Loop pattern documented in RAT-355 is covered by the guardrail in RAT-364 and applied as policy in RAT-363.

## Notes
This is workflow integrity validation aligned to existing platform rule artifacts. No additional product-scope change introduced.
